//jshint esversion:6
require ("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//allow  mongoose to connect to our local database
mongoose.connect("mongodb://localhost:27017/UserDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});
//process.env.  is used to select the files and info that you want to protect from the public is viewing
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); //this comes before mongoose.model below because the schema passes in as a parameter to the user model


const User = new mongoose.model("User", userSchema);




app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  const newUser = new User ({
    email: req.body.username,
    password: req.body.password
  });
   //when new use info is saved. It will then be encryped behind the scenes by the plugin above
 newUser.save(function(err){
    if (err){
      console.log(err);
    } else {
      res.render("secrets");
    }
  });

});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password){
          res.render("secrets");
        }
      }
    }
  });
});





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
