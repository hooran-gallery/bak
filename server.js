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

app.get("/",(req,res)=>{
    res.send("MiniChat Online");
});

io.on("connection",(socket)=>{

    console.log("User Connected");

    socket.on("send-message",(data)=>{

        io.emit("new-message",data);

    });

    socket.on("disconnect",()=>{
        console.log("User Left");
    });

});

server.listen(process.env.PORT || 3000,()=>{
    console.log("Server Started");
});
