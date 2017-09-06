const passport = require('passport');
const isEmpty = require ('lodash/isEmpty');
const dbUser = require ('../db/dbUser');
const dbProduct = require('../db/dbProduct');
const dbPurchase = require('../db/dbPurchase')
const axios = require('axios')
const config = require('../config')
const isLogged = require('./isLogged')


module.exports = (app) => {

  app.post('/',(req,res)=>{
    console.log('root post method')
    
      if(req.user){
        res.send({
          username : req.user.name,
          auth : 'true'
        });
      }else{
        res.send({auth : 'false'});
      }
    }
  );
  

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
        // res.send();
      }
  );

  app.get('/Product',
    (req, res) => {
      dbProduct.listProduct(req, res);
    }
  )

  app.post('/Product',
    (req, res) => {
      dbProduct.createProduct(req.body)
        .then(data => res.send(data));
    }
  );

  app.get('/Product/:id',
    (req, res) => {
      db.findItem(req.params.id)
          .then(data => res.send(data));
    }
  )

  app.put('/Product/:id',
    (req, res) => {
      db.editProduct(req.params.id, req.body)
        .then(data => res.send(data));
    }
  )

  app.delete('/Product/:id',
    (req, res) => {
      db.deleteProduct(req.params.id)
        .then(data => res.send(data));
    }
  )

  app.post('/item/:id', (req , res)=>{
    dbProduct.findItem( req.params.id, res)    
  })

  app.post('/item',
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
