const {SHA256} = require('crypto-js');

let password = "musdarisTheKingofElvaiden!!#";

console.log("password string:",password);

//every time the hash will be the same.
//its impossible to decrypt hashes, the only way to do it is by comparing the hash to ALOT of other possible hashes ,
// and if you are lucky enough that the word that is similiar to your password resides in that db then you will successfully  decrypt it.
console.log("password hash:",SHA256(password).toString());

//if we want to give our users a token after they are logged in to verify that the are authenticated , and what id they have.
//for ex we want to gve for user with id 1 , a token with id 1 and in that way b4 that user deletes some resource we verify that the resource
//he is planning to delete is created by a user with an id that is similar to his token.

var data = {
    id:1
};

//the problem with simply sending to the user data{id:1} is that the user can easily change that id to 2, and act like user 2...
//so its better that we will create a token to send to the user with another property - the hashData
//that way send the user a hash with the inital value of data that we set on the server, and now if the user will change it the hashes would`nt match
//so here is the serverGeneratedToken
var serverGeneratedTokenForId1 = {
    data,
    hashData:SHA256(data).toString()
};

var serverGeneratedTokenForId2 = {
    data: {
        id:2
    },
    hashData:SHA256(data).toString()
};
//and here we will be our variable to valid the token later.
let resultHashId1 = SHA256(JSON.stringify(serverGeneratedTokenForId1.data)).toString();
let resultHashId2 = SHA256(JSON.stringify(serverGeneratedTokenForId2.data)).toString();

//this is the client token.
var clientSendsToken = {
    data,
    hashData:SHA256(JSON.stringify(data)).toString()
};
//if he will change value and act like user 2 like this:
// clientSendsToken.data.id = 2;
//it wont work because we check the hash..

//validating user id 1
if(resultHashId1 === clientSendsToken.hashData){
    console.log("data was not changed.");
    console.log("logged in as user 1!");
} else {
    console.log("data was changed.");
    console.log("go away !");
}
console.log("_______________________________________________")
//validating user id 2
if(resultHashId2 === clientSendsToken.hashData){
    console.log("data was not changed.");
    console.log("logged in as user 2!");
} else {
    console.log("data was changed.");
    console.log("go away !");
}

//if the client is smart he can simply hash according to the change of the data like this.

clientSendsToken.data.id = 2;
clientSendsToken.hashData = SHA256(JSON.stringify(clientSendsToken.data)).toString();
//that way he will successfully log in as user 2 which is horrible !
console.log("_______________________________________________")
if(resultHashId2 === clientSendsToken.hashData){
    console.log("data was not changed.");
    console.log("logged in as user 2!");
} else {
    console.log("data was changed.");
    console.log("go away !");
}
//therefore we need to salt our hash in the server , with a secret message (that the client does`nt know about),that will make our hash harder to copy from the client.
serverGeneratedTokenForId2 = {
    data: {
        id:2
    },
    hashData:SHA256(data + "secret message").toString()
};
resultHashId2 = SHA256(JSON.stringify(serverGeneratedTokenForId2.data + "secret message")).toString();

console.log("_______________________________________________")
if(resultHashId2 === clientSendsToken.hashData){
    console.log("data was not changed.");
    console.log("logged in as user 2!");
} else {
    console.log("data was changed.");
    console.log("go away !");
}

//only if the client would know the salt message, he will be able to change his token hash to be accepted.
//and if the client does`nt change nothing and is trying to login as user 2 (and he really is) he will be accepted.


