const dbUser = require('../db/dbUser');

const isLogged = require('../middleWare/isLogged')

module.exports = (app) => {

    app.use('/profile', isLogged)

    app.post('/profile', (req, res)=>
        res.send(req.user)
    );
  
    app.put('/profile', (req,res)=>
        dbUser.saveProfile(req,res)
    );

    app.post('/editpassword', isLogged,(req, res)=>
        dbUser.editPassword(req,res)
    )

}