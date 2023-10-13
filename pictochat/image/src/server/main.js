require('dotenv').config()
const express = require('express')
const { Server } = require('socket.io')
var bodyParser = require('body-parser')
const app = express()
const mysql = require('mysql2')
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const sql_create_tables = [`
  CREATE TABLE IF NOT EXISTS rooms (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name varchar(255) UNIQUE
  )
`,`
CREATE TABLE IF NOT EXISTS users (
  id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name varchar(255) UNIQUE
)
`,`
CREATE TABLE IF NOT EXISTS sockets (
  id varchar(255) UNIQUE NOT NULL,
  room_id int NOT NULL,
  user_id int NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
`,`
  CREATE TABLE IF NOT EXISTS photo (
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    creator int NOT NULL,
    FOREIGN KEY (creator) REFERENCES users(id)
  )
`]

var con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
})

con.connect(function(err) {
  if (err) throw err

  for (const sql_create_table in sql_create_tables) {
    con.query(sql_create_tables[sql_create_table], function (err, result) {
      if (err) throw err
    })
  }
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.post('/signin', (req, res) => {
  con.query("SELECT name FROM users WHERE (users.name = ?)", req.body.user, function (err, result) {
    if (err) throw err
    if(result.length === 0) {
      con.query("INSERT INTO users (name) VALUES (?)", req.body.user, function (err, result) {
        if (err) throw err
        res.redirect(`/pictochat?user=${req.body.user}`)
      })
    } else {
      res.redirect(`/pictochat?user=${req.body.user}`)
    }
  })
})

app.post('/create_room', (req, res) => {
  con.query("SELECT name FROM rooms WHERE (rooms.name = ?)", req.body.room, function (err, result) {
    if (err) throw err
    if(result.length === 0) {
      con.query("INSERT INTO rooms (name) VALUES (?)", req.body.room, function (err, result) {
        if (err) throw err
        res.redirect(`/room?user=${req.body.user}&room=${req.body.room}`)
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

app.get('/healthz', (req, res) => {
  con.query("SELECT 1", function(err, result) {
    if (err) throw err
  })

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('OK')
})

app.get('/room', (req, res) => {
  res.sendFile('/html/room.html')
})

app.get('/pictochat', (req, res) => {
  res.sendFile('/html/pictochat.html')
})

function broadcast_users(room_id) {
  con.query("SELECT users.name FROM users, sockets WHERE sockets.room_id=? AND sockets.user_id=users.id", room_id, function(err, result) {
    if (err) throw err
    io.in(room_id).emit("users", result)
  })
}

io.on('connection', (socket) => {

  let user = undefined
  let room = undefined

  socket.on('join_room', (user_n_room) => {
    user_n_room = user_n_room.split(",")
    user = user_n_room[0]
    room = user_n_room[1]


    con.query("SELECT (id) FROM rooms WHERE name=?", room, function(err, result) {
      if (err) throw err
      if (result[0] !== undefined) {
        room_id = result[0].id
        socket.join(room_id)

        con.query("SELECT (id) FROM users WHERE name=?", user, function(err, result) {
          if (err) throw err
          if (result[0] !== undefined) {
            user_id = result[0].id


            con.query("INSERT INTO sockets (id, room_id, user_id) VALUES (?, ?, ?)", [socket.id, room_id, user_id], function(err, result) {
              if (err) throw err
              broadcast_users(room_id)
            })
          }
        })
      }
    })
  })

  socket.on("stroke", (stroke) => {
    con.query("SELECT room_id FROM sockets WHERE id=?", socket.id, function(err, result) {
      if (err) throw err
      if (result[0] !== undefined) {
        room_id = result[0].room_id
        socket.in(room_id).emit("stroke", stroke)
      }
    })
  })

  socket.on('disconnect', () => {
    con.query("SELECT room_id, user_id FROM sockets WHERE id=?", socket.id, function(err, result) {
      if (err) throw err
      if (result[0] !== undefined) {
        user_id = result[0].user_id
        room_id = result[0].room_id

        con.query("DELETE FROM sockets WHERE id=?", socket.id, function(err, result) {
          if (err) throw err
            broadcast_users(room_id)
        })
      }
    })
  })
})

// Start the HTTP server
server.listen(process.env.LISTEN_PORT, () => {
})


