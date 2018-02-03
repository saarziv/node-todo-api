const mongoose = require('mongoose');

const dbName = "TodoApp";
const dbUrl = {
    mlab:"mongodb://saarziv:Aa123456@ds123718.mlab.com:23718/node-todo-api-db",
    localhost:`mongodb://localhost:27017/${dbName}`
};
//first i created an environment variable on heroku with this cmd :heroku config:set MONGODB_URI=mongodb://saarziv:Aa123456@ds123718.mlab.com:23718/node-todo-api-db
//now checking if the environment variable exists - if not use localhost.
const url = process.env.MONGODB_URI || dbUrl.localhost;

//another option is to use this :
//checks if the app is on heroku , use the mlab db if not use local db.
// const url = (process.env.PORT) ?  dbUrl.mlab : dbUrl.localhost;

mongoose.connect(url);

module.exports = {mongoose};