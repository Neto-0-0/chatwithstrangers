const Express = require("express");
const app = Express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const handlebars = require("express-handlebars");

//PASTA PUBLICA
app.use(Express.static(__dirname + '/public'));
//CONFIG. HANDLEBARS
app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", 'handlebars');
//ROTA PRINCIPAL
app.get('/', (req, res) =>{
    res.render("index");
});
//ARRAY DOS CLIENTES CONECTADOS
let clientsList = [];
io.on("connection", socket =>{
    clientsList.push({ // Adiciona um novo usuário ao se conectar
        id: socket.id,
        status: "off",
        chatting_with: "nobody"
    });

    socket.on("connected", (msg) =>{ //Verifica se o usuário conseguiu se conectar
        socket.emit("client-connected");
    });

    socket.on("search-chat", () =>{ //Inicia uma busca por um usuário online
        socket.to(getWithChatting(socket.id)).emit("disconnected-user", "Stranger disconnected!");
        setChatting(getWithChatting(socket.id), "nobody");
        setChatting(socket.id, "nobody");
        setStatus(socket.id, "searching");
        for(var i = 0; i < clientsList.length; i++){   
            if(clientsList[i].status == "searching" && clientsList[i].id != socket.id){
                clientsList[i].chatting_with = socket.id;
                clientsList[i].status = "in-chat";
                setStatus(socket.id, "in-chat");
                setChatting(socket.id, clientsList[i].id);

                socket.emit('chatting', clientsList[i].id);
                socket.to(clientsList[i].id).emit('chatting', socket.id);
                i = clientsList.length;
            }
        }
    });

    socket.on("sent-message", msg =>{ //Usuário envia uma mensagem privada
        socket.to(getWithChatting(socket.id)).emit("received-message", msg);
    });

    socket.on("reset-chatting", ()=>{ //Usuário encerra um chat
        if(getWithChatting != "nobody"){
            socket.to(getWithChatting(socket.id)).emit("disconnected-user", "Stranger disconnected!");
            setChatting(getWithChatting(socket.id), "nobody");
            setStatus(getWithChatting(socket.id), "off");
        }
        setChatting(socket.id, "nobody");
        setStatus(socket.id, "off");
    });

    socket.on("typing", ()=>{ //Verifica quando o outro usuário está digitando
        if(getWithChatting != "nobody"){
            socket.to(getWithChatting(socket.id)).emit("stranger-typing", "Stranger is typing...");
        }
    });

    socket.on("is-typing", (b) =>{  //Verifica quando o usuário está digitando
        if(getWithChatting(socket.id) != "nobody"){
            socket.to(getWithChatting(socket.id)).emit("typing", b);
        }
    });

    socket.on("get-online-users", () =>{ //Retorna quantos usuários estão conectados
        socket.emit("online-users", "ONLINE USERS: "+clientsList.length);
    });

    socket.on("disconnect", ()=>{ //Quando o usuário for desconectado
        if(getWithChatting(socket.id) != "nobody"){
            socket.to(getWithChatting(socket.id)).emit("disconnected-user", "Stranger disconnected!");
            setChatting(getWithChatting(socket.id), "nobody");
            setStatus(getWithChatting(socket.id), "off");
        }
        for(var i = 0; i<clientsList.length; i++){
            if(clientsList[i].id == socket.id){
                clientsList.splice(i, 1);
            }
        }
    });

});

function getWithChatting(id){//Retorna o usuário com quem está conversando
    for(var i = 0; i < clientsList.length; i++){
        if(clientsList[i].id == id){
            return clientsList[i].chatting_with;
        }
    }
}
function setStatus(id, status){ //Define um status para o usuário
    for(var i = 0; i < clientsList.length; i++){
        if(clientsList[i].id == id){
            clientsList[i].status = status;
        }
    }
}
function setChatting(id, with_){ //Define o usuário com quem está conversando
    for(var i = 0; i < clientsList.length; i++){
        if(clientsList[i].id == id){
            clientsList[i].chatting_with = with_;
        }
    }
}
//START SERVER
server.listen(process.env.PORT || 3000);