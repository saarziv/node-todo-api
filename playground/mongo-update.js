const {MongoClient, ObjectId} = require('mongodb');

const dbName = "TodoApp";
const url = `mongodb://localhost:27017/${dbName}`;

MongoClient.connect(url,(err,client) => {

    if(err) {
        return err;
    }
    const db = client.db('TodoApp');

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectId("5a70dc0b03b6d8337eb00be9")
    },{
        $set: {name: "SaarKing"}, $inc: { age:1}
    },{
        returnOriginal: false
    }).then((doc) => {
        console.log(doc);
    })

});