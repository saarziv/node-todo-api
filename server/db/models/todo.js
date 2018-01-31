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
    }
});

module.exports = {todos};