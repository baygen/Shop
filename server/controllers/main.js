const dbUser = require ('../db/dbUser');
const dbProduct = require('../db/dbProduct');
const passport = require('passport')

module.exports = (app) => {

  app.post('/',(req,res)=>{
      if(req.user){
        res.send({
          username : req.user.name,
          auth : 'true'
        });
      }else{
        res.send({ auth : 'false'});
      }
    }
  );
  app.post('/itemprices', (req, res )=>
    dbProduct.getMinMaxPrices( res)
  )


  app.post('/register',
    (req,res)=>dbUser.register(req,res)
  );

  app.post('/login',
      passport.authenticate('local'),
        (req,res)=> res.send(req.user.name)
  );

  app.post('/logout',
      (req,res )=>{
        if(req.user){
          req.logOut( err=>{
            if(err)console.log(err);
          });
        res.send()
        }
      }
  );

  app.post('/item/:id', (req , res)=>{
    dbProduct.findItem( req.params.id, res)    
  })

  app.get('/item',
    (req, res) => {
      dbProduct.listItem(req, res);
    }
  )


app.get('/props',
(req, res) => {
  dbProduct.listProps(req, res);
  }
)

app.get('/value',
(req, res) => {
  dbProduct.listValue(req, res);
  }
)

}
