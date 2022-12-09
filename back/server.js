const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:8100']
    }
});

const allowedOrigins = 'http://localhost:8100';

// Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    },
};

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

// Enable preflight requests for all routes
app.options('*', cors(corsOptions));

app.get('/', cors(corsOptions), (req, res, next) => {
    res.json({ message: 'This route is CORS-enabled for an allowed origin.' });
});

/////////////////////// RAJOUTER 3 TUILES ////////////////////////

app.get('/getLanguagesList', (req, res) => {
    languages.getLanguagesList(res);
});

app.post('/getTranslation', (req, res) => {
    languages.getTranslation(req.body.language, res);
});

app.get('/getTilesList', (req, res) => {
    gameInit.getTilesList(res);
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('createRoom', () => {

    });

    socket.on('join', (id) => {
        console.log('join', id);
    });

    socket.on('disconnect', () => {
       console.log('user disconnected');
    });
});

if (http.listen(process.env.PORT || 8080)) {
    console.log('Serveur lancé sur le port 8080');
}
