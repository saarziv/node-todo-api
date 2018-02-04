const jwt = require('jsonwebtoken');
const validator = require('validator');
const mongoose = require('mongoose');
const _ = require('lodash');

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
    tokens :[{ // an array of tokens
        access:{  // a property that tells what this token is used for.
            type:String,
            required:true
        },
        token:{
            type:String,
            required:true
        }
    }]
});

//overriding an existing  instance method to supply out specific needs.
UserSchema.methods.toJSON = function () {
    let user =this;
    // let userObj = user.toObject(); for some reason Andrew uses this statement although the user instance type is an object any way..
    return _.pick(user,["email","_id"]);
};
UserSchema.methods.generateAuthToken = function () {

    //the this of this function is the instance that is calling it (this is an instance method.)
    let user = this; //simply making it more readable.

    //we create a token that his purpose is authentication.
    let access = "auth";

    //creating a jwt hash that will be build from the id of the user, the access prop and 123abc salt.
    let token = jwt.sign({_id:user._id.toHexString(),access},"123abc").toString();

    //add that token to the token array prop of the user.
    user.tokens.push({access, token});

    //notice that now we must save the user instance to the db.
    //like this :
    return user.save().then(()=>{
        return token;
    });

    //if we would`nt include the save function and simply return the token , the changes we made to the user instance that is calling this method
    //would`nt be saved in the db , we will only return the token , without saving the user instance and all his prop to the db.

    //we must put return b4 user.save if we want to access the token value after it is saved to the db.

};
UserSchema.statics.getByToken = function (token){
    let decoded;
    //if the verify results in an error we will need to handle it.
    try {
        decoded = jwt.verify(token,"123abc");
    } catch (e){

        //because we want the getByToken to handle the error of invalid token with a respond with status 401(which means authentication is required)
        //we need to handle the error in the server.js file , therefore we need to return a promise that will reject
        //and when if it will reject it will be caught  in the .catch of the GetByToken in server.js file.
        //when a reject is returned it will automatically go to the .catch
        return Promise.reject();
    }

    //we need to check all props are equal the decoded objects props (and not only id)for security reasons probably..
    return User.findOne({
        '_id':decoded._id,
        'tokens.access':decoded.access,
        'tokens.token':token
    }).then((user)=>{
        return user;
    }).catch((e)=>e)
};

const User = mongoose.model('users',UserSchema);

module.exports ={User};