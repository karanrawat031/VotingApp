var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var port    = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost/votingapp');

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));


//landing route
app.get('/',function(req,res){
   res.render('landing');
});

//index route
app.get('/home',function(req,res){
   res.send('Index Page');
});

app.listen(port);
console.log('The magic happens on port ' + port);
