import nodemon from 'nodemon';
import mysql from 'mysql';
import {Server} from 'socket.io';

// import * as languages from './modules/languages.js';
// import * as gameInit from './modules/gameInit.js';
// import * as account from './modules/account.js';

console.clear();
console.log('=========== SERVER STARTED FOR SOCKETS RQ ===========');
console.log('    ==============   PORT: 8081   ==============');

const io = new Server(8081, {
    cors: {
        origin: 'http://localhost:8100',
    }
});

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tikal'
});

con.connect(err => {
    if (err) {
        console.log('Error when connecting to db:', err);
    } else {
        console.log('Connected to db for socket requests');
    }
});

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
            for (const client of sockets) {
                client.leave('room_' + client.roomID);
                client.roomID = null;
                client.ready = false;
            }
        }
    }
}

nodemon({ script: 'server.js' }).on('start', function () {
            io.on('connection', (socket) => {
                console.log('user connected');

                function leaveRoom() {
                    socket.to('room_' + socket.roomID).emit('playerLeft', {username: socket.username});
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
                    socket.join('room_' + socket.id);
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
                            const sockets = await io.in('room_' + data.roomID).fetchSockets();
                            if (sockets.length < 4) {
                                for (const client of sockets) {
                                    playersInRoom.push({username: client.username, ready: client.ready});
                                }
                                socket.join('room_' + data.roomID);
                                socket.roomID = data.roomID;
                                socket.emit('roomJoined', {roomID: data.roomID, playersInRoom});
                                socket.to('room_' + data.roomID).emit('playerJoined', data.username);
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
                    socket.to('room_' + socket.roomID).emit('playerReady', {
                        username: socket.username,
                        ready: socket.ready
                    });
                    const sockets = await io.in('room_' + socket.roomID).fetchSockets();
                    if (sockets.length === 4) {
                        let everyoneReady = sockets.every(socket => socket.ready);
                        if (everyoneReady) {
                            let door = true;
                            socket.on('cancelEveryoneReady', () => {
                                door = false;
                                socket.ready = false;
                            });
                            for (let i = 5; i > 0; i--) {
                                if (door) {
                                    socket.to('room_' + socket.roomID).emit('everyoneReady', i);
                                    socket.emit('everyoneReady', i);
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                } else {
                                    let playersInRoom = [];
                                    let sockets = await io.in('room_' + socket.roomID).fetchSockets();
                                    for (const client of sockets) {
                                        playersInRoom.push({username: client.username, ready: client.ready});
                                    }
                                    socket.to('room_' + socket.roomID).emit('everyoneReadyCancelTriggered', playersInRoom);
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
                    socket.to('room_' + socket.roomID).emit('playerKicked', username);
                    socket.emit('playerKicked', username);
                });

                socket.on('disconnect', () => {
                    leaveRoom();
                });
            });
}).on('exit', function (files) {
    console.log('SERVER CLOSED')
}).on('crash', function () {
    console.log('script crashed for some reason');
}).on('restart', function (files) {
    console.log('restart');
});