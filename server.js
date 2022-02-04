/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___Lei Du____________ Student ID: __047587134___ Date: __Feb.4, 2022___
*
*  Online (Heroku) URL: ___https://powerful-retreat-41504.herokuapp.com/________
*
*  GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 

const express = require('express');
const app = express();

const path = require('path');
const blogService = require('./blog-service')

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
    //res.send('hello blog');
    blogService.getPublishedPosts().then((data) => {
        res.json(data)
    }).catch((err) => {
        console.log(err)
        res.status(404).send("ERROR!")
    })
});

app.get("/posts", (req, res) => {
    //res.send('hello posts')
    blogService.getAllPosts().then((data) => {
        res.json(data)
    }).catch((err) => {
        console.log(err)
        res.status(404).send("ERROR!")
    })
})

app.get("/categories", (req, res) => {
    //res.send('hello categories')
    blogService.getCategories().then((data) => {
        res.json(data)
    }).catch((err) => {
        console.log(error)
        res.status(404),send("ERROR!")
    })
})

app.use((req, res) => {
    res.status(404).send("PAGE NOT FOUND")
})

//app.listen(HTTP_PORT, onHttpStart)

blogService.initialize().then((data) => {
        app.listen(HTTP_PORT, onHttpStart)
}).catch((err) => {
    "ERROR"
})