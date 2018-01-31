const mongoose = require('mongoose');

const dbName = "TodoApp";
const url = `mongodb://localhost:27017/${dbName}`;

mongoose.connect(url);

module.exports = {mongoose};