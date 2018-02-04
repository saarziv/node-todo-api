const {User} = require('../db/models/user');

var authenticate = (req,res,next) => {

    const token = req.header('x-auth');

    User.getByToken(token).then((user)=>{
        if(!user){
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e)=>res.status(401).send(e));

};

module.exports = {authenticate};

