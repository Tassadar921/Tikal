const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const mysql = require('mysql');
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:8100']
    }
});

const session = require('express-session')({
    secret: 'eb8fcc253281389225b4f7872f2336918ddc7f689e1fc41b64d5c4f378cdc438',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000,
        secure: false
    }
});

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tikal'
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());
app.use(session);
app.use('/files', express.static('files'));

const languages = require('./modules/languages.js');
const gameInit = require('./modules/gameInit.js');
const account = require('./modules/account.js');

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    session.cookie.secure = true;
}

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

        app.post('/userExists', function (req, res) {
            account.userExists(req.body.username, req.body.email, req.body.language, con, res);
        });

        app.post('/mailCreateAccount', function (req, res) {
            account.mailCreateAccount(req.body.username, req.body.password, req.body.email, req.body.language, res);
        });

        app.post('/checkSignUpToken', function (req, res) {
            account.checkSignUpToken(req.body.token, req.body.language, res);
        });

        app.post('/createAccount', function (req, res) {
            account.createAccount(req.body.token, req.body.language, con, res);
        });

        app.post('/signIn', function (req, res) {
            account.signIn(req.body.identifier, req.body.password, req.body.language, con, res);
        });

        app.post('/mailResetPassword', function (req, res) {
            account.mailResetPassword(req.body.email, req.body.language, con, res);
        });

        app.post('/checkResetPasswordToken', function (req, res) {
            account.checkResetPasswordToken(req.body.token, req.body.language, res);
        });

        app.post('/resetPassword', function (req, res) {
            account.resetPassword(req.body.token, req.body.password, req.body.language, con, res);
        });

        app.get('/getTilesList', (req, res) => {
            gameInit.getTilesList(res);
        });

        io.on('connection', (socket) => {
            console.log('user connected');
            console.log('socket id:', socket.id);

            socket.on('getUsername', (username) => {
               socket.username = username;
               socket.ready = false;
            });

            socket.emit('usernameLost');

            socket.on('createRoom', async () => {
                socket.join("room_" + socket.id);
                socket.emit('roomCreated', socket.id);
                socket.roomID = socket.id;
            });

            socket.on('joinRoom', async (data) => {
                if(!socket.username){
                    socket.emit('usernameLost');
                }
                let rooms = io.sockets.adapter.rooms;
                let playersInRoom = [];
                for(const room of rooms){
                    if(room[0] === 'room_' + data.roomID){
                        socket.join("room_" + data.roomID);
                        const sockets = await io.in("room_" + data.roomID).fetchSockets();
                        for(const client of sockets){
                            playersInRoom.push({username: client.username, ready: client.ready});
                        }
                        socket.roomID = data.roomID;
                        socket.emit('roomJoined', {roomID: data.roomID, playersInRoom});
                        socket.to("room_" + data.roomID).emit('playerJoined', data.username);
                    }
                }
                if(!playersInRoom.length){
                    socket.emit('roomNotFound');
                }
            });

            socket.on('toggleReady', () => {
                socket.ready = !socket.ready;
                socket.to("room_" + socket.roomID).emit('playerReady', {username: socket.username, ready: socket.ready});
                socket.emit('playerReady', {username: socket.username, ready: socket.ready});
            });

            socket.on('leaveRoom', () => {
                socket.to("room_" + socket.roomID).emit('playerLeft', {username: socket.username});
                socket.ready = false;
                socket.leave('room_' + socket.roomID);
                socket.roomID = null;
            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });
    }
});

if (http.listen(process.env.PORT || 8080)) {
    console.log('Serveur lancé sur le port 8080');
}