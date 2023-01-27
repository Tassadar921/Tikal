import nodemon from 'nodemon';

const a = (message) => console.log(message);
nodemon({ script: 'server.js' }).on('test', function () {
    // console.clear();
}).on('start', function () {
    a('start');
}).on('quit', function () {
    console.log('App has quit');
    process.exit();
}).on('restart', function (files) {
    a('restart')
});