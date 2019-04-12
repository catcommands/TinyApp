var express = require("express");
var app = express();
var PORT = 8080;
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "jeff@canada.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
var findEmail = function(email) { 
  for (let user in users) {
    if (email === users[user].email) {
      return users[user]
    // } else {
    //   return false;  
    }
  } return false;
}

var findUser = function(user_id) { 
  for (let user in users) {
    if (user_id === user) {
      return users[user];  
    }
  } return false;
}

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`I am listening now! Go Ahead! ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, "user":findUser(req.cookies.user_id)};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, "user":req.cookies.user_id};

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], "user":req.cookies.user_id };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL/delete', function (req, res) {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
    var shortURL = generateRandomString();
    var longURL = req.body.longURL;
    urlDatabase[shortURL]=longURL;
    res.redirect('/urls');
});

app.post('/urls/:id', function (req, res) {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
  console.log(urlDatabase);
});

function generateRandomString() {
  var url = "";
  const length = 6;
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++)
    url += chars.charAt(Math.floor(Math.random() * chars.length));
  return url;
}

app.post("/login", (req, res) => {
  console.log(req.body);
  var foundUser = findEmail(req.body.username)
  if (foundUser) {
    console.log(foundUser)
    res.cookie('user_id', foundUser.id);
  }
  res.redirect('/urls');
});

app.post("/edit", (req, res) => {
  console.log(req.body);
  res.cookie('user_id', req.body.user_id);
  res.redirect('');
});

// create a GET /register endpoint
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//Create a registration handler: POST /register endpoint
app.post("/register", (req, res) => {
  if (!findEmail(req.body.email)){
    console.log(findEmail(req.body.email));
    let register = generateRandomString();
    res.cookie("user_id", register);
    users[register] = {id : register, 
      email: req.body.email, 
      password: req.body.password};
      console.log("users: ",users);
    res.redirect("/urls");
  } else {
    res.status(400).send('email is taken');; //Handle Registration Errors
  }
});
//Create a Login Page: Get /login endpoint
app.get("/login", (req, res) => {
  res.render("login");
});