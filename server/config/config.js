/*
the Goal of this file is : when running test use a test db. ->
->when developing locally use local db that is not for tests, when deployed to heroku use mlab remote db.

it is done in a few steps:

a. notice package.json file - under the scripts section in the "test" script - i added :export NODE_ENV=test && mocha <test file path>
this export command creates a local environment variable and assigns it a "test" value.
this cmd will run every time i run tests.

b. in config file (this file) i created an env variable that is equel to the environment variable i created in the test scripts(line 15).
if the test environment variable is defined the env variable will be test , if its not defined know for sure that its not a test run so we assign it a ->
-> development value.

c. later we check if the env is equel to tests than create a environment variable with the name PORT and assign it 3000,
and create a environment variable with the name  MONGODB_URI and give it the uri of the TEST DB (TodoAppTest)

if the env is equal development , assign the MONGODB_URI environment variable to the local db which is not for tests (TodoApp)

this way when we work locally the program will work with different db`s for tests and development.

now because when i deploy my app to heroku it wont be able to access my local development db , i must make it work with a remote db it has access to.

i went to the site called https://mlab.com/ and created a free mongo db there - they supplied a connection string to that db
con string : mongodb://<dbuser>:<dbpassword>@ds123718.mlab.com:23718/node-todo-api-db
u can create a db user and pass in their site for your db.

now after i have a remote db , i need to make heroku work with it.
i did it like this :

a. i created an environment variable on heroku server called MONGODB_URI_HEROKU:
with the following command (from this project path in the terminal) : heroku config:set  MONGODB_URI_HEROKU=<the uri with cred on the mlab db>
that way the heroku server has a local environment variable that in my local machine is not defined.

b. than in the mongoose-connect file i used these lines of code :
    const url = process.env.MONGODB_URI_HEROKU || process.env.MONGODB_URI;
    mongoose.connect(url);
that way , when we run locally -> process.env.MONGODB_URI_HEROKU wont be defined , so we will use the process.env.MONGODB_URI
and when we run from heroku it will be defined and we will use the mlab db.


btw when running on heroku the env variable value (process.env.NODE_ENV ) is "production" therefore i could also simply add another if statement like this:
 if(env = "production")
    process.env.MONGODB_URI = "<mlab_uri_path>";
and it supposed to work as well (without creating a custom environment variable like i did.)
* */

const env = process.env.NODE_ENV || "development";

console.log("env ******",env);

if(env === "test"){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoAppTest";

} else if(env === "development") {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = "mongodb://localhost:27017/TodoApp";
}
