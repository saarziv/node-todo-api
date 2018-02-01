const request = require('supertest');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {app,server} = require('../server/server');
const {todos} = require('../server/db/models/todo');

chai.use(sinonChai);

//before each test run it deletes all items in db.
beforeEach((done) => {
   todos.remove({}).then(()=> done());
});

describe("Server tests",() => {

    describe("POST /todo", () => {
        let text = "go to steve aoki";

        it("Should create a todo",(done) =>{
            request(app)
               .post('/todo')
               .send({text})
               .expect(200)
               .expect((res) => {
                   chai.expect(res.body.text).to.deep.equal(text);
               })
               .end((err,res) => {
                    if(err){
                        return done(err);
                    }
                    todos.find()
                        .then((todos)=>{
                            chai.expect(todos[0].text).to.be.equal(text);
                            chai.expect(todos.length).to.be.equal(1);
                            done();
                        })
                        .catch((err)=>done(err))
               });

        });
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
});

server.close();