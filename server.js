/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___Lei Du____________ Student ID: __047587134___ Date: __Feb.18, 2022__
*
*  Online (Heroku) URL: ___https://powerful-retreat-41504.herokuapp.com/________
*
*  GitHub Repository URL: __https://github.com/ldu13/web322-app_________________
*
********************************************************************************/ 

const express = require('express');
const app = express();

const path = require('path');
const blogService = require('./blog-service')

// p2-1.2 "require" the libraries
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

// p2-1.3 set the cloudinary config 
cloudinary.config({
    cloud_name: 'dy4lvwzwx',
    api_key: '499561859453452',
    api_secret: 'qqTODAeJy6K-jaXWUVQKSunB6A8',
    secure: true
});

// p2-1.4 create an "upload" variable without any disk storage 
// (multer middleware)
// no { storage: storage } since we are not using disk storage
const upload = multer(); 

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
    blogService.getPublishedPosts().then((data) => {
        res.json(data)
    }).catch((error) => {
        console.log(error)
        res.status(500).send("ERROR!")
    })
});

// p3-1 Update the "/posts" route 
app.get("/posts", (req, res) => {   
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            res.json(data)
        }).catch((error) => {
            res.json(error)
        })        
    }
    else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            res.json(data)
        }).catch((error) => {
            res.json(error)
        })
    }
    else {
        blogService.getAllPosts().then((data) => {
            res.json(data)
        }).catch((error) => {
            res.json(error)
        })
    }
})

app.get("/categories", (req, res) => {
    blogService.getCategories().then((data) => {
        res.json(data)
        //res.send(data)
    }).catch((error) => {
        console.log(error)
        res.status(500),send("ERROR!")
    })
})

// p1-2 Adding a routes in server.js to support the new view
app.get("/posts/add", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
})

// p3-2 Add the "/post/value" route 
app.get("/post/:value", (req,res) => {
    blogService.getPostById(req.params.value).then((data) => {
        res.json(data)
    }).catch((error) => {
        res.json(error)
    })
})

// p2-2 add the route: POST /posts/add
// add the middleware function (upload.single("photo")) for multer
// to process the file upload in the form
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    // process the req.body and add it as a new Blog Post 
    // before redirecting to /posts
        upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        console.log(req.body)
        
        blogService.addPost(req.body).then((data) => {
            res.redirect("/posts")
        }).catch((error) => {
            res.status(500).send(error)
        })  
    });  
})

app.use((req, res) => {
    res.status(404).send("PAGE NOT FOUND")
})

//app.listen(HTTP_PORT, onHttpStart)

blogService.initialize().then((data) => {
        app.listen(HTTP_PORT, onHttpStart)
}).catch((error) => {
    "ERROR"
})


// Part 1: Adding / Updating Static .html & Directories
  // Step 1: Modifying about.html
  // Step 2: Adding a routes in server.js to support the new view (p1-2)
  // Step 3: Adding new file: addPost.html

// Part 2: Adding Routes / Middleware to Support Adding Posts
  // Step 1: Adding multer, cloudinary and streamifier (p2-1.1-npm, p2-1.2, p2-1.3, p2-1.4)
  // Step 2: Adding the "Post" route (p2-2)
  // Step 3: Adding an "addPost" function within blog-service.js (p2-3)
  // Step 4: Verify your Solution 

// Part 3: Adding New Routes to query "Posts"
  // Step 1: Update the "/posts" route (p3-1)
  // Step 2: Add the "/post/value" route (p3-2)

// Part 4: Updating "blog-service.js" to support the new "Post" routes
  // Step 1: Add the getPostsByCategory(category) Function (p4-1)
  // Step 2: Add the getPostsByMinDate(minDateStr) Function (p4-2)
  // Step 3: Add the getPostById(id) Function (p4-3)