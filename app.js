var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var port    = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost/votingapp');

var votingSchema = new mongoose.Schema({
    question:String,
    choice:[String]
});

var  Voting= mongoose.model('Voting',votingSchema);

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));


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
   Voting.find({},function(err,found){
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
  var question = req.body.question;
  var choice = req.body.choice;
  Voting.create({question:question,choice:choice},function(err,created){
    if(err){
      console.log(err);
      res.redirect('/polls');
    }else{
      res.redirect('/polls');
    }
  });
});

//showing a particular polls
app.get('/polls/show/:id',function(req,res){
   Voting.findById(req.params.id,function(err,foundOne){
     if(err){
       console.log(err);
       res.redirect('/polls');
     }else{
       res.render('show',{foundOne:foundOne});
     }
   });
});

app.listen(port);
console.log('The magic happens on port ' + port);
