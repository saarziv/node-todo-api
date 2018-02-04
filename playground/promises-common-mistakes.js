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
doSomething().then(function a(somethingReturn) {
   doSomethingElse(somethingReturn);

}).then(function b(expectedSomethingElseRet){
    console.log(expectedSomethingElseRet);

});

//execution (if the functions are vertically equal that means they run in parallel ):
/*
doSomething-----
                a(somethingReturn=10)->doSomethingElse(somethingReturn=10)

                                       b(undefined)->  console.log(undefined)
                                       (undefined because  - with the return of function a which is undefined because there is no return there.)

                                                                             now doSomethingElse(10) finished execution.
*/

//solution

doSomething().then(function a(somethingReturn) {
   return doSomethingElse(somethingReturn);

}).then(function b(SomethingElseRet){
    console.log(SomethingElseRet);

});
//execution ():
/*
doSomething-----
                a(somethingReturn=10)->doSomethingElse(somethingReturn=10)---

                                                                             b(SomethingElseRet=5)->console.log(5)

*/




//how to chain promises to work one after another (key is using return.)
// doSomething().then((doSomethingReturn)=>{
//     return doSomethingElse(doSomethingReturn)
//
// }).then((somethingElseReturn)=>{
//     return finalHandler(somethingElseReturn);
//
// }).then((resultFromFinalHandler) =>{
//     console.log(resultFromFinalHandler);
// });

//in summary promises must return on of the followings:
// return another promise
// return a synchronous value (or undefined)
// throw a synchronous error


//great explanation on promises : https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html