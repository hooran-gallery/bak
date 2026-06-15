const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

io.on("connection",(socket)=>{

    console.log("کاربر وصل شد");

    socket.on("chat-message",(msg)=>{

        io.emit("chat-message",msg);

    });

});

server.listen(3000,()=>{
    console.log("Server Started");
});