var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);

//Load twilio module
var twilio = require('twilio');
var twilioSid = process.env.TWILIO_SID;
var twilioAuth = process.env.TWILIO_AUTH;
var masterNumber = process.env.MASTER_NUMBER;
var client = new twilio.RestClient(twilioSid, twilioAuth);

//Setting up the port to listen to
app.set('port', (process.env.PORT || 5000));

//Setting up the resource directory
app.use(express.static(__dirname + '/public'));

app.use( bodyParser.urlencoded({ extended: false }));
app.use( bodyParser.json());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  phone: String,
  messages: Array,
  userId: String,
  creationDate: String
});
var User = mongoose.model('User', userSchema);
var mongoUser = process.env.MONGO_USER;
var mongoPass = process.env.MONGO_PASS;
var mongoSlug = process.env.MONGO_SLUG;
var db = mongoose.connect(`mongodb://${mongoUser}:${mongoPass}${mongoSlug}`);

function sendMessage(recipient, message) {
  client.sms.messages.create({
    to: recipient,
    from: masterNumber,
    body: message
  }, function(err, mess) {
    if(err) {
      console.log('An error occured: ' + err);
    } else {
      console.log('!Message sent!');
    }
  });
}

app.post('/api/v1/text', function(req, res) {
  console.log(req.body.Body);
  var message = req.body.Body;
  console.log(req.body);
  User.find({phone: req.body.From}, (err, user) => {
    if( user[0] ) {
      user[0].messages.push([req.body.Body]);
      user[0].save();
      sendMessage(req.body.From, `You've messaged us ${user[0].messages.length} times.`);
    } else {
      var newUser = new User({phone: req.body.From, messages: [[req.body.Body]], userId: 'None', creationDate: 'None'});
      newUser.save();
    }
    sendMessage(req.body.From, `We received the message: ${req.body.Body}, from the number ${req.body.From}, which is located in ${req.body.FromCity}, ${req.body.FromState}. We hope you like your coffee!`);
  });
  res.send("Success");
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
