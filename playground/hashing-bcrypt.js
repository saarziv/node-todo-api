const bcrypt = require('bcryptjs');

let password = "abc123";

//with becrypt we generate a salt
//the salt is a random value and is differs for every calculation.

//the 10 is the number of rounds which means the number of time to calculate the hash - the longer it takes the harder is to brute force.

//then we hash the password with the salt and print it.
new Promise((resolve, reject) => {
    bcrypt.genSalt(10,(err, salt) =>{
        resolve(bcrypt.hash(password,salt));
    });
}).then((h)=>console.log(h));

bcrypt.genSalt(10)
    .then((s) => bcrypt.hash(password,s))
    .then((h)=>console.log(h));




//copied the value from the print - in the hash we can see which round was used,and info about the salt

//that way when we use compare we can verify if the password is eq to the hash supplied.

// let hash = "$2a$10$6UFrtLZhAh7R2FNNeONO7eUfuxB/ItZseNXVAhDdwtfjYGm/RDES6";
//
// bcrypt.compare(password,hash).then((bool) =>{
//    console.log(bool);
// });