/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___Lei Du____________ Student ID: __047587134___ Date: __Mar.11, 2022__
*
*  Online (Heroku) URL: ___https://powerful-retreat-41504.herokuapp.com/________
*
*  GitHub Repository URL: __https://github.com/ldu13/web322-app_________________
*
********************************************************************************/ 

const express = require('express');
const app = express();
const env = require('dotenv');
env.config()

const path = require('path');
const blogService = require('./blog-service')
const blogData = require('./blog-service')

const multer = require('multer');
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

// a4
const exphbs = require('express-handlebars');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});

const stripJs = require('strip-js');

const upload = multer(); 

const HTTP_PORT = process.env.PORT || 8080;

const onHttpStart = () => {
    console.log("Express http server listening on " + HTTP_PORT);
}

// a4 - handlebars
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }                     
    }
}));
app.set('view engine', '.hbs');

app.use(express.static('public')); 

// a4 - middleware function
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get("/", (req, res) => {
    res.redirect("/blog");
});

// a4
app.get("/about", (req, res) => {
    //res.sendFile(path.join(__dirname, "/views/about.html"));
    blogService.getAllPosts().then((data) => {
        res.render('about', {
            data: data,
            layout: 'main'
        })
    })
});

// a4 - replace the current app.get("/blog") route 
// app.get("/blog", (req, res) => {
//     blogService.getPublishedPosts().then((data) => {
//         res.json(data)
//     }).catch((error) => {
//         console.log(error)
//         res.status(500).send("ERROR!")
//     })
// });

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

// a4 - add the blog/:id route
app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

// a4
app.get("/posts", (req, res) => {   
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            //res.json(data)
            res.render("posts", {posts: data})
        }).catch((error) => {
            //res.json(error)
            res.render("posts", {message: "no results"});
        })        
    }
    else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            //res.json(data)
            res.render("posts", {posts: data})
        }).catch((error) => {
            //res.json(error)
            res.render("posts", {message: "no results"});
        })
    }
    else {
        blogService.getAllPosts().then((data) => {
            //res.json(data)
            res.render("posts", {posts: data})
        }).catch((error) => {
            //res.json(error)
            res.render("posts", {message: "no results"});
        })
    }
})

app.get("/categories", (req, res) => {
    blogService.getCategories().then((data) => {
        //res.json(data)
        res.render("categories", {categories: data});
    }).catch((error) => {
        console.log(error)
        //res.status(500),send("ERROR!")
        res.render("categories", {message: "no results"});
    })
})

app.get("/posts/add", (req, res) => {
    //res.sendFile(path.join(__dirname, "/views/addPost.html"));
    blogService.addPost().then((data) => {
        res.render('addPost', {
            data: data,
            layout: 'main'
        })
    })
    
})

app.get("/post/:value", (req,res) => {
    blogService.getPostById(req.params.value).then((data) => {
        res.json(data)
    }).catch((error) => {
        res.json(error)
    })
})

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
    console.log(error)
})