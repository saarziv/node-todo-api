const _ = require('lodash');
const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {ObjectID} = require('mongodb');

const {app,server} = require('../server/server');
const {todos} = require('../server/db/models/todo');

chai.use(sinonChai);

//before each test run it deletes all items in db.
const todosTestArray = [
    {text:"test todo 1", _id: new ObjectID()},
    {text:"test todo 2", _id: new ObjectID(), completedAt:1223,completed:true}
];

beforeEach((done) => {
   todos.remove({}).then(()=>{
       return todos.insertMany(todosTestArray)
   }).then(() => done());
});

describe("Server tests",() => {

    describe("POST /todos", () => {
       let text = "go to steve aoki";

        it("Should create a todo",(done) =>{
            request(app)
               .post('/todos')
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
               .expect(200)
               .end((err,res) => {
                   if(err){
                        done(err);
                   }
                   chai.expect(res.body.todos.length).to.be.equal(2);
                   done();
               })
        });


    });

    describe("GET /todos/:id",() => {
        it("Should return todo by id",(done) => {
            const id = todosTestArray[0]._id.toHexString();
            const text = "test todo 1";
            request(app)
                .get(`/todos/${id}`)
                .expect(200)
                .end((err,res) => {
                    if(err) {
                        return done(err);
                    }
                    chai.expect(res.body.todo._id).to.be.equal(id);
                    chai.expect(res.body.todo.text).to.be.equal(text);
                    done();
                })
        });

        it("Should return 404 when todo not found",(done) => {
            const falseId = new ObjectID().toHexString();
            request(app)
                .get(`/todos/${falseId}`)
                .expect(404)
                .end((err, res) => {
                    if(err){
                        return done(err);
                    }
                    chai.expect(res.text).to.be.equal(`the id :${falseId} does not exist`);
                    done();
                })
        });

        it("Should return 404 when id is not valid",(done) => {
            const notValidId = "1";
            request(app)
                .get(`/todos/${notValidId}`)
                .expect(404)
                .end((err,res) => {
                    if(err){
                        return done(err);
                    }
                    // console.log(res.text);
                    // chai.expect(res.text).to.be.equal(4);
                    done();
                })
        })
    })

    describe("DELETE /todos/:id",() => {

        it("Should delete a document and return it",(done) => {
            const id = todosTestArray[0]._id.toHexString();
            request(app)
                .delete(`/todos/${id}`)
                .expect(200)
                .end((err,res) => {
                    if(err) {
                        return done(err);
                    }
                    todos.findById(id).then((doc) => {
                        chai.expect(doc).to.be.null;
                        chai.expect(id).to.be.equal(res.body.todo._id);
                        done();
                    }).catch((e) => done(e));
                });

        });
        it("Should return 404 when supplied an non existent id",(done) =>{
            const id = new ObjectID().toHexString();
            request(app)
                .delete(`/todos/${id}`)
                .expect(404)
                .end(done)
        });
        it("Should return 404 when supplied an invalid id",(done) =>{
            request(app)
                .delete(`/todos/123abc`)
                .expect(404)
                .end(done)
        })

    })

    describe("PATCH /todos/:id", (done) =>{
       it("Should update a todo`s completed at,text property",(done) =>{
           const id = todosTestArray[0]._id.toHexString();
           const todoUpdate= {completed:true,text:"from tests."};
           request(app)
               .patch(`/todos/${id}`)
               .send(todoUpdate)
               .expect(200)
               .end((err,res) => {
                   if(err) {
                       return done(err);
                   }
                   todos.findById(id).then((todo) => {
                       let resFormatted = _.pick(res.body.todo,["completed","text"]);
                       chai.expect(resFormatted).to.be.deep.equal(todoUpdate);
                       chai.expect(todo.completed).to.be.equal(resFormatted.completed);
                       chai.expect(todo.text).to.be.equal(resFormatted.text);
                       chai.expect(res.body.todo.completedAt).to.not.be.null;
                       done();
                   });
               });
       });

       it("Should update a todo`s to completed false and reset the completed at property",(done) => {

           const id = todosTestArray[1]._id.toHexString();
           const todoUpdate= {completed:false,text:"from tests2."};
           request(app)
               .patch(`/todos/${id}`)
               .expect(200)
               .send(todoUpdate)
               .end((err,res) => {
                   if(err) {
                       return done(err);
                   }

                   todos.findById(id).thten((todo) => {
                       let resFormatted = _.pick(res.body.todo,["completed","text"]);
                       chai.expect(resFormatted).to.deep.equal(todoUpdate);
                       chai.expect(res.body.todo.completedAt).to.be.null;
                       done();

                   });
               });
       });

       it("Should return 404 if todo was`nt found",(done) => {
           const id = new ObjectID().toHexString();
           request(app)
               .patch(`/todos/${id}`)
               .expect(404)
               .end(done)
       });
       it("Should return 404 if id isn`t valid",(done) => {
           request(app)
               .patch(`/todos/123abc`)
               .expect(404)
               .end(done)
       });


    });


});

server.close();