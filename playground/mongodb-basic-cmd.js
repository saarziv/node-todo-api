// const MongoClient = require('mongodb').MongoClient;
// const ObjectId = require('mongodb').ObjectID;
//using ES6 object destructuring syntax - this line below is equal to the to lines above
const { MongoClient,ObjectID } = require('mongodb');
const dbName = 'TodoApp';
const url = `mongodb://localhost:27017/${dbName}`;

/* this is how we generate an ObjectId by Ourselves.
let obj = ObjectID();
console.log(obj);
 */

MongoClient.connect(url,(err, client) => {
    if(err) {
        return err;
    }

    console.log("Connected to mongodb Server..");


    const db = client.db('TodoApp');



    //this is how we select all documents in a given collection.  - .find and then we get cursor instance
    // and on that instance we can use -> toArray (and many other methods).
    // db.collection('Todos').find().toArray().
    // then((err, result) => {
    //     if(err) {
    //         return console.log("there was an err :",err);
    //     }
    //    console.log(JSON.stringify(result,undefined,2));
    // });

    //this is how we filter records by properties values (like when is sql.) ->
    //here i select only the records that contain the prop name with value saar
    // db.collection('Users').find({name:"Saar"}).toArray()
    //     .then((err,res) => {
    //         if(err) {
    //             console.log(err);
    //         }
    //         console.log(JSON.stringify(res,undefined,2 ));
    //     });
    //this is how we select by an id -we must use the ID constructor on the appropriate id.
    //and how we can get the time that is secretly defined in the object id.
    db.collection('Users').find({_id: ObjectID("5a70dc35ffab2d33d218666d")}).toArray()
        .then((doc) => {
           console.log(JSON.stringify(doc,undefined,2));
           console.log(doc[0]._id.getTimestamp());
        });






    //here we can see a use of a different cursor method - count.
    // db.collection('Todos').find().count()
    //     .then((count) => {
    //         console.log(`number oftodo\`s is ${count}`);
    //     });


    //this is how we insert a document to a given collection.
    // db.collection('Todos').insertOne({
    //    text:"something to do..",
    //    completed:false
    // },(err,result) => {
    //     if(err) {
    //         return err
    //     }
    //     console.log(JSON.stringify(result.ops,undefined,2));
    // });
    //
    // db.collection('Users').insertOne({
    //     name:"mike",
    //     age:29,
    //     location:"USA"
    // },(err,result) => {
    //     if(err) {
    //         return err
    //     }
    //     console.log(JSON.stringify(result.ops,undefined,2));
    // });

    //we can also use regular expressions in the find function - /Regex_Pattern/
    // db.collection("Users").find({name:/mi.*/}).toArray()
    //     .then((documents) => {
    //        console.log(documents,undefined,2);
    //     });

    client.close()
});