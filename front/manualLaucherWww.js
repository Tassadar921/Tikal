/**** Import npm libs ****/
const express = require('express');
const app = express();

const path = express.static(__dirname + '/www')

app.use('', path);
app.route('/home').get((req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});

app.listen(4200, () => {
  console.log('Serveur lancé sur le port 4200');
});
