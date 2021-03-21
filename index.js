const Express = require("express");
const app = Express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const handlebars = require("express-handlebars");

//FOLDER PUBLIC
app.use(Express.static(__dirname + '/public'));

//CONFIG. HANDLEBARS
app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", 'handlebars');

//MAIN ROUTE
app.get('/', (req, res) =>{
    res.render("index");
});

//ARRAY OF CONNECTED USERS
let clientsList = [];


io.on("connection", socket =>{

//ADD USER TO ARRAY
    clientsList.push({
        id: socket.id,
        status: "off",
        chatting_with: "nobody"
    });

//VERIFY IF USER IS CONNECTED TO SOCKET.IO
    socket.on("connected", (msg) =>{
        socket.emit("client-connected");
    });


//SEARCH USER FOR CHATTING
    socket.on("search-chat", () =>{
        socket.to(getWithChatting(socket.id)).emit("disconnected-user", "Stranger disconnected!");
        setChatting(getWithChatting(socket.id), "nobody");
        setChatting(socket.id, "nobody");
        setStatus(socket.id, "searching");
        //console.log(clientsList);

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
        //console.log(clientsList);
    });

//USER SENT A PRIVATE MESSAGE
    socket.on("sent-message", msg =>{
        //console.log(msg);
        socket.to(getWithChatting(socket.id)).emit("received-message", msg);
    });

//USER LEAVE CHAT
    socket.on("reset-chatting", ()=>{
        if(getWithChatting != "nobody"){
            socket.to(getWithChatting(socket.id)).emit("disconnected-user", "Stranger disconnected!");
            setChatting(getWithChatting(socket.id), "nobody");
            setStatus(getWithChatting(socket.id), "off");
        }
        setChatting(socket.id, "nobody");
        setStatus(socket.id, "off");
    });

    //USER IS TYPING
    socket.on("typing", ()=>{
        if(getWithChatting != "nobody"){
            socket.to(getWithChatting(socket.id)).emit("stranger-typing", "Stranger is typing...");
        }
    });

//USER IS DISCONNECTED FROM THE SERVER
    socket.on("disconnect", ()=>{
        if(getWithChatting != "nobody"){
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


})


//READY FUCTIONS
function getWithChatting(id){
    for(var i = 0; i < clientsList.length; i++){
        if(clientsList[i].id == id){
            return clientsList[i].chatting_with;
        }
    }
}

function setStatus(id, status){
    for(var i = 0; i < clientsList.length; i++){
        if(clientsList[i].id == id){
            clientsList[i].status = status;
        }
    }
}
function setChatting(id, with_){
    for(var i = 0; i < clientsList.length; i++){
        if(clientsList[i].id == id){
            clientsList[i].chatting_with = with_;
        }
    }
}

//START SERVER
server.listen(process.env.PORT || 3000, () => {
    console.log("Servidor rodando em: http://localhost:3000");
})