const express = require('express')
const app = express()
const mysql = require('mysql2')
const http = require('http')
const server = http.createServer(app)
/*
//MyFuck funtion for testing connection to database
function myFuck(){
  
  var con = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "Password"
  });


  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
}
setTimeout(myFuck, 5000, "fucky")





var dbConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "DAT515_0707",
  database: "image", // Usikker på om dette er riktig
});

// Connect to MySQL
dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});
*/

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


