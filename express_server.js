const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());  
app.use(express.urlencoded());

const urlDatabase = {
  asdf: {
    longURL: "https://lighthouselabs.ca",
    shortURL: "asdf"
  },
  qwerty: {
    longURL: "https://reddit.com",
    shortURL: "qwerty"
  }
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

// Object.values(object) returns array of all values
function emailLookup(email) {
  let keys = Object.keys(users);
  for (let i=0; i<keys.length; i++) {
    if (users[keys[i]].email === email) {
      return users[keys[i]]
    }
  }
  return null;
}

function generateBaseTemplateVars(user_id) {
  return {
    user_id,
    email: user_id && users[user_id] ? users[user_id].email : ""
  }
}

app.get("/", (req, res) => {
  res.send("Hello");
})

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = generateBaseTemplateVars(user_id)
  if (user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
  }
})

app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const urls = user_id ?
    users[user_id].urls.reduce((acc, nextUrl) => {
      acc[nextUrl] = urlDatabase[nextUrl]
      return acc
    }, {}) :
    {}

  const templateVars = {
    ...generateBaseTemplateVars(user_id),
    urls
  }
  res.render("urls_index", templateVars);
})

app.post("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;

  const templateVars = {
    ...generateBaseTemplateVars(user_id),
    shortURL,
    longURL
  }
  urlDatabase[shortURL] = {longURL, shortURL};

  users[user_id].urls.push(shortURL);
  res.redirect(`/urls/${templateVars.shortURL}`);
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = generateBaseTemplateVars(user_id)
  res.render("registration", templateVars);
})

app.post("/register", (req, res) => {
  const user_id = generateRandomString(8);
  if (!req.body.email) {
    res.redirect("/register", 400);
  } else if (emailLookup(req.body.email)){
    res.redirect("/register", 400);
  } else {
    users[user_id] = {
      id: user_id, 
      email: req.body.email, 
      password: bcrypt.hashSync(req.body.password, 10),
      urls: []
    };
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
})

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = generateBaseTemplateVars(user_id);
  res.render("login", templateVars);
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      res.cookie("user_id", user.user_id);
      res.redirect("/urls");
    } else {
      res.redirect("/login", 403);
    }
  } else {
    res.redirect("/login", 403);
  }
})

app.get("/urls/:shortURL",(req, res) => {
  const user_id = req.cookies.user_id;
  const shortURL = req.params.shortURL
  const templateVars = { 
    ...generateBaseTemplateVars(user_id),
    shortURL, 
    longURL: urlDatabase[shortURL].longURL
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.cookies.user_id;
  const shortURL = req.params.shortURL;

  const user = users[user_id]
  if (user && user.urls.includes(shortURL)) {
    delete urlDatabase[shortURL];
    user.urls = user.urls.filter((url) => url !== shortURL)
    res.redirect("/urls");
  } else {
    console.log("delete unsuccessful")
    res.redirect("/urls", 403);
  }
})

app.post("/urls/:shortURL", (req, res) => {
  // idk
  res.redirect(`/urls/${req.params.shortURL}`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})