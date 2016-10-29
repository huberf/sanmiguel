var express = require('express');
var bodyParser = require('body-parser');
var http = require('http').Server(app);

//Load twilio module
var twilio = require('twilio');
var twilioSid = process.env.TWILIO_SID;
var twilioAuth = process.env.TWILIO_AUTH;
var client = new twilio.RestClient(twilioSid, twilioAuth);

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
var db = mongoose.connect(`mongodb://${mongoUser}:${mongoPass}@ds041613.mongolab.com:41613/tag`);

function sendMessage(recipient, message) {
  client.sms.messages.create({
    to: recipient,
    from: '+19312288468',
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
  res.send("Success");
});
