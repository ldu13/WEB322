const mongoose = require("mongoose")
const Schema = mongoose.Schema

const bcrypt = require("bcryptjs")

const env = require("dotenv")
env.config()

var userSchema = new Schema ({
    "userName": {
        "type": String,
        "unique": true
    }, 
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
})

let User; // to be defined on new connection (see initialize)

// initialize()
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(process.env.MONGO_URI_STRING);

        db.on('err', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        })
    })
}

// registerUser(userData)
module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password === userData.password2) {
            bcrypt.hash(userData.password, 10).then((hash) => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save((err) => {
                    if (err) {
                        if (err.code == 11000) {
                            reject("User Name already taken");
                        } else {
                            reject("There was an error creating the user: " + err);
                        }              
                    } else {
                        resolve();
                    }
                })
            })
            .catch((err) => {
                console.log(err); // Show any errors that occurred during the process
            })
        } else {
            reject("Passwords do not match");
        }       
    })
}

// checkUser(userData)
// use findOne and mongoData, or find and mongoData[0]
// because find returns an array, and
// there can only be one matching username, then mongoData[0] is just the first or only element in the array
module.exports.checkUser = function(userData) {
    return new Promise(function (resolve, reject) {
        User.findOne({userName: userData.userName})
        .exec()
        .then((mongoData) => {
            bcrypt.compare(userData.password, mongoData.password).then((res) => {
                if (res === true) {           
                    mongoData.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                    
                    User.updateOne(
                        {userName: mongoData.userName},
                        {$set: {loginHistory: mongoData.loginHistory}}
                    )
                    .exec()
                    .then(() => {
                        resolve(mongoData);
                    }).catch((err) => {
                        reject("There was an error verifying the user: " + err);
                    })
                } else {
                reject("Incorrect Password for user: " + userData.userName); 
                }   
            })
        }).catch(() => {
            reject("Unable to find user: " + userData.userName);
        })
    })
}