
function inputEnter(e){
    if(e.keyCode == 13){
        document.getElementById("send").click();
    }
}

function renderMessage(){
    let msg = document.querySelector("#msg").value;
    if(msg.trim() != ""){
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class", "wrapper");
        let divMsg = document.createElement("div");
        divMsg.setAttribute("class", "ballon sent float-end shadow");
        let h3 = document.createElement("h3");
        h3.innerText = "You";
        let p = document.createElement("p");
        p.innerText = msg;

        divMsg.appendChild(h3);
        divMsg.appendChild(p);
        divContainer.appendChild(divMsg);
        document.querySelector(".messages").appendChild(divContainer);
        divContainer.style.animation = "0.5s ballon-chat";
    }

    $('.chat, body').animate({
        scrollTop: ($(".scrollTarget").offset().top)
    },500);

    document.querySelector("#msg").value = "";

}
function renderStrgMessage(msg){
    if(msg.trim() != ""){
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class", "wrapper");
        let divMsg = document.createElement("div");
        divMsg.setAttribute("class", "ballon received float-start shadow");
        let h3 = document.createElement("h3");
        h3.innerText = "Stranger";
        let p = document.createElement("p");
        p.innerText = msg;

        divMsg.appendChild(h3);
        divMsg.appendChild(p);
        divContainer.appendChild(divMsg);
        document.querySelector(".messages").appendChild(divContainer);
        divContainer.style.animation = "0.5s ballon-chat";
        
        $('.chat, body').animate({
            scrollTop: ($(".scrollTarget").offset().top)
        },500);

    }
}
function renderServerMessage(msg){
    if(msg.trim() != ""){
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class", "wrapper");
        let divMsg = document.createElement("div");
        divMsg.setAttribute("class", "server float-start shadow");
        let h3 = document.createElement("h3");
        h3.innerText = msg;
        divMsg.appendChild(h3);
        divContainer.appendChild(divMsg);
        document.querySelector(".messages").appendChild(divContainer);
        divContainer.style.animation = "0.5s ballon-chat";
        
        $('.chat, body').animate({
            scrollTop: ($(".scrollTarget").offset().top)
        },500);

    }
}
function buttonMsg(msg, onclick){
    if(msg.trim() != ""){
        let divContainer = document.createElement("div");
        divContainer.setAttribute("class", "wrapper");
        let divMsg = document.createElement("div");
        divMsg.setAttribute("class", "received p-2 float-start shadow");
        let btn = document.createElement("button");
        btn.setAttribute("class", "btn btn-success");
        btn.setAttribute("onclick", onclick+"()");
        btn.innerText = msg;
        divMsg.appendChild(btn);
        divContainer.appendChild(divMsg);
        document.querySelector(".messages").appendChild(divContainer);
        divContainer.style.animation = "0.5s ballon-chat";
        
        $('.chat, body').animate({
            scrollTop: ($(".scrollTarget").offset().top)
        },500);

    }
}

function getTips(){
    return Math.floor(Math.random() * tips.length);
}

function renderTips(){
    var textTips = tips[getTips()];

    var h4 = document.createElement("h4");
    h4.setAttribute("class", "h5");
    h4.innerHTML = "Você está em uma conversa!";

    var p = document.createElement("p");
    p.setAttribute("class", textTips.class);
    p.innerHTML = textTips.text;

    document.querySelector(".information").appendChild(h4);
    document.querySelector(".information").appendChild(p);
}

// Functions SOCKET.IO
let socket = io.connect("192.168.0.101:3000");

socket.emit("get-online-users");
setInterval(function(){
    socket.emit("get-online-users");
}, 15000);


function newChat(){
    document.querySelector(".information").innerHTML = "";
    document.querySelector(".messages").innerHTML = "";
    document.querySelector("#searching").setAttribute("class", "d-flex justify-content-center position-absolute top-50 start-50 translate-middle");
    document.querySelector("#new-chat").setAttribute("class", "invisible d-flex justify-content-center position-absolute top-50 start-50 translate-middle");
    document.querySelector("#loading").setAttribute("class", "spinner-border text-light");
    socket.emit("search-chat");
}

function startNewChat(){
    var conf = confirm("Deseja sair do bate papo?");
    if(conf){
        document.querySelector(".information").innerHTML = "";
        document.querySelector("#msg").readOnly = true;
        document.querySelector("#msg").setAttribute("placeholder", "Start a new chat...");
        document.querySelector("#send").setAttribute("class", "col-auto btn btn-outline-primary disabled");
        document.querySelector("#refresh").setAttribute("class", "btn-group dropup invisible");

        document.querySelector(".messages").innerHTML = "";

        document.querySelector("#searching").setAttribute("class", "d-flex justify-content-center position-absolute top-50 start-50 translate-middle");
        document.querySelector("#new-chat").setAttribute("class", "invisible d-flex justify-content-center position-absolute top-50 start-50 translate-middle");
        document.querySelector("#loading").setAttribute("class", "spinner-border text-light");
        socket.emit("search-chat");
    }
}

function stopChat(){
    var confi = confirm("Deseja sair do bate papo?");
    if(confi){
        document.querySelector("#msg").readOnly = true;
        document.querySelector("#msg").setAttribute("placeholder", "Start a new chat...");
        document.querySelector("#send").setAttribute("class", "col-auto btn btn-outline-primary disabled");
        document.querySelector("#refresh").setAttribute("class", "btn-group dropup invisible");

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
    document.querySelector(".controls").setAttribute("class", "controls");
    document.querySelector("#searching").setAttribute("class", "invisible");
    document.querySelector("#msg").readOnly = false;

    renderTips();

    document.querySelector("#msg").setAttribute("placeholder", "Type a message...");
    document.querySelector("#send").setAttribute("class", "col-auto btn btn-outline-primary");
    document.querySelector("#refresh").setAttribute("class", "btn-group dropup");
});


socket.on("disconnected-user", function(msg){
    document.querySelector("#msg").readOnly = true;
    document.querySelector("#msg").setAttribute("placeholder", "Start a new chat...");
    document.querySelector("#send").setAttribute("class", "col-auto btn btn-outline-primary disabled");
    document.querySelector("#refresh").setAttribute("class", "btn-group dropup invisible");
    renderServerMessage(msg);
    buttonMsg("Start a new chat!", "newChat");
    socket.emit("reset-chatting");
});

socket.on("online-users", function(msg){
    document.querySelector("#online-users").innerText = msg;
})


socket.emit("connected");

socket.on("client-connected", function(data){
    document.querySelector("#searching").setAttribute("class", "invisible");
    document.querySelector("#new-chat").setAttribute("class", "visible d-flex justify-content-center position-absolute top-50 start-50 translate-middle");
});
