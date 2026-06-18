const express = require("express");
const http = require("http");
const cors = require("cors");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
const { Server } = require("socket.io");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

const db = new sqlite3.Database("./database.db");

db.serialize(()=>{

    db.run(`
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            message TEXT,
            time TEXT
        )
    `);

});

let onlineUsers = {};

app.get("/",(req,res)=>{
    res.send("MiniChat Pro Online");
});

app.post("/register",async(req,res)=>{

    const {username,password} = req.body;

    if(!username || !password){

        return res.json({
            success:false,
            message:"اطلاعات ناقص است"
        });
    }

    const hash =
        await bcrypt.hash(
            password,
            10
        );

    db.run(
        `
        INSERT INTO users(
            username,
            password
        )
        VALUES(?,?)
        `,
        [username,hash],
        function(err){

            if(err){

                return res.json({
                    success:false,
                    message:"نام کاربری موجود است"
                });
            }

            res.json({
                success:true,
                message:"ثبت نام موفق"
            });
        }
    );

});

app.post("/login",(req,res)=>{

    const {username,password} = req.body;

    db.get(
        `
        SELECT *
        FROM users
        WHERE username=?
        `,
        [username],
        async(err,user)=>{

            if(!user){

                return res.json({
                    success:false,
                    message:"کاربر یافت نشد"
                });
            }

            const ok =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if(!ok){

                return res.json({
                    success:false,
                    message:"رمز اشتباه است"
                });
            }

            res.json({
                success:true,
                username:user.username
            });

        }
    );

});

app.get("/messages",(req,res)=>{

    db.all(
        `
        SELECT *
        FROM messages
        ORDER BY id ASC
        `,
        [],
        (err,rows)=>{

            res.json(rows);
        }
    );

});

io.on("connection",(socket)=>{

    socket.on(
        "user-online",
        (username)=>{

            onlineUsers[
                socket.id
            ] = username;

            io.emit(
                "online-users",
                Object.values(
                    onlineUsers
                )
            );
        }
    );

    socket.on(
        "send-message",
        (data)=>{

            db.run(
                `
                INSERT INTO messages(
                    username,
                    message,
                    time
                )
                VALUES(?,?,?)
                `,
                [
                    data.user,
                    data.text,
                    data.time
                ]
            );

            io.emit(
                "new-message",
                data
            );
        }
    );

    socket.on(
        "disconnect",
        ()=>{

            delete onlineUsers[
                socket.id
            ];

            io.emit(
                "online-users",
                Object.values(
                    onlineUsers
                )
            );
        }
    );

});

server.listen(
    process.env.PORT || 3000,
    ()=>{
        console.log(
            "MiniChat Pro Started"
        );
    }
);
