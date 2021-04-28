
function inputEnter(e){
    if(e.keyCode == 13){
        document.getElementById("send").click();
    }
}

function renderMessage(){
    let msg = document.querySelector("#msg").value;
    if(msg.trim() != ""){
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class", "my-msg w-full mt-10 mb-12 flex justify-end");
        let divMsg = document.createElement("div");
        divMsg.setAttribute("class", "bg-green-200 break-all p-2 border border-green-300 rounded-lg rounded-tr-none shadow-lg");
        let h2 = document.createElement("h2");
        h2.setAttribute("class", "font-medium");
        h2.innerText = "You";
        let h3 = document.createElement("h3");
        h3.innerText = msg;

        divMsg.appendChild(h2);
        divMsg.appendChild(h3);
        divContainer.appendChild(divMsg);
        document.querySelector(".messages").appendChild(divContainer);
        divContainer.style.animation = "0.5s message";
    }

    $('.messagesBody, body').animate({
        scrollTop: ($(".scrollTarget").offset().top)
    },500);

    document.querySelector("#msg").value = "";

}

function renderStrgMessage(msg){
    if(msg.trim() != ""){
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class", "user-msg w-full mt-10 mb-12 flex justify-start");
        let divMsg = document.createElement("div");
        divMsg.setAttribute("class", "bg-gray-100 break-all border border-white p-2 rounded-lg rounded-tl-none shadow-lg");
        let h2 = document.createElement("h2");
        h2.setAttribute("class", "font-medium");
        h2.innerText = "Stranger";
        let h3 = document.createElement("h3");
        h3.innerText = msg;

        divMsg.appendChild(h2);
        divMsg.appendChild(h3);
        divContainer.appendChild(divMsg);
        document.querySelector(".messages").appendChild(divContainer);
        divContainer.style.animation = "0.5s message";
        
        $('.messagesBody, body').animate({
            scrollTop: ($(".scrollTarget").offset().top)
        },500);

    }
}

function renderServerMessage(msg){
    if(msg.trim() != ""){
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class", "user-msg w-full mt-10 mb-12 flex justify-start");
        let divMsg = document.createElement("div");
        divMsg.setAttribute("class", "bg-red-600 border border-red-700 p-2 rounded-lg rounded-tl-none shadow-lg");
        let h3 = document.createElement("h3");
        h3.setAttribute("class", "text-white font-bold");
        h3.innerText = msg;
        divMsg.appendChild(h3);
        divContainer.appendChild(divMsg);
        document.querySelector(".messages").appendChild(divContainer);
        divContainer.style.animation = "0.7s message";
        
        $('.messagesBody, body').animate({
            scrollTop: ($(".scrollTarget").offset().top)
        },500);

    }
}

function buttonMsg(msg, onclick){
    if(msg.trim() != ""){
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class", "user-msg w-full mt-10 mb-12 flex justify-start");
        let divMsg = document.createElement("div");
        divMsg.setAttribute("class", "bg-gray-100 border border-white p-2 rounded-lg rounded-tl-none shadow-lg");
        let btn = document.createElement("button");
        btn.setAttribute("class", "text-white text-xl font-bold bg-green-600 p-3 rounded hover:text-gray-100 hover:bg-green-700");
        btn.setAttribute("onclick", onclick+"()");
        btn.innerText = msg;
        divMsg.appendChild(btn);
        divContainer.appendChild(divMsg);
        document.querySelector(".messages").appendChild(divContainer);
        divContainer.style.animation = "0.7s message";
        
        $('.messageBody, body').animate({
            scrollTop: ($(".scrollTarget").offset().top)
        },500);

    }
}

function getTips(){
    return Math.floor(Math.random() * tips.length);
}

function renderTips(){
    var textTips = tips[getTips()];

    var div = document.createElement("div");
    div.setAttribute("class", textTips.class);

    var h3 = document.createElement("h3");
    h3.setAttribute("class", "text-center text-white font-bold");
    h3.innerHTML = textTips.text;

    div.appendChild(h3);
    document.querySelector(".information").appendChild(div);
}

