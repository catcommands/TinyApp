// (1) - Require
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

// (2) - app.use
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
  maxAge: 24 * 60 * 60 * 1000
}));


app.use(bodyParser.urlencoded({extended: true}));

// (3) - app.set
app.set("view engine", "ejs"); // ejs as view engine for this app.


// ********************* DATABASE *********************

const users = { 
  "userRandomID": {
    id:"userRandomID", 
    email:"shah@jeff.com", 
    password: "puff-of-weed"
  },
 "user2RandomID": {
    id:"user2RandomID", 
    email: "weed@everywhere.canada", 
    password: "green-vomit"
  }
};

// ****************** DATABASE OBJECTS ******************

const urlDatabase = {
  b6UTxQ: { longURL: "http://www.google.com", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.jeffshah.com", userID: "jeffShah" }
};

//---------------------------------------------------------

// (4) - Helper functions
function validateEamil (email){
  for (id in users) {
    if (email === users[id].email){
      return users[id];
    } 
  }
  return false;
}

let findUser = function(user_id) { 
  for (let user in users){
    if (user_id === user) {
      return users[user];  
    }
  } return false;
};
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

app.get("/", (req, res) => {
  let user_id = req.session.user_id;
  if (!user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      "user_id": user_id,
      "urls": urlsForUser(user_id),
      "email": (users[user_id] ? users[user_id].email : users[user_id])
    };
  res.redirect("/urls", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
    if (!user_id) {
      res.redirect("/login");
    } else {
  let templateVars = { 
    "user_id": user_id, "urls": urlsForUser(user_id), "email":(users[user_id] ? users[user_id].enail : users[user_id])
  };
  res.render("urls_index", templateVars);
}
});


// ****************** GET LOGIN REQUEST ******************

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    email: (users[req.session.user_id] ? users[req.session.user_id].email : users[req.session.user_id])
  };
  res.render("login", templateVars);
});

// **************** GET REGISTER ENDPOINT ****************

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    email: (users[req.session.user_id] ? users[req.session.user_id].email : users[req.session.user_id])
  };
  res.render("register", templateVars);
});

// ******************* URLs FOR USERS ONLY *****************
function urlsForUser(id){
  let result = {};
  for (let shortURL in urlDatabase){
    if (urlDatabase[shortURL].userID === id){
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;
}

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login?alert=true");
  } else {
    const user_id = users[req.session.user_id].id;
    let templateVars = { 
      urls: urlDatabase, user: findUser(req.session.user_id)};
    res.render("urls_new", templateVars);
  }
});

//if a user is logged in or not,
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
  const url = urlDatabase[req.params.shortURL];
  let longURL = url && url.longURL;

  //if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    if (longURL) {
    res.redirect(longURL);
    } else {
      res.redirect(longURL);
    res.send(`${req.params.shortURL} Invalid Page`);
  }
  //res.redirect(longURL);
});


// (5-b) - Rest of the route handlers: app.post

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
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

app.post('/register', (req, res) => {  
  const emailType = req.body.email;
  const passwordType = req.body.password;
  const newuserID = generateRandomString();

  if(!emailType || !passwordType) {
    res.status(400);
    res.send("You need to type your email/or password");
  } else if(validateEamil(emailType)) {
    res.status (400);
    res.send("Email has been taken");
  } else {
    users[newuserID]["id"] = newuserID;
    users[newuserID]["email"] = emailType;
    users[newuserID]["password"] = hasher(passwordType);
    req.session.user_id = newuserID;
    res.redirect("urls");
  }
});

  if (!findEmail(req.body.email)){
    let register = generateRandomString();
    req.session.user_id = register;
    let hash = bcrypt.hashSync(req.body.password, 10);
    users[register] = {id : register, email: req.body.email, password: hash};
    res.redirect("/urls");
  } else {
    res.status(400).send("This email already exists. Try a new one!");
  }

// (6) - app.listen
// ******************** PORT 8080 SERVER LISTENING *******************
app.listen(PORT, () => {
  console.log(`Welcome to Jeff's Project: TinyApp is istening...!!! ${PORT}!`);
});