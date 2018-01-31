const mongoose = require('mongoose');

const users = mongoose.model('users',{
    email :{
        required:true,
        trim:true,
        type:String,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Please insert a valid email address."]
    }
});

module.exports ={users};