//------SOCKET.IO------------------------------------------------------
let socket = io.connect("https://chatwith-strangers.herokuapp.com");

socket.emit("get-online-users");
setInterval(function(){
    socket.emit("get-online-users");
}, 15000);


function newChat(){
    document.querySelector(".information").innerHTML = "";
    document.querySelector(".messages").innerHTML = "";
    document.querySelector("#searching").setAttribute("class", "w-full h-full items-center flex justify-center");
    document.querySelector("#new-chat").setAttribute("class", "hidden");
    document.querySelector("#loading").setAttribute("style", "border-top-color: #14b91c;");
    socket.emit("search-chat");
}

function startNewChat(){
    var conf = confirm("Deseja sair do bate papo?");
    if(conf){
        document.querySelector(".information").innerHTML = "";
        document.querySelector("#inputs").setAttribute("class", "hidden");
        document.querySelector(".messages").innerHTML = "";

        document.querySelector("#searching").setAttribute("class", "w-full h-full items-center flex justify-center");
        document.querySelector("#new-chat").setAttribute("class", "hidden");
        document.querySelector("#loading").setAttribute("style", "border-top-color: #14b91c;");
        socket.emit("search-chat");
    }
}

function stopChat(){
    var confi = confirm("Deseja sair do bate papo?");
    if(confi){
        document.querySelector("#inputs").setAttribute("class", "hidden");
        buttonMsg("Start a new chat!", "newChat");
        socket.emit("reset-chatting");
    }
}

function send(){
    var msg = document.querySelector("#msg").value;

    renderMessage(msg);

    socket.emit("sent-message", msg);
    
    document.querySelector("#msg").value = "";
}
socket.on("received-message", function(msg){
    renderStrgMessage(msg);
})

socket.on("chatting", function(id){
    document.querySelector(".messages").innerHTML = "";
    document.querySelector(".information").innerHTML = "";
    //alert("Chating with: "+ id);
    document.querySelector("#inputs").setAttribute("class", "flex sm:w-5/6 md:w-3/4 w-full m-auto relative");
    document.querySelector("#searching").setAttribute("class", "hidden");
    document.querySelector("#inputs").setAttribute("class", "flex sm:w-5/6 md:w-3/4 w-full m-auto relative");
    renderTips();
});


socket.on("disconnected-user", function(msg){
    document.querySelector("#inputs").setAttribute("class", "hidden");
    renderServerMessage(msg);
    buttonMsg("Start a new chat!", "newChat");
    socket.emit("reset-chatting");
});

socket.on("online-users", function(msg){
    document.querySelector("#online-users").innerText = msg;
});

socket.on("typing", function(b){
    var typingArea = document.querySelector("#typingArea");
    if(b){
        var typing = document.createElement('div');
        typing.setAttribute("id", "isTyping");
        typing.setAttribute("class", "typing user-msg w-full flex justify-start shadow-lg");

        var dot1 = document.createElement('div');
        dot1.setAttribute("class", "typing__dot");
        var dot2 = document.createElement('div');
        dot2.setAttribute("class", "typing__dot");
        var dot3 = document.createElement('div');
        dot3.setAttribute("class", "typing__dot");

        typing.appendChild(dot1);
        typing.appendChild(dot2);
        typing.appendChild(dot3);

        typingArea.appendChild(typing);
        $('.messagesBody, body').animate({
            scrollTop: ($(".scrollTarget").offset().top)
        },500);

        typing.style.animation = "0.5s message";
    }else{
        if(document.getElementById("isTyping")){
            document.getElementById("isTyping").remove();
        }
    }
    
    
})

socket.emit("connected");

socket.on("client-connected", function(data){
    document.querySelector("#searching").setAttribute("class", "hidden");
    document.querySelector("#new-chat").setAttribute("class", "w-full h-full items-center flex justify-center");
});
