const axios = require('axios')

module.exports = (req,res,next)=>{
    if(req.user){
      next();
    }else{
      res.redirect('/login');
    }
  }