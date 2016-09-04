'use strict'
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var port    = process.env.PORT || 8080;
var methodOverride = require('method-override');

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

const Poll = mongoose.model('Poll', PollSchema);
const Option = mongoose.model('Option', OptionSchema);

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

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
app.post('/polls/show/:id/vote',function(req,res){

      var foundC = req.body.choices[0];
      console.log(foundC);
          Poll.findOne({'options.text':foundC},function(err,option){
            if(err){
              console.log(err);
              res.redirect('back');
            }else{
              var output = option.options.filter(function(value){ return value.text==foundC;});
              console.log(output);
              res.redirect('back');
            }
          });
        });  
app.listen(port);
console.log('The magic happens on port ' + port);
