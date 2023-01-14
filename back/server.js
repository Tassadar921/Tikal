import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import methodOverride from 'method-override';
import cors from 'cors';
import mysql from 'mysql';
import http from 'http';
import nodemon from 'nodemon';
import {Server} from 'socket.io';
import expressSession from 'express-session';

const app = express();
const httpServer = http.Server(app);
const io = new Server(httpServer, {cors: {
    origin: 'http://localhost:8100',
    }});

const session = expressSession({
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

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors({origin: 'http://localhost:8100'}));
app.use(session);
app.use('/files', express.static('files'));

import * as languages from './modules/languages.js';
import * as gameInit from './modules/gameInit.js';
import * as account from './modules/account.js';
import * as game from './modules/Game.js';

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    session.cookie.secure = true;
}

con.connect(err => {
    if (err) {
        console.log('Error when connecting to db:', err);
    } else {
        console.log('Connected to db');


        app.get('/getLanguagesList', async function (req, res) {
            await languages.getLanguagesList(res);
        });

        app.post('/getTranslation', async function (req, res) {
            await languages.getTranslation(req.body.language, res);
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

        app.post('/checkConnection', (req, res) => {
            account.checkConnection(req.body.username, req.body.token, con, res);
        });

        app.post('/getConnectionToken', (req, res) => {
            account.getConnectionToken(req.body.username, con, res);
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

            function leaveRoom() {
                socket.to("room_" + socket.roomID).emit('playerLeft', {username: socket.username});
                socket.ready = false;
                socket.leave('room_' + socket.roomID);
                socket.roomID = null;
            }

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
                if (!socket.username) {
                    socket.emit('usernameLost');
                }
                let rooms = io.sockets.adapter.rooms;
                let playersInRoom = [];
                let currentRoom;
                for (const room of rooms) {
                    if (room[0] === 'room_' + data.roomID) {
                        currentRoom = room[0];
                        const sockets = await io.in("room_" + data.roomID).fetchSockets();
                        if (sockets.length < 4) {
                            for (const client of sockets) {
                                playersInRoom.push({username: client.username, ready: client.ready});
                            }
                            socket.join("room_" + data.roomID);
                            socket.roomID = data.roomID;
                            socket.emit('roomJoined', {roomID: data.roomID, playersInRoom});
                            socket.to("room_" + data.roomID).emit('playerJoined', data.username);
                        } else {
                            socket.emit('roomFull');
                        }
                        break;
                    }
                }
                if (!currentRoom) {
                    socket.emit('roomNotFound');
                }
            });

            socket.on('toggleReady', async () => {
                socket.ready = !socket.ready;
                socket.to("room_" + socket.roomID).emit('playerReady', {
                    username: socket.username,
                    ready: socket.ready
                });
                const sockets = await io.in("room_" + socket.roomID).fetchSockets();
                if(sockets.length === 4) {
                    let everyoneReady = sockets.every(socket => socket.ready);
                    if (everyoneReady) {
                        let door = true;
                        socket.on('cancelEveryoneReady', () => {
                            door = false;
                            socket.ready = false;
                        });
                        for(let i=5; i>0; i--) {
                            if(door) {
                                socket.to("room_" + socket.roomID).emit('everyoneReady', i);
                                socket.emit('everyoneReady', i);
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            }else{
                                let playersInRoom = [];
                                let sockets = await io.in("room_" + socket.roomID).fetchSockets();
                                for (const client of sockets) {
                                    playersInRoom.push({username: client.username, ready: client.ready});
                                }
                                socket.to("room_" + socket.roomID).emit('everyoneReadyCancelTriggered', playersInRoom);
                                socket.emit('everyoneReadyCancelTriggered', playersInRoom);
                                break;
                            }
                        }
                    }
                }
                socket.emit('playerReady', {username: socket.username, ready: socket.ready});
            });

            socket.on('leaveRoom', () => {
                leaveRoom();
            });

            socket.on('kick', username => {
                socket.to("room_" + socket.roomID).emit('playerKicked', username);
                socket.emit('playerKicked', username);
            });

            socket.on('disconnect', () => {
                leaveRoom();
            });
        });
    }
});

process.stdin.resume();//so the program will not close instantly

async function save(message = '') {
    //SAVE
    console.log(message);
    await kickPlayers();
}

async function kickPlayers() {
    console.log('kickPlayer');
    const rooms = io.sockets.adapter.rooms;
    for (const room of rooms) {
        if (room[0].startsWith('room_')) {
            room[0].emit('roomClosed');
            const sockets = await io.in(room[0]).fetchSockets();
            sockets[0].to('room_' + sockets[0].roomID).emit('roomClosed');
            sockets[0].emit('roomClosed');
            for(const client of sockets){
                client.leave('room_' + client.roomID);
                client.roomID = null;
                client.ready = false;
            }
        }
    }
}

//do something when app is closing
process.on('exit', async () => {
    // await save();
    process.exit();
});

//catches ctrl+c event
process.on('SIGINT', async () => {
    await save('SIGINT');
    process.exit();
});

// catches "kill pid" (for example: nodemon restart)
if (process.platform !== 'win32') { //WORKS ONLY ON LINUX, USELESS ON WINDOWS
    process.on('SIGUSR1', async() => {
        await save('SIGUSR1');
        process.exit();
    });
    process.on('SIGUSR2', async () => {
        await save('SIGUSR2');
        process.exit();
    });
}else{
//patch SIGUSR1-2 on windows for nodemon
    nodemon.on('start', () => {
        console.log('ON START');
    }).on('quit', () =>{
    }).on('restart', async () => {
        await save('nodemon restart');
    });
}

// catches uncaught exceptions
process.on('uncaughtException', async (exception) => {
    console.log(exception);
    await save('uncaughtException');
    process.exit();
});

if (httpServer.listen(process.env.PORT || 8080)) {
    console.log('Serveur lancé sur le port 8080');
}