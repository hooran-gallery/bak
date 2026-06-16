const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST");
    next();
});

// تست سرور
app.get("/", (req, res) => {
    res.send("Server Online");
});

// تست ثبت نام
app.get("/register", (req, res) => {
    res.send("Register Route Works");
});

// ثبت نام
app.post("/register", (req, res) => {

    const { username, password } = req.body;

    let users = [];

    if (fs.existsSync("users.json")) {
        users = JSON.parse(
            fs.readFileSync("users.json", "utf8")
        );
    }

    const exist = users.find(
        user => user.username === username
    );

    if (exist) {
        return res.json({
            success: false,
            message: "این نام کاربری قبلاً ثبت شده است"
        });
    }

    users.push({
        username,
        password
    });

    fs.writeFileSync(
        "users.json",
        JSON.stringify(users, null, 2)
    );

    res.json({
        success: true,
        message: "ثبت نام موفق"
    });

});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server Started");
});
