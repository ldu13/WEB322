const express = require("express");
const app = express();

const path = require("path");

const HTTP_PORT = process.env.PORT || 8080;

const onHttpStart = () => {
    console.log("Express http server listening on " + HTTP_PORT);
  }

app.use(express.static('public')); 

app.get("/", (req, res) => {
    res.redirect("/about");
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", (req, res) => {
    //const blog = req.blog;
    res.send("TODO: get all posts who have published==true")
    
});

app.listen(HTTP_PORT, onHttpStart);