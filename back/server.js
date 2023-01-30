import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql';
import * as edgedb from 'edgedb';

import * as languages from './modules/languages.js';
import * as gameInit from './modules/gameInit.js';
import * as account from './modules/account.js';

const app = express();

app.use(bodyParser.json());
app.use(cors({origin: 'http://localhost:8100'}));
app.use('/files', express.static('files'));

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
}

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
        console.log('Connected to db for http requests');
    }
});

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

const connection = edgedb.createClient();
console.log(await connection.querySingle("select 1 + 1"));

if (app.listen(process.env.PORT || 8080)) {
    console.log('=========== SERVER STARTED FOR HTTP RQ ===========');
    console.log('    =============   PORT: 8080   =============');
}