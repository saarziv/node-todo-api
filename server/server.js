// const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

//notice that when using object destructoring we must putt a variable that is identical to the property of the export!
const { mongoose } = require('./db/mongo-connect');
const { users } = require('./db/models/user');
const { todos } = require('./db/models/todo');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.post("/todo",(req,res) => {

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

let server = app.listen(port,() => {
    console.log(`listening on port ${port}...`);
});

module.exports = {server,app};


