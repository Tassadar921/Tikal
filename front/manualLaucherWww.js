const express = require('express');
const app = express();

const appPath = express.static(__dirname + '/www')
const errorPath = express.static(__dirname + '/error.html')

app.use('/', appPath);
app.use('/home/*', errorPath);
app.route('/home').get((req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});

if(app.listen(process.env.PORT || 3000)) {
  console.log('Server started on port 3000');
}
