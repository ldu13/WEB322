const req = require('express/lib/request')
const fs = require('fs')

let posts = []
let categories = []

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if(err) {
                reject("unable to read file")
            } else {
                posts = JSON.parse(data)
                //console.log(posts)
                resolve(posts)
            }           
        })

        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
            if(err) {
                reject("unable to read file")
            } else {
                categories = JSON.parse(data)
                //console.log(categories)
                resolve(categories)
            }           
        })
    })
}

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        if(posts.length === 0) {
            reject("no results returned")
        } else {
            resolve(posts)
        }
    })          
}

module.exports.getPublishedPosts = function() {
    let publishedPosts = []
    return new Promise((resolve, reject) => {
        if(posts.length === 0) {
            reject("no results returned")
        } else {
            for(let i = 0; i < posts.length; i++) {
                if(posts[i].published === true) {
                    //publishedPosts += posts[i]  //only display[object object]
                    publishedPosts.push(posts[i])
                }
            }
            resolve(publishedPosts)
        }              
    })                       
}

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if(categories.length === 0){
            reject("no result returned")
        }else{
            resolve(categories)
        }              
    })
}