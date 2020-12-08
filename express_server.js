const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

const urlDatabase = {
  "b2xVn2":"http://www.lighthouselabs.ca",
  "9sm5xK":"http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"]
  };  
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  }
  res.redirect(templateVars.longURL);
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const DeleteURL = req.params['shortURL'];
  delete urlDatabase[DeleteURL];
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  const EditURL = req.params['id'];
  res.redirect(EditURL);
})

app.post("/login", (req, res) => {
  const login = req.body;
  res.cookie('username', login.username);
  res.redirect('urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});