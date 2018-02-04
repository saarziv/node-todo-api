const { ObjectID } = require("mongodb");
const {mongoose} = require("../../server/db/mongo-connect");
const {users} = require("../../server/db/models/user");
const {todos} = require("../../server/db/models/todo");


const id = "5a7236507ff3eb1046050ae7";


if(!ObjectID.isValid(id)) {
    return console.log("Id is not valid.");
}



users.findOne({_id:id}).then((todo) =>{
    console.log("find one :",todo);
}).catch((e) => console.log(e));


users.findById(id).then((todo) =>{
    console.log("find by Id :",todo);
}).catch((e) => console.log(e));


users.find({_id:id}).then((todo) =>{
    console.log("find (returns array:)",todo);
}).catch((e) => console.log(e));

