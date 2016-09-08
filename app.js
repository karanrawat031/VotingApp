'use strict'
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport    = require('passport');
var port    = process.env.PORT || 8080;
var methodOverride = require('method-override');
var LocalStrategy = require('passport-local');
var router = express.Router();
var passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect('mongodb://localhost/votingapp');

const Schema = mongoose.Schema;

//Options Schema
const OptionSchema = new Schema({
  text: String,
  votes : {type: Number, default: 0}
});

OptionSchema.method('vote', (updates, callback) => {
  this.votes += 1;
});

const PollSchema = new Schema({
  question : String,
  options : [OptionSchema]
});

//user schema
var UserSchema = new Schema({
    username: String,
    email:String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

const Poll = mongoose.model('Poll', PollSchema);
const Option = mongoose.model('Option', OptionSchema);
const User = mongoose.model('User', UserSchema);


app.use(require("express-session")({
    secret: "Hello There",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

//landing route
app.get('/',function(req,res){
   res.render('landing');
});

//index route
app.get('/add',function(req,res){
   res.render('index');
});

//all polls get route
app.get('/polls',function(req,res){
   Poll.find({},function(err,found){
     if(err){
       console.log(err);
       res.redirect('/polls');
     }else{
       res.render('polls',{found:found});
     }
   });
});

//adding post to db
app.post('/polls',function(req,res){
    
  let question = req.body.question;
  let options = req.body.choices;
  let optSchemas = options.map( (opt) => {
    return new Option({
      text : opt
    });
  });
  let poll = new Poll({
    question : question,
    options : optSchemas
  });
  poll.save((err)=>{
    if(err) return next(err);
    res.redirect('/polls');
  });

});

//showing a particular polls
app.get('/polls/show/:id',function(req,res){

  Poll.findById(req.params.id,function(err,foundOne){
     if(err){
       console.log(err);
       res.redirect('/polls');
     }else{
       res.render('show',{foundOne:foundOne});
     }
   });

});

//adding vote to particular choice of a particular post
app.put('/polls/show/:id',isLoggedIn,function(req,res){

      Poll.findById(req.params.id,function(err,found){
        if(err){
          console.log(err);
          res.redirect('back');
        }else{
          var selected = req.body.choices;
          var options = found.options;
          console.log(options);
          options.forEach(function(option){
              if(option.text == selected){
                option.votes+=1;
              }
          });
          console.log(options);
           res.redirect('back');
           found.save(function(err){
            console.log(err);
           });
        }
      });

});

//showing the register
app.get('/register',function(req,res){
  res.render('register');
});

//Into the database
app.post('/register',function(req,res){
   var newUser = new User({username: req.body.username,email:req.body.email});
   User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/"); 
        });
    });
});

// show login form
app.get("/login", function(req, res){
   res.render("login"); 
});

// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/polls",
        failureRedirect: "/login"
    }), function(req, res){
});

app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/polls");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(port);
console.log('The magic happens on port ' + port);
