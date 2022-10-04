const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const mysql = require('mysql');

const session = require('express-session')({
    secret: 'eb8fcc253281389225b4f7872f2336918ddc7f689e1fc41b64d5c4f378cdc438',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000,
        secure: false
    }
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());
app.use(session);

const languages = require('./modules/languages.js');

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    session.cookie.secure = true;
}

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'oc'
});

    con.connect(err => {
        if (err) {
            console.log('Error when connecting to db:', err);
        } else {
            console.log('Connected to db');

            app.get('/getLanguagesList', function (req, res) {
                languages.getLanguagesList(res);
            });

            app.post('/getTranslation', function (req, res) {
                languages.getTranslation(req.body.language, res);
            });
        }
    });

if (app.listen(process.env.PORT || 8080)) {
    console.log('Serveur lancé sur le port 8080');
}
