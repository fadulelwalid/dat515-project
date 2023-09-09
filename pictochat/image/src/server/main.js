require('dotenv').config();
const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const mysql = require('mysql2')
const http = require('http')
const server = http.createServer(app)

// semicolon y u no work D:<
// https://knowyourmeme.com/memes/y-u-no-guy
const sql_create_tables = [`
  CREATE TABLE IF NOT EXISTS rooms (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(256) UNIQUE
  );
`,`
  CREATE TABLE IF NOT EXISTS users (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(256) UNIQUE,
    in_room int,
    FOREIGN KEY (in_room) REFERENCES rooms(id)
  );
`,`
  CREATE TABLE IF NOT EXISTS photo (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    creator int NOT NULL,
    FOREIGN KEY (creator) REFERENCES users(id)
  );
`]

var con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
})

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!")

  for (const sql_create_table in sql_create_tables) {
    con.query(sql_create_tables[sql_create_table], function (err, result) {
      if (err) throw err
      console.log("Result: " + result)
    })
  }
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/signin', (req, res) => {

  con.query("SELECT name FROM users WHERE (users.name = ?)", req.body.username, function (err, result) {
    if (err) throw err
    console.log(result.length)
    if(result.length === 0) { // javascript really has ===
      con.query("INSERT INTO users (name) VALUES (?)", req.body.username, function (err, result) {
        if (err) throw err
        res.redirect(`/pictochat?name=${req.body.username}`)
      })
    } else {
      res.redirect(`/pictochat?name=${req.body.username}`)
    }
  })
})

app.post('/create_room', (req, res) => {
  console.log(req.body)
  con.query("SELECT name FROM rooms WHERE (rooms.name = ?)", req.body.room, function (err, result) {
    if (err) throw err
    console.log(result.length)
    if(result.length === 0) {
      con.query("INSERT INTO rooms (name) VALUES (?)", req.body.room, function (err, result) {
        if (err) throw err
        res.redirect(`/pictochat?name=${req.query.name}&room=${req.body.room}`)
      })
    } else {
      res.send(`room ${req.body.room} already exists`)
    }
  })
})

app.get('/get_rooms', (req, res) => {
  con.query("SELECT * FROM rooms", function (err, result) {
    if (err) throw err
    res.send(JSON.stringify(result))
  })
})

app.get('/', (req, res) => {
  res.sendFile('/html/index.html')
})

app.get('/pictochat', (req, res) => {
  console.log(req.query.name)
  res.sendFile('/html/pictochat.html')
})

// Start the HTTP server
server.listen(80, () => {
  console.log('listening on *:80')
})


