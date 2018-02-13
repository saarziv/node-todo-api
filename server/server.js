require("./config/config");
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');

//es6 object destructuring takes the value of the key(named in curly braces) from the object exported from the file.
//notice that when using object destructuring we must putt a variable that is identical to the property of the export!
const { mongoose } = require('./db/mongo-connect');
const { User } = require('./db/models/user');
const { todos } = require('./db/models/todo');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;



app.use(bodyParser.json());

// app.use(authenticate); //this line will make every api endpoint check for authentication b4 continuing we dont want to use that because login and sign up

//req.user is set on the authenticate
app.post("/todos",authenticate,(req,res) => {
    const todoDoc = new todos({
        text: req.body.text,
        _creator: req.user._id
    });

    todoDoc.save()
        .then((doc) => {
            res.send(doc);
        },(e) => {
            res.status(400).send(e);
        });
});

app.get("/todos",authenticate,(req,res) => {

    todos.find({_creator:req.user._id}).then((todos)=>{
        // todos.push({name:"testtt"}); to check if the test is good..
        //its better to always send an object instead on an array because then i can add more properties to the response like status code
        res.send({todos});
    },(err) => res.status(404).send(err))
});

app.get("/todos/:id",authenticate,(req,res) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send("the id supplied is not valid.");
    }

    todos.findOne({_id:id,_creator:req.user._id}).then((todo) => {
        if(!todo){
            res.status(404).send(`the id :${id} does not exist`);
        }
        res.send({todo});
    }).catch((e)=>res.status(400).send());
});



app.delete("/todos/:id",authenticate,async (req,res) => {


    try {
            const id = req.params.id;
            if(!ObjectID.isValid(id)){
                return res.status(404).send();
            }
            let todo = await todos.findOneAndRemove({_id: id,_creator: req.user._id});
            if(!todo){
                res.status(404).send(`the id :${id} does not exist`);
            }
            res.send({todo});
    }
    catch (e) {
        res.status(400).send();
    }


   //promise way

   // todos.findOneAndRemove({_id: id,_creator: req.user._id}).then((todo) => {
   //     if(!todo){
   //         res.status(404).send(`the id :${id} does not exist`);
   //     }
   //
   //     res.send({todo});
   // }).catch((e) => {
   //     res.status(400).send();
   // })
});

app.patch("/todos/:id",authenticate,(req,res) => {
    const id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    //creates an object from req.body that only contains completes,text properties.
    //this way if the client passes completedAt property with a value in the request body, it wont be updated according to the value he inserted.
    var body = _.pick(req.body,['completed','text']);

    //checking if the completed is indeed a boolean , if it isn`t then simply make the prop false.
    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completedAt = null;
        body.completed = false;
    }

    todos.findOneAndUpdate({_id:id,_creator:req.user._id},
        {
            $set : {completed: body.completed, completedAt: body.completedAt, text: body.text}
        },
        {
            new:true
        }).then((todo) => {
            if(!todo){
                res.status(404).send("the todo could`nt be found");
            }
            res.send({todo});
    }).catch((e)=> res.status(400).send());

});

app.post("/users", async(req,res)=>{


    //generateAuthToken - an instance method we created on the user model that generates a token updates ->
    // the user instance with the token and returns that token

    try {
        let properties =  _.pick(req.body,["email","password"]);
        let user = new User(properties);
        await user.save();
        const token = await user.generateAuthToken();
        res.header("x-auth",token).send(user.toJSON());
    } catch (e) {
        res.status(400).send(e);
    }

    //with promises.

    // user.save().then(()=>{
    //     return user.generateAuthToken();
    //
    // }).then((token) => {
    //     res.header("x-auth",token).send(user.toJSON());
    //
    // }).catch((e)=>res.status(400).send(e))

    //saving user.



    //different way to save users :(nice explanation)
    /*
    notice that we could also simply use this call because in generateAuthToken we are saving the user instance in the db anyways.
    the problem with this way however is that you don`t want to
    tightly couple generating an authentication token with creating a user, because now whenever you just need to create an authentication token,->
    you must also create a user.

    tightly coupling is an expression identical to bad separation of concerns.
    and that kind of code is way better - more flexible more testable etc..

    when we use the first way defined above -we are first saving the user in db without his token , and after that in the generateAuthToken method ->
    we are UPDATING that user in the db with the new token therefore the generateAuthToken simply generates a token to a user and updates that user
    and returns the token.

    anyway its not that critical and both methods have their advantages and disadvantages.

    user.generateAuthToken().then((token)=>{
        res.header("x-auth",token).send(user);

    }).catch((e)=>res.status(400).send(e));
    */

});

//creating a middleware function - a function that will execute before another function that responds to a url.
//we are setting the req parameter with the user object and the token so the next function will have these properties as well. which is awesome.
//we must call next() in order to make the next function execute.

app.post("/users/login",async (req,res)=>{
    let body = _.pick(req.body,["email","password"]);
    try {
        let user  = await User.getByCredentials(body.email,body.password);
        let generatedToken = await user.generateAuthToken();
        res.header('x-auth',generatedToken).send(user);
    } catch (e) {
        res.status(401).send(e)
    }

    //promise way

    // let user;
    // User.getByCredentials(body.email,body.password)
    //     .then((userFound) =>{
    //         user = userFound;
    //
    //         //notice that when logging in we need to generate a new auth token
    //         //because an authentication token represents a login to the server ,
    //         // we wouldn`t want to validate an old token that was generated in an older login in
    //         //the goal is to pass the token to ever endpoint we expose in order to see if the user is authorized.
    //         //we created a middleware function that is called authenticate in order to achieve that.
    //         return userFound.generateAuthToken()
    //     }).then((token) =>{
    //
    //         // it will send only id and email thanks to the User.toJson function that we overrided.
    //         res.header('x-auth',token).send(user);
    //     })
    //     .catch((e) => res.status(401).send(e));

});

app.delete("/users/me/token",authenticate,async (req,res)=>{
    try {
        await req.user.removeToken(req.token);
        res.status(200).send("successfully logged out.");
    } catch (e) {
        res.status(400).send(e);
    }

    //promise way :

    // req.user.removeToken(req.token).then(() =>{
    //     res.status(200).send("successfully logged out.");
    // }).catch((e)=> res.status(400).send(e))
});


//we insert the middleware function (without giving it parameters.)

app.get("/users/me",authenticate,(req,res)=>{
    res.send(req.user);
});



let server = app.listen(port,() => {
    console.log(`listening on port ${port}...`);
});

module.exports = {server,app};


