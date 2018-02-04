const jwt = require('jsonwebtoken');

let data = {
    id: 10
};

//the sign function hashes the object data with the salt we specify - and that will be the token we send to the user.
let token = jwt.sign(data,"secretMessage");
console.log(token);

//trying to change the token will result in an error. (invalid signature)
// token += 1;

//the verify decrypts the hash (must have the same salt.)
let decoded = jwt.verify(token,"secretMessage");
console.log(decoded);