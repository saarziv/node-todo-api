const env = process.env.NODE_ENV || "development";

console.log("env ******",env);

if(env === "test"){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoAppTest";

} else if(env === "development") {
    process.env.PORT = 3000;
    // process.env.MONGODB_URI_HEROKU="mongodb://saarziv:Aa123456@ds123718.mlab.com:23718/node-todo-api-db";
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoApp";
}
