/// a file that is similar to the user.js generateAuth function - trying to understand...

var likeSave = () =>{

    return new Promise(((resolve, reject) => {

        setTimeout(()=>{
            resolve();
        },1000);

    }));

};


var likeGenerateAuth = () => {
    //some logic
    var likeToken = "moshe";

    return likeSave().then(() => {
        return likeToken;
    });

};


likeGenerateAuth().then((res) =>{
    console.log(res);//like res.send
});



console.log("hi");
