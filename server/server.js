// const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

//notice that when using object destructoring we must putt a variable that is identical to the property of the export!
const { mongoose } = require('./db/mongo-connect');
const { users } = require('./db/models/user');
const { todos } = require('./db/models/todo');

const app = express();
const port = process.env.PORT || 3000;
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

let server = app.listen(port,() => {
    console.log(`listening on port ${port}...`);
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

module.exports = {server,app};


