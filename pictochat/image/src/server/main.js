const express = require('express')
const app = express()
const mysql = require('mysql2')
const http = require('http')
const server = http.createServer(app)

var con = mysql.createConnection({
  host: "localhost",
  user: "root"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get('/', (req, res) => {
  console.log('deez nutz')
  res.sendFile('/html/index.html')
})

app.get('/hei', (req, res) => {
  console.log('deez nutz')
  res.send('<h1>Hello world</h1>')
})

server.listen(80, () => {
  console.log('listening on *:80')
})