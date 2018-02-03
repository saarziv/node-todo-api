const mongoose = require('mongoose');

const dbName = "TodoApp";
const remoteMongoDbUri = "mongodb://saarziv:Aa123456@ds123718.mlab.com:23718/node-todo-api-db";
const url = process.env.MONGODB_URI || `mongodb://localhost:27017/${dbName}`;

mongoose.connect(url);

module.exports = {mongoose};