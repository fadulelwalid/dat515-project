const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.get('/', (req, res) => {
  console.log('deez nutz');
  res.sendFile('/web/index.html');
});

app.get('/hei', (req, res) => {
  console.log('deez nutz');
  res.send('<h1>Hello world</h1>');
});

server.listen(80, () => {
  console.log('listening on *:80');
});