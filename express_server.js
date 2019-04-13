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
    password: "abc"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//Database objects here

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
}; //urlDatabase, as we have more data, what about keep it {could be anything}.
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

// URLs for users only
app.get("/urls/new", (req, res) => {
  if (!req.session.username) {
    res.redirect("/login?alert=true");
  }
  const user_id = users[req.session.user_id].email;
  console.log("new:", user_id);
  let templateVars = { urls: urlDatabase, "user":req.cookies.user_id};
  res.redirect("login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    "user":req.cookies.user_id };
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

//LOGIN 
app.post("/login", (req, res) => {
  console.log('test');
  var foundUser = findEmail(req.body.email)
  if (foundUser) {
    console.log(foundUser)
    if (foundUser.password === req.body.password) {
      res.cookie('user_id', foundUser.id);
      res.redirect('/urls');
    } else {
      res.send("<html><body> Password doesn't match </body></html>\n");
    }
  }
  else {
    res.send("<html><h1> User doens't exist </h1></html>\n");
  }
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
    res.status(400).send("<html><h2>This email already exists. Try a new one!<html><>");; //Handle Registration Errors
  }
});
//Create a Login Page: Get /login endpoint
app.get("/login", (req, res) => {
  res.render("login");
});

app.listen(PORT, () => {//adding this in the bottom to make things in order
  console.log(`Jaffar is now listening and watching you, so speak and shout out your desires!!!!! ${PORT}!`);
});