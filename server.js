/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: ___Lei Du____________ Student ID: __047587134___ Date: __Apr. 8, 2022__
*
*  Online (Heroku) URL: ___https://powerful-retreat-41504.herokuapp.com/________
*
*  GitHub Repository URL: __https://github.com/ldu13/web322-app_________________
*
********************************************************************************/ 

const express = require("express");
const app = express();
const env = require("dotenv");
env.config()

const path = require("path");
const blogService = require("./blog-service")
const blogData = require("./blog-service")

const authData = require("./auth-service")
const clientSessions = require("client-sessions")

const multer = require("multer");
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier")

const exphbs = require("express-handlebars");

const stripJs = require("strip-js");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true
});

const upload = multer(); 

const HTTP_PORT = process.env.PORT || 8080;

const onHttpStart = () => {
    console.log("Express http server listening on " + HTTP_PORT);
}

app.use(express.static("public")); 

app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });


function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

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
        },  
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }      
    }
}));
app.set("view engine", ".hbs");



//////////////////////////////GET ROUTE//////////////////////////////
app.get("/", (req, res) => {
    res.redirect("/blog");
});

app.get("/about", (req, res) => {
    //res.render("about")
    res.render(path.join(__dirname, "/views/about.hbs"));
});

app.get("/blog", async (req, res) => {

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

app.get("/blog/:id", ensureLogin, async (req, res) => {

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


app.get("/posts", ensureLogin, (req, res) => {   
    if (req.query.category) {
        blogService.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0) {
                res.render("posts", {posts: data})
            } else {
                res.render("posts", {message: "no results"});
            }       
        }).catch(() => {
            res.render("posts", {message: "no results"});           
        })        
    }
    else if (req.query.minDate) {
        blogService.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0) {
                res.render("posts", {posts: data})
            } else {
                res.render("posts", {message: "no results"});
            }           
        }).catch(() => {
            res.render("posts", {message: "no results"});           
        })
    }
    else {
        blogService.getAllPosts().then((data) => {
            if (data.length > 0) {
                res.render("posts", {posts: data})
            } else {
                res.render("posts", {message: "no results"});
            }         
        }).catch(() => {
            res.render("posts", {message: "no results"});           
        })
    }
})

// app.get("/posts", ensureLogin,(req, res) => {
//     let category = req.query.category;
//     let minDate = req.query.minDate;

//     if (category) {
//         blogService.getPostsByCategory(category).then(data => {
//             if (data.length > 0) {
//                 res.render("posts", { posts: data });
//             }
//             else {
//                 res.render("posts", { message: "no results" });
//             }
//         })
//     }
//     else if (minDate != "" && minDate != null) {
//         blogService.getPostsByMinDate(minDate).then(data => {
//             if (data.length > 0) {
//                 res.render("posts", { posts: data });
//             }
//             else {
//                 res.render("posts", { message: "no results" });
//             }
//         })
//     }
//     else {
//         blogService.getAllPosts().then(data => {
//             if (data.length > 0) {
//                 res.render("posts", { posts: data });
//             }
//             else {
//                 res.render("posts", { message: "no results" });
//             }
//         })
//     }
// });

app.get("/posts/add", ensureLogin, (req, res) => {
    blogService.getCategories().then((data) => {
        res.render("addPost", {categories: data});
    }).catch((err) => {
        console.log(err)
        res.render("addPost", {categories: []}); 
    })
})

app.get("/post/:value", ensureLogin, (req,res) => {
    blogService.getPostById(req.params.value).then((data) => {
        res.render("posts", {posts: data})
    }).catch((err) => {
        res.render("posts", {message: "no results"});
    })
})

app.get("/posts/delete/:id", ensureLogin, (req, res) => {
    blogService.deletePostById(req.params.id).then(() => {
        res.redirect("/posts")
    }).catch((err) => {
        console.log(err)
        res.status(500).send("Unable to Remove Post / Post not found)")
    })
})


app.get("/categories", ensureLogin, (req, res) => {
    blogService.getCategories().then((data) => {
        if (data.length > 0) {
            res.render("categories", {categories: data});
        } else {
            res.render("categories", {message: "no results"});
        }        
    }).catch((err) => {
        console.log(err)
        res.render("categories", {message: "no results"});        
    })
})

app.get("/categories/add", ensureLogin, (req, res) => {
    res.render("addCategory")
    //res.render(path.join(__dirname, "/views/addCategory.hbs"));
})

app.get("/categories/delete/:id", ensureLogin, (req,res) => {
    blogService.deleteCategoryById(req.params.id).then(() => {
        res.redirect("/categories")
    }).catch(() => {
        res.status(500).send("Unable to Remove Category / Category not found")
    })
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
})

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
})



//////////////////////////////POST ROUTE//////////////////////////////
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (err, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(err);
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
        
        blogService.addPost(req.body).then(() => {
            res.redirect("/posts")
        }).catch((err) => {
            console.log(err)
            res.status(500).send("Unable to Add Post")
        })  
    });  
})

app.post("/categories/add", ensureLogin, (req, res) => {
    blogService.addCategory(req.body).then(() => {
        res.redirect("/categories")
    }).catch((err) => {
        console.log(err)
        res.status(500).send("Unable to Add Category")
    })  
}) 

app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render("register", {successMessage: "User created"})
    }).catch((err) => {
        res.render("register", {errorMessage: err, userName: req.body.userName})
    })
})


app.post("/login", (req,res) => {
    req.body.userAgent = req.get('User-Agent')
    authData.checkUser(req.body).then((mongoData) => {
        req.session.user = {
            userName: mongoData.userName, // authenticated user's userName
            email: mongoData.email, // authenticated user's email
            loginHistory: mongoData.loginHistory // authenticated user's loginHistory
        }   
        res.redirect('/posts')
    }).catch((err) => {
        res.render('login', {errorMessage: err, userName: req.body.userName});
    })
})



app.use((req, res) => {
    res.status(404).send("PAGE NOT FOUND")
})

// startup procedure
blogData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});