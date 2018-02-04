/// a file that is similar to the user.js generateAuth function - trying to understand...

var likeSave = () =>{

    return new Promise(((resolve, reject) => {

        setTimeout(()=>{
            console.log("way back");
            resolve();
        },1000);

    }));

};


var likeGenerateAuth = () => {
    //some logic
    var likeToken = "moshe";

    console.log("hi");
    //this return here is the key for this to work - this is the reason:
    //if i wont put the return there - the function likeGenerateAuth will finish executing before likeSave finished execution
    //(the console will print bye bye without printing way back) and therefore hello? wont be printing and i wont be able to access the promise inside.
    //i could access the promise inside *only* when like save finished its execution and then hello? will print, only then i will be able to access the promise
    //and print likeToken.
    //
    //though i cant seem to explain what really return here does. i understand what heppens without it,but how the addition of returns changes it ?
    return likeSave().then(() => {
        // return likeToken;
        console.log("hello?");
        return new Promise((resolve)=> resolve(likeToken));
    });
    console.log("bye bye");

};


var val = likeGenerateAuth();
console.log("val",val);
// likeGenerateAuth().then((res) =>{
//     console.log(res);//like res.send
// });



console.log("end of file");
