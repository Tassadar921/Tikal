const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');

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
const gameInit = require('./modules/gameInit.js');

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    session.cookie.secure = true;
}

app.get('/getLanguagesList', (req, res) => {
    languages.getLanguagesList(res);
});

app.post('/getTranslation', (req, res) => {
    languages.getTranslation(req.body.language, res);
});

app.get('/getTilesList', (req, res) => {
    gameInit.getTilesList(res);
});




if (app.listen(process.env.PORT || 8080)) {
    console.log('Serveur lancé sur le port 8080');
}
