// (1) - Require
const bcrypt = require("bcrypt");
let express = require("express");
let app = express();
let PORT = 8080;
let cookieSession = require("cookie-session");

// (2) - app.use
app.use(cookieSession({
  name: "session",
  keys: ["Done"],
  maxAge: 24 * 60 * 60 * 1000
}));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// (3) - app.set
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
let findEmail = function(email){ 
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  } return false;
};


let findUser = function(user_id) { 
  for (let user in users){
    if (user_id === user) {
      return users[user];  
    }
  } return false;
};

// (4) - Helper functions
// ***************** BCRYPT FUNCTION FOR PASSWORDS *****************
function hasher(password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  return hashedPassword;
}

// ****************** GENERATE RANDOM STRING ******************

function generateRandomString() {
  let url = "";
  const length = 6;
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++)
    url += chars.charAt(Math.floor(Math.random() * chars.length));
  return url;
}


// (5-a) - The routes: app.get

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

// ****************** DEFINING USER ID ******************

app.get("/urls", (req, res) => {
  let myUrls = {};
  for (let key in urlDatabase) {
    let userID = urlDatabase[key].userID
    if (req.session.user_id === userID) {
      myUrls[key] = urlDatabase[key];
    }
  }
  let templateVars = { urls: myUrls, user: findUser(req.session.user_id)};
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});


// **************** GET REGISTER ENDPOINT ****************

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// ****************** GET LOGIN REQUEST ******************

app.get("/login", (req, res) => {
  res.render("login");
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
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    return res.status(400);
    res.send("Page doesn't exist");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// (5-b) - Rest of the route handlers: app.post

// ************ DELETE URLs BY AUTHORIZED USERS ONLY ************

app.post('/urls/:shortURL/delete', function (req, res) {
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect("/login?alert=true");
  }
});

// ***************** ANYONE CAN VISIT SHORT URLs *****************

app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id };
    res.redirect('/urls');
});

app.post('/urls/:id', function (req, res) {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// ***************** LOGIN POST REQUEST METHOD *****************

app.post("/login", (req, res) => {
  let foundUser = findEmail(req.body.email);
  if (foundUser) {
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
  res.redirect('');
});

// ******************* POST REGISTER ENDPOINT *******************

app.post("/register", (req, res) => {
  if (!findEmail(req.body.email)){
    let register = generateRandomString();
    req.session.user_id = register;
    let hash = bcrypt.hashSync(req.body.password, 10)
    users[register] = {id : register, email: req.body.email, password: hash};
    res.redirect("/urls");
  } else {
    res.status(400).send("<html><h2>This email already exists. Try a new one!<html><>");
  }
});

// (6) - app.listen
// ******************** PORT 8080 SERVER LISTENING *******************
app.listen(PORT, () => {
  console.log(`Welcome to Jaffar's Project: TinyApp is istening...!!! ${PORT}!`);
});

