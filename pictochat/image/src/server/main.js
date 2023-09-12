require('dotenv').config();
const express = require('express')
const { Server } = require('socket.io');
var bodyParser = require('body-parser')
const app = express()
const mysql = require('mysql2')
const http = require('http')
const server = http.createServer(app)
const io = new Server(server);

const sql_create_tables = [`
  CREATE TABLE IF NOT EXISTS rooms (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(256) UNIQUE
  );
`,`
  CREATE TABLE IF NOT EXISTS users (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(256) UNIQUE,
    in_room int NULL,
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
  con.query("SELECT name FROM users WHERE (users.name = ?);", req.body.user, function (err, result) {
    if (err) throw err
    if(result.length === 0) {
      con.query("INSERT INTO users (name) VALUES (?);", req.body.user, function (err, result) {
        if (err) throw err
        res.redirect(`/pictochat?user=${req.body.user}`)
      })
    } else {
      res.redirect(`/pictochat?user=${req.body.user}`)
    }
  })
})

app.post('/create_room', (req, res) => {
  console.log(req.body)
  console.log(req.body.user)
  con.query("SELECT name FROM rooms WHERE (rooms.name = ?);", req.body.room, function (err, result) {
    if (err) throw err
    if(result.length === 0) {
      con.query("INSERT INTO rooms (name) VALUES (?);", req.body.room, function (err, result) {
        if (err) throw err
        res.redirect(`/room?user=${req.body.user}&room=${req.body.room}`)
      })
    } else {
      res.send(`room ${req.body.room} already exists`)
    }
  })
})

app.get('/get_rooms', (req, res) => {
  con.query("SELECT * FROM rooms;", function (err, result) {
    if (err) throw err
    res.send(JSON.stringify(result))
  })
})

app.get('/', (req, res) => {
  res.sendFile('/html/index.html')
})

app.get('/room', (req, res) => {
  res.sendFile('/html/room.html')
})

app.get('/pictochat', (req, res) => {
  res.sendFile('/html/pictochat.html')
})

io.on('connection', (socket) => {
  console.log('a user connected');

  let user = undefined
  let room = undefined

  socket.on('join_room', (user_n_room) => {
    user_n_room = user_n_room.split(",")
    console.log(user_n_room)
    user = user_n_room[0]
    room = user_n_room[1]

    socket.join(room)

    con.query("SELECT (id) FROM rooms WHERE (name=?);", room, function(err, result) {
      if (err) throw err
      room_id = result[0].id

      con.query("UPDATE users SET in_room = ? WHERE name=?;", [room_id, user], function (err, result) {
        if (err) throw err
        con.query("SELECT name FROM users WHERE (in_room=?);", room_id, function(err, result) {
          if (err) throw err
          io.in(room).emit("users", result)
        })
      })
    })

    console.log(`user ${user} joins room ${room}`)
  })

  socket.on('disconnect', () => {
    con.query("UPDATE users SET (in_room=NULL) WHERE (name=NULL);", user, function (err, result) {
      if (err) throw err
      con.query("SELECT (id) FROM rooms WHERE (name=?);", room, function(err, result) {
        room_id = result[0].id
        con.query("SELECT name FROM users WHERE (in_room=?);", room_id, function(err, result) {
          if (err) throw err
          io.in(room).emit("users", result)
        })
      })
    })
  });
});

// Start the HTTP server
server.listen(80, () => {
  console.log('listening on *:80')
})


