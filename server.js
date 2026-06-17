const express = require("express");
const http = require("http");
const fs = require("fs");
const cors = require("cors");
const { Server } = require("socket.io"); 

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

// اگر فایل پیام‌ها وجود نداشت بساز
if(!fs.existsSync("messages.json")){
    fs.writeFileSync(
        "messages.json",
        "[]"
    );
}

app.get("/",(req,res)=>{
    res.send("MiniChat Online");
});

// دریافت پیام‌های قبلی
app.get("/messages",(req,res)=>{

    const messages =
        JSON.parse(
            fs.readFileSync(
                "messages.json",
                "utf8"
            )
        );

    res.json(messages);
});

io.on("connection",(socket)=>{

    console.log("User Connected");

    socket.on(
        "send-message",
        (data)=>{

            let messages =
                JSON.parse(
                    fs.readFileSync(
                        "messages.json",
                        "utf8"
                    )
                );

            messages.push(data);

            fs.writeFileSync(
                "messages.json",
                JSON.stringify(
                    messages,
                    null,
                    2
                )
            );

            io.emit(
                "new-message",
                data
            );
        }
    );

    socket.on("disconnect",()=>{
        console.log("User Left");
    });

});

server.listen(
    process.env.PORT || 3000,
    ()=>{
        console.log("Server Started");
    }
);
