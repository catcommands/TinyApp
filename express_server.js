var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL/delete', function (req, res) {
  //let templateVars = req.params.shortURL
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  //res.send('POST request to the homepage')
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