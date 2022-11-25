const express = require('express');
const app = express();

const path = express.static(__dirname + '/www')

app.use('', path);
// app.use('/home', path);
app.route('/home').get((req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});

if (app.listen(process.env.PORT || 3000)) {
  console.log('Serveur lancé sur le port 3000');
}
