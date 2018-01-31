const {MongoClient, ObjectId} = require('mongodb');

const dbName = "TodoApp";
const url = `mongodb://localhost:27017/${dbName}`;

MongoClient.connect(url,(err,client) => {

    if(err) {
        return err;
    }
    const db = client.db('TodoApp');

    //deletes many documents according to the object that is given

    // db.collection('Todos').deleteMany({name:"lachtong",completed: true})
    //     .then((res) => {
    //     console.log(res.result);
    // });

    //deletes one document and returns the doc that was deleted.

    // db.collection('Todos').findOneAndDelete({name:"el vaiden"})
    //     .then((res) => {
    //         console.log(res);
    //     });

    //delete by id

    db.collection('Todos').findOneAndDelete({_id: new ObjectId("5a71f5ad9441dc1e3ee6c8bd")})
        .then((res) =>{
            console.log(res);
        })

});