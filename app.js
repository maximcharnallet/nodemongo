var express = require('express');
var app = express();
var path = require('path');

var bodyParser = require('body-parser');

// -- connect to db
var mongoose = require('mongoose');
// 
// mongodb://username:password@host:port/datab
// mongodb://use

var mongoHost = process.env.DATABASE_HOST || 'localhost';
var mongoPort = process.env.DATABASE_PORT || 27017;
var username = process.env.DATABASE_USER || 'admin';
var password = process.env.DATABASE_PASSWORD || 'password';
var database = process.env.DATABASE_NAME || 'test';
mongoose.connect('mongodb://'+username+':'+password+'@'+mongoHost+':'+mongoPort+'/'+database);

// mongodb://use
//mongoose.connect('mongodb://localhost:27017/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});

var userSchema = mongoose.Schema({
    firstname: String,
    lastname: String
});

var User = mongoose.model('User', userSchema);

//setting assets/static files
app.use(express.static('./public'));

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/users', async (req, res) => {
	console.log("Received for add>"+
        JSON.stringify(req.body));
	var user = req.body;
	
  var toBeAdded = new User(user);

  var newUser =  await toBeAdded.save();
  
  console.log("user with id>"+newUser['_id']+" created!");
  
  res.setHeader('Location', 
        '/users/' + user['_id']);
  res.status(201).send(null);
      	
});

app.get('/users', async (req, res) => {	
    var users = await User.find();
    res.json(users);    
});

app.get('/users/:id', async (req, res) => {	
    var uid = req.params.id;    
    var user = await User.findById(req.params.id);
    if (!user) {            
      res.status(404).send(null);    
    }
    res.json(user);
});

app.delete('/users/:id', async (req, res) => {    
	  var uid = req.params.id;
    console.log("requesting user removal for uid "+uid);
    var user = await User.findByIdAndRemove(uid);
    console.log("user with id>"+uid+" has been deleted");
    res.status(200).end();
    //TODO 404
});

app.put('/users', async (req, res) => {
	console.log("Receive for update>"+JSON.stringify(req.body));
	var toBeUpdated = new User(req.body);  
	var uid = toBeUpdated['_id'];
  var user = await User.findByIdAndUpdate(uid, toBeUpdated);
  console.log("user with id>"+uid+" has been updated");
  res.status(200).end();
  //TODO 404   		
});

app.listen(3000);