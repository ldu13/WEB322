const Sequelize = require('sequelize');

var sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


// Define Post, Category, and their relationship
var Post = sequelize.define('Post', {
    postId:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
})

var Category = sequelize.define('Category', {
    categoryId:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    },   
    category: Sequelize.STRING,
})

Post.belongsTo(Category, {foreignKey: 'category'});


// Initialize()
module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve("Connection has been established successfully")
        }).catch((error) => {
            console.log(error)
            reject("unable to sync the database")
        })
    });

}


// getAllPosts()
module.exports.getAllPosts = function() {  
    return new Promise((resolve, reject) => {
        Post.findAll().then((data) => {
            resolve(data)
        }).catch((error) => {
            console.log(error)
            reject("no results returned")
        })
    });      
}


// getPostsByCategory()
module.exports.getPostsByCategory = function(category) {    
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        }).then((data) => {
            console.log("Post Data by Category:")
            console.log(data)
            resolve(data)
        }).catch((error) => {
            console.log(error)
            reject("no results returned")            
        })
    });
}
 

// getPostsByMinDate()
module.exports.getPostsByMinDate = function(minDateStr) {   
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;      
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data) => {
            console.log("Post Data by MinDate:")
            console.log(data)
            resolve(data)
        }).catch((error) => {
            console.log(error)
            reject("no results returned")
        })
    });
}


// getPostById()
module.exports.getPostById = function(id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postId: id
            }
        }).then((data) => {
            console.log("Post Data by ID:")
            console.log(data)
            resolve(data[0])
        }).catch((error) => {
            console.log(error)
            reject("no results returned")            
        })
    });
}


// addPost()
module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        for (var property in postData) {
            if (postData[property] == "") {
                postData[property] = null
            }
        }
        postData.published = (postData.published) ? true : false;
        postData.postDate = new Date()

        Post.create(postData).then(() => {
            console.log("Post Created")
            resolve()
        }).catch((error) => {
            console.log("Post Error:")
            console.log(error)
            reject("unable to create post")
        })
    });
}


// getPublishedPosts()
module.exports.getPublishedPosts = function() { 
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        }).then((data) => {
            resolve(data)
        }).catch((error) => {
            console.log(error)
            reject("no results returned")
        })
    });                    
}


// getPublishedPostsByCategory()
module.exports.getPublishedPostsByCategory = function(category) {  
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then((data) => {
            resolve(data)
        }).catch((error) => {
            console.log(error)
            reject("no results returned")
        })
    });
}


// getCategories()
module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        Category.findAll().then((data) => {
            resolve(data)
        }).catch((error) => {
            console.log(error)
            reject("no results returned")
        })
    });
}


// addCategory(categoryData)
module.exports.addCategory = function(categoryData) {
    return new Promise((resolve, reject) => {
        for (var property in categoryData) {
            if (categoryData[property] == "") {
                categoryData[property] = null
            }
        }

        Category.create(categoryData).then(() => {
            console.log("Category Created")
            resolve()
        }).catch((error) => {
            console.log("Category Error:")
            console.log(error)
            reject("unable to create category")
        })
    })
}


// deleteCategoryById(id)
module.exports.deleteCategoryById = function(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                categoryId: id
            }
        }).then(() => {
            console.log("Category Deleted")
            resolve()
        }).catch((error) => {
            console.log("Category Delete Error:")
            console.log(error)
            reject()
        })
    })
}


// deletePostById(id)
module.exports.deletePostById = function(id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                postId: id
            }
        }).then(() => {
            console.log("Post Deleted")
            resolve()
        }).catch((error) => {
            console.log("Post Delete Error:")
            console.log(error)
            reject()
        })
    })
}