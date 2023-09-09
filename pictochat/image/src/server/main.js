const express = require('express')
const app = express()
const mysql = require('mysql2')
const http = require('http')
const server = http.createServer(app)

const sql_create_tables = `
CREATE TABLE IF NOT EXISTS rooms (
  id int NOT NULL PRIMARY KEY AUTOINCREMENT
  name varchar(256)
);

CREATE TABLE IF NOT EXISTS users (
  id int NOT NULL PRIMARY KEY AUTOINCREMENT,
  name varchar(256),
  in_room int,
  FOREIGN KEY (in_room) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS photo (
  id int NOT NULL PRIMARY KEY AUTOINCREMENT,
  creator int NOT NULL,
  FOREIGN KEY (creator) REFERENCES users(id)
);
`

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Password"
})

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  con.query(sql_create_tables, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result);
  });
})

app.get('/get_rooms', (req, res) => {



  rooms = [
    {
      id: 1,
      name: "Room 1"
    },
    {
      id: 2,
      name: "Room 2"
    },
    {
      id: 3,
      name: "Room 3"
    },
  ]


  res.send(JSON.stringify(rooms))
})

app.get('/', (req, res) => {
  res.sendFile('/html/index.html')
})

app.get('/pictochat', (req, res) => {
  res.sendFile('/html/pictochat.html')
})

// Start the HTTP server
server.listen(80, () => {
  console.log('listening on *:80')
})


