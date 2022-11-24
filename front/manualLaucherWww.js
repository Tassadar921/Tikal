/**** Import npm libs ****/
const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();

  app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Methods", "GET");
    res.send();
  })
})

app.use(express.static('www'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});

http.listen(4200, () => {
  console.log('Serveur lancé sur le port 4200');
});
