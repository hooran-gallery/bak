const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","*");
    next();
});

app.post("/register",(req,res)=>{

    const {username,password} = req.body;

    const users =
        JSON.parse(
            fs.readFileSync("users.json")
        );

    const exist =
        users.find(
            u => u.username === username
        );

    if(exist){
        return res.json({
            success:false,
            message:"کاربر وجود دارد"
        });
    }

    users.push({
        username,
        password
    });

    fs.writeFileSync(
        "users.json",
        JSON.stringify(users,null,2)
    );

    res.json({
        success:true
    });

});

app.listen(3000,()=>{
    console.log("Server Started");
});
