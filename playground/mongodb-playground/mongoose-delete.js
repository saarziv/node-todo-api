const { ObjectID } = require("mongodb");
const {mongoose} = require("../../server/db/mongo-connect");
const {users} = require("../../server/db/models/user");
const {todos} = require("../../server/db/models/todo");


const id = "5a75b07a37d9805a004abc7a";


if(!ObjectID.isValid(id)) {
    return console.log("Id is not valid.");
}
//deletes all documents in the collection. - returns number of deleted items.

// todos.remove({}).then((res) => {
//     console.log(res);
// });

// deletes one doc by id and returns that doc.

// todos.findByIdAndRemove(id).then((doc) => {
//    console.log(doc);
// });

// deletes one doc by properties and returns that doc.

// todos.findOneAndRemove({text: "test todo 2"}).then((doc) => {
//     console.log(doc);
// });
