const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const { todos } = require("../../server/db/models/todo");
const { User } = require("../../server/db/models/user");



//better to generate the token with jwt sign and not the instance method generateAuthToken()
//because this way we are not making the seed user db reliable on the functionality of generateAuthToken() method.
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const UsersTestArray = [
     new User({
        _id:userOneId, 
        email:"saar@example.com",
        password:"123",
        tokens:[{
            access:'auth',
            token: jwt.sign({_id:userOneId.toHexString(),access:'auth'},process.env.JWT_SECRET).toString()
        }]
    }),
    new User({
        _id:userTwoId,
        email:"saar2@example.com",
        password:"1234"
    })
];
const todosTestArray = [
    {text:"test todo 1", _id: new ObjectID(),_creator: userOneId },
    {text:"test todo 2", _id: new ObjectID(), _creator: userTwoId ,completedAt:1223,completed:true}
];

//receiving  a -done callback parameter, passing it from the beforeEach
var seedTodos = (done) =>{
    todos.remove({}).then(()=>{
        return todos.insertMany(todosTestArray)
    }).then(()=>done())
        .catch(e => e);

    //if i did`nt pass the done call back i should return a promise and use the .then(()=>done()) in the beforeEach
    //like this:
    /*  return todos.remove({}).then(()=>{
            return todos.insertMany(todosTestArray)
            }).catch(e => e);
    */
};

var seedUsers = (done) =>{
    User.remove({}).then(() =>{

        //must create an instance of user in order to use the save instance method
        //must use the save method in order to use the middle ware i created that will hash the password (that`s why im not using insert many)
        let userOne = new User(UsersTestArray[0]);
        let userTwo = new  User(UsersTestArray[1]);

        //Promise.all - gets an array of promises , executes them all and the then will run after all promises execution.
        return Promise.all([userOne.save(),userTwo.save()]);
    }).then(() => done())
        .catch(e => e)



};


module.exports= {seedTodos,todosTestArray,seedUsers,UsersTestArray};
