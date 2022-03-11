const req = require('express/lib/request')
const fs = require('fs')

let posts = []
let categories = []

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (error, data) => {
            if(error) {
                reject("unable to read file")
            } else {
                posts = JSON.parse(data)
            }           
        })

        fs.readFile('./data/categories.json', 'utf8', (error, data) => {
            if(error) {
                reject("unable to read file")
            } else {
                categories = JSON.parse(data)
            }           
        })
        resolve()
    })
}

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        if(posts.length == 0) {
            reject("no results returned")
        } else {
            resolve(posts)
        }
    })          
}

module.exports.getPublishedPosts = function() {    
    return new Promise((resolve, reject) => {
        let publishedPosts = []
        for(let i = 0; i < posts.length; i++) {
            if(posts[i].published == true) {
                publishedPosts.push(posts[i])
            }
        }
        if(publishedPosts.length == 0) {
            reject("no results returned")
        } else {
            resolve(publishedPosts)
        }              
    })                       
}

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if(categories.length == 0){
            reject("no result returned")
        }else{
            resolve(categories)
        }              
    })
}

// a3 - Add the addPost() function
module.exports.addPost = function (postData) {
    return new Promise((resolve, reject) => {
        let postData = ''
        if (postData.published === undefined) {
            postData.published = false;
        } else {
            postData.published = true;
        }
        postData.id = posts.length + 1

        var date = new Date();
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();
        if (dd < 10){
            dd = '0' + dd;
        }
        if (mm < 12){
            mm = '0' + mm;
        }
        postData.postDate = yyyy + '-' + mm + '-' + dd;

        posts.push(postData)       
        resolve()
    })
}

// a3 - Add the getPostsByCategory(category) Function  
module.exports.getPostsByCategory = function(category) {    
    return new Promise((resolve, reject) => { 
        let selectedPosts = []  
        for(let i = 0; i < posts.length; i++){
            if(posts[i].category == category){
                selectedPosts.push(posts[i]);
            }
        }   
        if (selectedPosts.length == 0) {
            reject("no results returned")
        } else {
            resolve(selectedPosts)
        }
    })
}

// a3 - Add the getPostsByMinDate(minDateStr) Function  
module.exports.getPostsByMinDate = function(minDateStr) {   
    return new Promise((resolve, reject) => {
        let selectedPosts = []
        posts.forEach(post => {
            if (new Date(post.postDate) >= new Date(minDateStr)) {
                selectedPosts.push(post)
            }
        })
        if (selectedPosts.length == 0) {
            reject("no results returned")
        } else {
            resolve(selectedPosts)
        }
    })
}

// a3 - Add the getPostById(id) Function  
module.exports.getPostById = function(newId) {
    return new Promise((resolve, reject) => {
        let selectedPosts = posts.filter(({id}) => id == newId);
        if (selectedPosts.length == 0) {
            reject("no results returned")
        } else {
            resolve(selectedPosts)
        }
    })
}

// a4 - Add the getPublishedPostsByCategory(category) Function
module.exports.getPublishedPostsByCategory = function(category) {  
    return new Promise((resolve, reject) => {
        let publishedPosts = []
        for(let i = 0; i < posts.length; i++) {
            if(posts[i].published == true && posts[i].category == category) {
                publishedPosts.push(posts[i])
            }
        }
        if(publishedPosts.length == 0) {
            reject("no results returned")
        } else {
            resolve(publishedPosts)
        }  
    })
}