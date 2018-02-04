require("./config/config");
const _ = require('lodash');
// const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

//notice that when using object destructoring we must putt a variable that is identical to the property of the export!
const { mongoose } = require('./db/mongo-connect');
const { User } = require('./db/models/user');
const { todos } = require('./db/models/todo');

const app = express();
const port = process.env.PORT;
app.use(bodyParser.json());

app.post("/todos",(req,res) => {
    //bad separation of concerns - should create a db file that stores all the functions relating to the db.
    const todoDoc = new todos({
        text: req.body.text
    });

    todoDoc.save()
        .then((doc) => {
            res.send(doc);
        },(e) => {
            res.status(400).send(e);
        });
});

app.get("/todos",(req,res) => {

    todos.find().then((todos)=>{
        // todos.push({name:"testtt"}); to check if the test is good..
        //its better to always send an object instead on an array because then i can add more properties to the response like status code
        res.send({todos});
    },(err) => res.status(404).send(err))
});

app.get("/todos/:id",(req,res) => {
    const id = req.params.id;

    if(!ObjectID.isValid(id)){
        return res.status(404).send("the id supplied is not valid.");
    }
    todos.findById(id).then((todo) => {
        if(!todo){
            res.status(404).send(`the id :${id} does not exist`);
        }
        res.send({todo});
    }).catch((e)=>res.status(400).send());
});



app.delete("/todos/:id",(req,res) => {
   const id = req.params.id;
   if(!ObjectID.isValid(id)){
       return res.status(404).send();
   }

   todos.findByIdAndRemove(id).then((todo) => {
       if(!todo){
           res.status(404).send(`the id :${id} does not exist`);
       }

       res.send({todo});
   }).catch((e) => {
       res.status(400).send();
   })
});

app.patch("/todos/:id",(req,res) => {
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

    todos.findByIdAndUpdate(id,
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

app.post("/users",(req,res)=>{
    let properties =  _.pick(req.body,["email","password"]);
    let user = new User(properties);

    //generateAuthToken - an instance method we created on the user model that generates a token updates ->
    // the user instance with the token and returns that token
    user.save().then(()=>{
        return user.generateAuthToken();

    }).then((token) => {
        res.header("x-auth",token).send(user.toJSON());

    }).catch((e)=>res.status(400).send(e))

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

let server = app.listen(port,() => {
    console.log(`listening on port ${port}...`);
});
module.exports = {server,app};


