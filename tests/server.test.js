const _ = require('lodash');
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');

const {app,server} = require('../server/server');
const {todos} = require('../server/db/models/todo');
const {User} = require('../server/db/models/user');
const {seedTodos,todosTestArray,seedUsers,UsersTestArray} = require('./seed/seed');

chai.use(sinonChai);

//before each test run it deletes all items in db.

beforeEach((done)=>seedUsers(done));
beforeEach((done) => seedTodos(done));

describe("Server tests",() => {

    describe("POST /todos", () => {
       let text = "go to steve aoki";

        it("Should create a todo",(done) =>{
            request(app)
               .post('/todos')
                .set('x-auth',UsersTestArray[0].tokens[0].token)
               .send({text})
               .expect(200)
               .expect((res) => {
                   chai.expect(res.body.text).to.equal(text);
               })
               .end((err) => {
                    if(err){
                        return done(err);
                    }
                    todos.find()
                        .then((todos)=>{
                            chai.expect(todos[todos.length-1].text).to.be.equal(text);
                            chai.expect(todos.length).to.be.equal(3);
                            done();
                        })
                        .catch((err)=>done(err))
               });

        });

        it("Should not create todo with invalid data",(done) =>{

            request(app)
                .post("/todos")
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .send({})
                .expect(400)
                .end((err) => {
                    if(err){
                        return done(err);
                    }
                    todos.find().then((todos) => {
                        chai.expect(todos.length).to.be.equal(2);
                    })
                        .catch((e) => done(e));
                    done();
                })
        })
        // in case we are not using before each to empty the db.

        // it("Should create a todo",(done) =>{
        //     let text = "go to steve aoki";
        //     request(app)
        //         .post('/todo')
        //         .send({text})
        //         .expect(200)
        //         .expect((res) => {
        //             chai.expect(res.body.text).to.deep.equal(text);
        //         })
        //         .end((err,res) => {
        //             if(err){
        //                 return done(err);
        //             }
        //             todos.findById(res.body._id,(err, todo) => {
        //                 if(err) {
        //                     return done(err);
        //                 }
        //                 chai.expect(todo[0].text).to.be.equal(text);
        //                 chai.expect(todo.length).to.be.equal(1);
        //                 done();
        //             })
        //         });
        //
        // });

    });

    describe("GET /todos",() => {
        it("Should return all todos",(done) => {
           request(app)
               .get("/todos")
               .set('x-auth',UsersTestArray[0].tokens[0].token)
               .expect(200)
               .expect((res) => {
                   chai.expect(res.body.todos.length).to.be.equal(1);
               })
               .end(done)
        });


    });

    describe("GET /todos/:id",() => {
        it("Should return todo by id",(done) => {
            const id = todosTestArray[0]._id.toHexString();
            const text = "test todo 1";
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(200)
                .end((err,res) => {
                    chai.expect(res.body.todo._id).to.be.equal(id);
                    chai.expect(res.body.todo.text).to.be.equal(text);
                    done();
                })
        });

        it("Should not return todo because it does not belong to that user.",(done) => {
            const id = todosTestArray[1]._id.toHexString();
            const text = "test todo 1";
            request(app)
                .get(`/todos/${id}`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(404)
                .end(done)
        });

        it("Should return 404 when todo not found",(done) => {
            const falseId = new ObjectID().toHexString();
            request(app)
                .get(`/todos/${falseId}`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(404)
                .end((err, res) => {
                    chai.expect(res.text).to.be.equal(`the id :${falseId} does not exist`);
                    done();
                })
        });

        it("Should return 404 when id is not valid",(done) => {
            const notValidId = "1";
            request(app)
                .get(`/todos/${notValidId}`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(404)
                .end(done)
        })
    });

    describe("DELETE /todos/:id",() => {

        it("Should delete a document and return it",(done) => {
            const id = todosTestArray[0]._id.toHexString();
            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(200)
                .end((err,res) => {
                    todos.findById(id).then((doc) => {
                        chai.expect(doc).to.be.null;
                        chai.expect(id).to.be.equal(res.body.todo._id);
                        done();
                    }).catch((e) => done(e));
                });

        });

        it("Should not delete a todo that the user does not own",(done) => {
            const id = todosTestArray[1]._id.toHexString();
            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(404)
                .end((err) => {
                    if(err){
                        done(err)
                    }
                    todos.findById(id).then((doc) => {
                        chai.expect(doc).to.not.be.null;
                        done();
                    }).catch((e) => done(e));
                });

        });

        it("Should return 404 when supplied an non existent id",(done) =>{
            const id = new ObjectID().toHexString();
            request(app)
                .delete(`/todos/${id}`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(404)
                .end(done)
        });
        it("Should return 404 when supplied an invalid id",(done) =>{
            request(app)
                .delete(`/todos/123abc`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(404)
                .end(done)
        })

    });

    describe("PATCH /todos/:id", () =>{
       it("Should update a todo`s completed at,text property",(done) =>{
           const id = todosTestArray[0]._id.toHexString();
           const todoUpdate= {completed:true,text:"from tests."};
           request(app)
               .patch(`/todos/${id}`)
               .set('x-auth',UsersTestArray[0].tokens[0].token)
               .send(todoUpdate)
               .expect(200)
               .expect((res) => {
                   todos.findById(id).then((todo) => {
                       let resFormatted = _.pick(res.body.todo,["completed","text"]);
                       chai.expect(resFormatted).to.be.deep.equal(todoUpdate);
                       chai.expect(todo.completed).to.be.equal(resFormatted.completed);
                       chai.expect(todo.text).to.be.equal(resFormatted.text);
                       chai.expect(res.body.todo.completedAt).to.not.be.null;
                   });
               }).end(done)
       });

        it("Should not update a todo`s with wrong user",(done) =>{
            const id = todosTestArray[1]._id.toHexString();
            const todoUpdate= {completed:true,text:"from tests."};
            request(app)
                .patch(`/todos/${id}`)
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .send(todoUpdate)
                .expect(404)
                .end(done)
        });


        it("Should update a todo`s to completed false and reset the completed at property",(done) => {

           const id = todosTestArray[0]._id.toHexString();
           const todoUpdate= {completed:false,text:"from tests2."};
           request(app)
               .patch(`/todos/${id}`)
               .set('x-auth',UsersTestArray[0].tokens[0].token)
               .send(todoUpdate)
               .expect(200)
               .expect((res) => {
                   todos.findById(id).then((todo) => {
                       let resFormatted = _.pick(res.body.todo,["completed","text"]);
                       chai.expect(resFormatted).to.deep.equal(todoUpdate);
                       chai.expect(res.body.todo.completedAt).to.be.null;
                   });
               }).end(done)
       });

       it("Should return 404 if todo was`nt found",(done) => {
           const id = new ObjectID().toHexString();
           request(app)
               .patch(`/todos/${id}`)
               .set('x-auth',UsersTestArray[0].tokens[0].token)
               .expect(404)
               .end(done)
       });
       it("Should return 404 if id isn`t valid",(done) => {
           request(app)
               .patch(`/todos/123abc`)
               .set('x-auth',UsersTestArray[0].tokens[0].token)
               .expect(404)
               .end(done)
       });



    });
    describe('POST /users',() =>{
        it("Should create a user",(done) => {
            request(app)
               .post("/users")
               .send({email:"saarTest@exapmle.com",password:"12sa"})
                .expect(200)
                .expect((res) =>{
                    User.findById(res.body._id).then((user) => {
                        chai.expect(user).not.null;
                        chai.expect(res.header['x-auth']).is.equal(user.tokens[0].token);
                        return bcrypt.compare("12sa",user.password)
                    }).then((bool) => {
                        chai.expect(bool).is.true;
                    })
                })
                .end(done)
        });
        it("Should return validation errors if request is invalid",(done) =>{
            request(app)
                .post("/users")
                .send({email:"saffds",password:12})
                .expect(400)
                .end(done)
        });
        it("Should return email error email already exists.",(done) =>{
            request(app)
                .post("/users")
                .send({email:"saar@example.com",password:123})
                .expect(400)
                .end(done)
        })
    });

    describe("POST /users/login",()=>{
       it("Should respond with a user id, email, newly generated token",(done) =>{
           let email = UsersTestArray[0].email;
           let password = UsersTestArray[0].password;
           request(app)
               .post("/users/login")
               .send({email,password})
               .expect(200)
               .expect((res) =>{
                   chai.expect(res.body.email).to.be.equal(email);

                   //expects that the res.body will only have email,_id and nothing else ! (awesome assertion)
                   chai.expect(res.body).to.have.all.keys('email','_id');
               })
               .end((err,res) =>{

                   //if there was an error in the assertion above , show it and finish the test.
                   if(err){
                       done(err)
                   }

                   User.findById(res.body._id).then((user) =>{

                       //expects that the token responded is indeed the last token generated for that user.
                       chai.expect(user.tokens[user.tokens.length-1].token).to.be.equal(res.header['x-auth']);
                       done();
                   }).catch((e)=>done(e))
               })
       });
       it("Should respond with 401 (unauthorized credentials)",(done) =>{
           let email = "lala@notFound.com";
           let password = "1234";
           request(app)
               .post("/users/login")
               .send({email,password})
               .expect(401)
               .end(done)
       })
    });

    describe("DELETE /users/me/token",() =>{
       it("Should logout a user (delete his token from the DB)",(done) =>{
           let token = UsersTestArray[0].tokens[0].token;
           request(app)
               .delete("/users/me/token")
               .set('x-auth',token)
               .expect(200)
               .end((err) => {
                   if(err) {
                       done(err);
                   }

                   User.findById(UsersTestArray[0]._id).then((user) =>{
                       chai.expect(user.tokens.length).to.equal(0);
                       done();
                   }).catch((e) => done(e))
               })
       });

       it("Should return Unauthorized when trying to logout with a non existent user.",(done) =>{
            request(app)
                .delete("/users/me/token")
                .expect(401)
                .end(done)
       })
    });

    describe('GET /users/me',() =>{
       //test that when a token is supplied in the x-auth header the corresponding is responded.
        //test that when there is no token a 401 is returned.
        it("Should respond with a user by the token",(done) =>{
            request(app)
                .get("/users/me")
                .set('x-auth',UsersTestArray[0].tokens[0].token)
                .expect(200)
                .expect((res) =>{
                    chai.expect(res.body._id).to.equal(UsersTestArray[0]._id.toString());
                    chai.expect(res.body.email).to.equal(UsersTestArray[0].email);
                })
                .end(done)
        });

        it("Should respond with a 401",(done) =>{
            request(app)
                .get("/users/me")
                .expect(401)
                .expect((res) =>{
                    chai.expect(res.body).to.be.empty; // empty defines an empty object - {}
                })
                .end(done)
        })
    });


});

server.close();