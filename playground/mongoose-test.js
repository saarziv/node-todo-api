const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/test");

//notice that the first arg to the model function we determine the name of the collection that the models will be saved to.

const modTest = mongoose.model("modTest",{
    text:{
        type:String,
        required:true
    }
});

const testDoc = new modTest({
    text:"lala"
});

console.log(testDoc);


testDoc.save().then((d)=>{
    console.log(d);
},(e)=> {
    console.log(e);
});