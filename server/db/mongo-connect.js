const mongoose = require('mongoose');

const dbName = "TodoApp";
const url = "mongodb://saarziv:Aa123456@ds123718.mlab.com:23718/node-todo-api-db" || `mongodb://localhost:27017/${dbName}`;

mongoose.connect(url);

module.exports = {mongoose};