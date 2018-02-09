const mongoose = require('mongoose');

const todos = mongoose.model('todos',{
    text: {
        type: String,
        required: true,
        trim:true,
    },
    completed: {
        type: Boolean,
        default:false
    },
    completedAt: {
        type:Number,
        default:null
    },
    //the _creator represents the id of the user who created this todo.
    //every time a user sends an authentication token , we will get his id thanks to the token.
    //and then we will compare the _creator prop with the id we got from the token.
    //if they match that means the todo we found is a todo of the user that is logged in.
    _creator: {
        required: true,
        type: mongoose.Schema.Types.ObjectId
    }
});

module.exports = {todos};
