const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());  
app.use(express.urlencoded());

const urlDatabase = {
  "b2xVn2":"http://www.lighthouselabs.ca",
  "9sm5xK":"http://www.google.com"
};

const users = {};

function generateRandomString(length) {
  let result = "";
  let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  for (let i=0; i<length; i++) {
    result += arr[Math.floor(Math.random()*arr.length)]
  }
  return result
}

function emailLookup(email) {
  let keys = Object.keys(users);
  let result = false;
  for (let i=0; i<keys.length; i++) {
    if (users[keys[i]].email) {
      result = true
    }
  }
  return result
}

app.get("/", (req, res) => {
  res.send("Hello");
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {
    urls: urlDatabase,
    email: users[user_id].email,
    user_id: user_id
  };
  console.log(users);
  console.log(Object.keys(users));
  res.render("urls_index", templateVars);
})

app.post("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {
    shortURL: generateRandomString(6),
    longURL: req.body.longURL,
    email: users[user_id].email,
    user_id: user_id
  }
  urlDatabase[templateVars.shortURL] = templateVars.longURL;
  res.redirect(`/urls/${templateVars.shortURL}`);
})

app.get("/new", (req, res) => {
  const user_id = req.cookies.user;
  const templateVars = {
    email: users[user_id].email,
    user_id: user_id
  }
  res.render("urls_new", templateVars);
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.user_id);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  const user_id = req.cookies.user;
  const templateVars = {
    user_id: user_id,
    user: users[user_id]
  }
  res.render("registration", templateVars);
})

app.post("/register", (req, res) => {
  const userID = generateRandomString(8);
  if (!req.body.email) {
    res.redirect("/register", 400);
  } else if (emailLookup(req.body.email)){
    res.redirect("/register", 400);
  }
  users[userID] = {id: userID, email: req.body.email, password: req.body.Password}
  res.cookie("user_id", userID);
  res.redirect("/urls");
})

app.get("/urls/:shortURL",(req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    email: users[user_id].email
  };  
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[shortURL],
    email: users[user_id].email
  }
  res.redirect(templateVars.longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})