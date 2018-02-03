const mongoose = require('mongoose');

const dbName = "TodoApp";
const dbUrl = {
    mlab:"mongodb://saarziv:Aa123456@ds123718.mlab.com:23718/node-todo-api-db",
    localhost:`mongodb://localhost:27017/${dbName}`
};
const url = dbUrl.localhost|| dbUrl.mlab;

mongoose.connect(url);

module.exports = {mongoose};