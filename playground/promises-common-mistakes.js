const bcrypt = require('bcryptjs');

function doSomething() {
    console.log('doSomething(): start');
    return new Promise(function (resolve) {
        setTimeout(function () {
            let value = 10;
            console.log('doSomething(): end');
            resolve(10);
        }, 1000);
    });
}

function doSomethingElse(number) {
    console.log('doSomethingElse(): start');
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log('doSomethingElse(): end');
            let val = number /2;
            resolve(val);
        }, 1000);
    });
}

function finalHandler(number) {
    console.log('finalHandler(): start');
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log('finalHandler(): end');
            let val = number + 3;
            resolve(val);
        }, 1000);
    });
}
// common promises mistake

// 1) goal  - print 5
// doSomething().then(function a(somethingReturn) {
//    doSomethingElse(somethingReturn);
//
// }).then(function b(expectedSomethingElseRet){
//     console.log(expectedSomethingElseRet);
//
// });

//execution (if the functions are vertically equal that means they run in parallel ):
/*
doSomething-----
                a(somethingReturn=10)->doSomethingElse(somethingReturn=10)

                                       b(undefined)->  console.log(undefined)
                                       (undefined because  - with the return of function a which is undefined because there is no return there.)

                                                                             now doSomethingElse(10) finished execution.
*/

//solution

// doSomething().then(function a(somethingReturn) {
//    return doSomethingElse(somethingReturn);
//
// }).then(function b(SomethingElseRet){
//     console.log(SomethingElseRet);
//
// });
//execution ():
/*
doSomething-----
                a(somethingReturn=10)->doSomethingElse(somethingReturn=10)---

                                                                             b(SomethingElseRet=5)->console.log(5)

*/



//another promise mistake i struggled with :
//2)
/*
will this snippet print the hash ?(bcrypt.hash returns Promise<string>)

bcrypt.genSalt(10,(err, salt) =>{
    if(err){
        console.log(err);
    }
    return bcrypt.hash(password,salt);
}).then((hash)=>console.log(hash));


the answer is no,
because here i am chaining the then call to the bcrypt.genSalt which does not return a promise(because i use a callback),
instead the callback is returning a promise,
and we cant chain a promise to the callback.

if the function bcrypt.genSalt supports returning promises (which it does) all i need to do is omit the callback in order for the function to return
the promise
like this :
bcrypt.genSalt(10)
    .then((s) => bcrypt.hash(password,s))
    .then((h)=>console.log(h));

if the function didnt support promises , i must promisify it like this :

new Promise((resolve, reject) => {
    bcrypt.genSalt(10,(err, salt) =>{
        resolve(bcrypt.hash(password,salt));
    });
}).then((h)=>console.log(h));

*/


/*how to chain promises to work one after another (key is using return.)
doSomething().then((doSomethingReturn)=>{
    return doSomethingElse(doSomethingReturn)

}).then((somethingElseReturn)=>{
    return finalHandler(somethingElseReturn);

}).then((resultFromFinalHandler) =>{
    console.log(resultFromFinalHandler);
});

in summary promises must return on of the followings:
return another promise
return a synchronous value (or undefined)
throw a synchronous error


great explanation on promises : https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html*/

//another promise mistake
//3) goal - print 5 when using a different function.
/*
 this code snippet wont print the number 5 but will throw an error of func() is not a function.
 because when you execute func() - it will start executing doSomething() but when the execution will start the function will end
 and it will not return the promise doSomethingElse

 var func  = () =>{
    doSomething().then((output) =>{
        return doSomethingElse(output)
    });
};

console.log(func().then((num) => console.log(num)));

for example if i want to prove it :

var func  = () =>{
    doSomething().then((output) =>{
        return doSomethingElse(output)
    });
    return "hi";
};

console.log(func());

this will print hi - instead of promise<string>

the solution for this problem is to add the return key word on the first promise , and then when executing func it will
first run doSomething , then will run doSomthingElse and then will return the promise of doSomething else,
and then i can add the .then to that promise :

var func  = () =>{
   return doSomething().then((output) =>{
       return doSomethingElse(output)
  });
  return "hi";
};

console.log(func().then((num) => console.log(num)));

*/


