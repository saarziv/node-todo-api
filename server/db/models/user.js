const jwt = require('jsonwebtoken');
const validator = require('validator');
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    email :{
        required:true,
        trim:true,
        type:String,
        unique:true,
        validate: {
            validator:validator.isEmail,
            message:'{VALUE} is not a valid email'
        }
    },
    password :{
        required:true,
        trim:true,
        type:String,
        minlength:2,
    },
    tokens :[{
        access:{
            type:String,
            required:true
        },
        token:{
            type:String,
            required:true
        }
    }]
});

UserSchema.methods.generateAuthToken = function () {
    //the this of this function is the instance that is calling it (this is an instance method.)
    let user = this; //simply making it more readable.

    //did`nt understand the use of access variable and property in the schema

    let access = "auth";
    //creating a jwt hash that will be build from the id of the user, the access prop and 123abc salt.
    let token = jwt.sign({_id:user._id.toHexString(),access},"123abc").toString();
    //add that token to the token array prop of the user.
    user.tokens.push({access, token});

    //notice that now we must save the changes made to the user instance in this function to the db.
    //like this :
    user.save().then(()=>{
        // return token; notice that i cant simply return the token now because user.save is an async function->
        //->therefore in server.js file the res.send method will execute while user.save executes and therefore the token variable will be undefined. ->
        //-> and i wont be able to send it in the x-auth header because it is undefined.
        return new Promise(((resolve, reject) => {
            resolve(token)
        }));
    })
    //if we would`nt include the save function and simply return the token , the changes we made to the user instance that is calling this method
    //would`nt be saved in the db , we will only return the token , without really saving the changes to the token array in the db.

};
const User = mongoose.model('users',UserSchema);

module.exports ={User};