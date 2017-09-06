
module.exports = (req,res,next)=>{
    console.log(req.method, req.originalUrl, "user : ", !!req.user )
    if(req.user){
      next();
    }else{
      res.redirect('/login');
    }
  }