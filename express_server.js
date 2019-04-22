const bcrypt = require("bcrypt");
var express = require("express");
var app = express();
var PORT = 8080;
var cookieSession = require("cookie-session");

var app = express();

app.use(cookieSession({
  name: "session",
  keys: ["Done"],
  maxAge: 24 * 60 * 60 * 1000
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.set("view engine", "ejs");



// ********************* DATABASE *********************

const users = { 
  "aJ48lW": {
    id:"aJ48lW", 
    email:"jeff@canada.com", 
    password: "abc"
  },
 "user2RandomID": {
    id:"user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// ****************** DATABASE OBJECTS ******************

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
var findEmail = function(email){ 
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  } return false;
};

var findUser = function(user_id) { 
  for (let user in users){
    if (user_id === user) {
      return users[user];  
    }
  } return false;
};

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
// ******************* DEFINING USER ID *******************

app.get("/urls", (req, res) => {
  var myUrls = {}
  for (var key in urlDatabase) {
    var userID = urlDatabase[key].userID
    if (req.session.user_id === userID) {
      myUrls[key] = urlDatabase[key]
    }
  }
  let templateVars = { urls: myUrls, user: findUser(req.session.user_id)};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});


// ******************* URLs FOR USERS ONLY *****************

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login?alert=true");
  } else {
    const user_id = users[req.session.user_id].id;
    let templateVars = { urls: urlDatabase, user: findUser(req.session.user_id)};
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if(req.session.user_id && req.session.user_id === urlDatabase[req.params.shortURL].userID) {
  let templateVars = { shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.session.user_id,
    user: findUser(req.session.user_id)
  };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login")
  }
});

// ************ DELETE URLs BY AUTHORIZED USERS ONLY ************


app.post('/urls/:shortURL/delete', function (req, res) {
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect("/login?alert=true");
  }
});

// ******************* ANYONE CAN VISIT SHORT URLs *******************

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    return res.status(400);
    res.send("Page doesn't exist");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
    var shortURL = generateRandomString();
    var longURL = req.body.longURL;
    urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id };
    res.redirect('/urls');
});

app.post('/urls/:id', function (req, res) {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});


// ********************* GENERATE RANDOM STRING *********************

function generateRandomString() {
  var url = "";
  const length = 6;
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++)
    url += chars.charAt(Math.floor(Math.random() * chars.length));
  return url;
}

// ******************* LOGIN POST REQUEST METHOD *******************

app.post("/login", (req, res) => {
  var foundUser = findEmail(req.body.email);
  if (foundUser) {
    console.log(foundUser);
    if (bcrypt.compareSync(req.body.password, foundUser.password)) {
      req.session.user_id = foundUser.id;
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
  res.redirect('');
});

// ********************* GET REGISTER ENDPOINT *********************

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/logout", (req, res) => {
  req.session = null;
  //res.clearCookie('user_id');
  res.redirect('/urls');
});

// ********************* POST REGISTER ENDPOINT *********************

app.post("/register", (req, res) => {
  if (!findEmail(req.body.email)){
    console.log(findEmail(req.body.email));
    let register = generateRandomString();
    req.session.user_id = register;
    let hash = bcrypt.hashSync(req.body.password, 10)
    users[register] = {id : register, 
      email: req.body.email, 
      password: hash
    };
      console.log("users: ",users);
    res.redirect("/urls");
  } else {
    res.status(400).send("<html><h2>This email already exists. Try a new one!<html><>");
  }
});

// ********************* GET LOGIN REQUEST *********************

app.get("/login", (req, res) => {
  res.render("login");
});

// ********************* PORT 8080 SERVER LISTENING *********************
app.listen(PORT, () => {
  console.log(`Welcome to Jaffar's Project: TinyApp is istening...!!! ${PORT}!`);
});

// ********************* BCRYPT FUNCTION FOR PASSWORDS *********************
function hasher(password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return hashedPassword;
}