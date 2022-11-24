const express = require('express');
const app = express();

app.use(express.static(__dirname + '/www'));

if (app.listen(process.env.PORT || 3000)) {
  console.log('Serveur lancé sur le port 3000');
}
