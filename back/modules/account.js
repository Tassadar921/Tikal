import nodemailer from 'nodemailer';
import crypto from 'crypto';

//ash function for passwords
const ash = (str) => crypto.createHash('sha256')
    .update(str, 'utf-8')
    .digest('hex');

//queue for pending creation accounts
const creatingAccountQueue = [];

//queue for reset password accounts
const resetPasswordQueue = [];

//url to send by email, replace it by domain name
const urlFront = 'http://localhost:8100/'; //URL DE DEV

//init of the mail sender
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noreply.tassadar.ovh@gmail.com',
        pass: 'duhdjbwxilbhiplw'
    }
});

//mail options of subject, text and receiver
const mailOptions = {
    from: 'noreply.tassadar.ovh@gmail.com',
    to: '',
    subject: '',
    text: ''
};

//generates token by stringing a random number
function generateToken() {
    return (Math.random() + 1).toString(36).substring(2)+(Math.random() + 1).toString(36).substring(2);
}

//clears creatingAccount queue,
//single line including token if token or each line including email if email
export function clearCreatingAccountQueue(token, email='') {
    for (let i = 0; i < creatingAccountQueue.length; i++) {
        if(!email) {
            if (creatingAccountQueue[i].token === token) {
                creatingAccountQueue.splice(i, 1);
            }
        }else{
            if (creatingAccountQueue[i].email === email) {
                creatingAccountQueue.splice(i, 1);
            }
        }
    }
}

//clears resetPassword queue,
//single line including token if token or each line including email if email
export function clearResetPasswordQueue(token, email='') {
    for (let i = 0; i < resetPasswordQueue.length; i++) {
        if(!email) {
            if (resetPasswordQueue[i].token === token) {
                resetPasswordQueue.splice(i, 1);
            }
        }else{
            if (resetPasswordQueue[i].email === email) {
                resetPasswordQueue.splice(i, 1);
            }
        }
    }
}

//asks if an account containing username or email is in db, priority to username
export function userExists(username, email, language, con, res) {
    const dictionary = import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}});
    con.query('SELECT username FROM users WHERE username = ?', username, (e, r) => {
        if (e) {
            throw e;
        } else {
            if (r.length) {
                res.json({status: 0, message: dictionary.server[0].data});
            } else {
                con.query('SELECT username FROM users WHERE email = ?', email, (er, re) => {
                    if (er) {
                        throw er;
                    } else {
                        if (re.length) {
                            res.json({status: 0, message: dictionary.server[1].data});
                        } else {
                            res.json({status: 1, message: ''});
                        }
                    }
                });
            }
        }
    });
}

//sends the creating account email, containing a unique token, effective for 5 minutes,
// temporary saving datas in the signUp queue
export function mailCreateAccount(username, password, email, language, res) {
    const dictionary = import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}});
    const token = generateToken();
    clearCreatingAccountQueue('', email);
    creatingAccountQueue.push({token, username, password, email});
    setTimeout(clearCreatingAccountQueue, 300000, token);

    mailOptions.to = email;
    mailOptions.subject = dictionary.mail[0].data;
    mailOptions.text = dictionary.mail[1].data.replace('username', username)
        + urlFront
        + 'conf-account?token='
        + token;

    transporter.sendMail(mailOptions, async function (error) {
        if (error) {
            res.json({status: 0, message: dictionary.mail[2].data});
        } else {
            res.json({status: 1, message: dictionary.mail[3].data});
        }
    });
}

//asks if token is in the signUp queue
export function checkSignUpToken(token, language, res) {
    const dictionary = import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}});
    for (const line of creatingAccountQueue) {
        if (line.token === token) {
            res.json({status: 1, message: dictionary.mail[4].data});
            return 1;
        }
    }
    res.json({status: 0, message: dictionary.mail[5].data});
    return 0;
}

//creates the account with datas in the queue linked to token
export function createAccount(token, language, con, res){
    for(const line of creatingAccountQueue){
        if(line.token===token){
            let token = generateToken();
            con.query('INSERT INTO users (username, password, email, token) VALUES (?,?,?)', [line.username, ash(line.password), line.email, token], (err) => {
                if(err){
                    throw err;
                }else{
                    const dictionary = import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}});
                    const username = line.username;
                    clearCreatingAccountQueue(line.token);
                    res.json({status: 1, message: dictionary.server[2].data, username: username, token});
                }
            });
            break;
        }
    }
}

//signIn, identifier can be either username or email
export function signIn(identifier, password, language, con, res) {
    con.query('SELECT username FROM users WHERE (username = ? OR email = ?)', [identifier, identifier], (e,r)=> {
        if(e){
            throw e;
        }else{
            const dictionary = import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}});
            if(!r.length){
                res.json({status: 0, message: dictionary.mail[6].data});
            }else{
                con.query('SELECT username FROM users WHERE (username = ? OR email = ?) AND password = ?', [identifier, identifier, ash(password)], (er,re)=>{
                    if(er){
                        throw er;
                    }else{
                        if(re.length){
                            let token = generateToken();
                            con.query('UPDATE users SET token = ? WHERE username = ?', [token, re[0].username], (err, result)=>{
                                if(err){
                                    throw err;
                                }else{
                                    res.json({status: 1, message: '', username: re[0].username, token});
                                }
                            });
                        }else{
                            res.json({status: 0, message: dictionary.mail[7].data});
                        }
                    }
                });
            }
        }
    });
}

export function getConnectionToken(username, con, res){
    let token = generateToken();
    con.query('UPDATE users SET token = ? WHERE username = ?', [token, username], (error)=>{
        if(error) {
            throw error;
        }else{
            res.json({status: 1, token});
        }
    });
}

export function checkConnection(username, token, con, res){
    con.query('SELECT username FROM users WHERE username = ? AND token = ?', [username, token], (error, result)=>{
        if(error){
            throw error;
        }else{
            if(result.length){
                res.json({status: 1});
            }else{
                res.json({status: 0});
            }
        }
    });
}

//sends an email containing a unique token to reset the password, effective for 5 minutes
//temporary linking the token and email in the resetPassword queue
export function mailResetPassword(email, language, con, res){
    con.query('SELECT email FROM users WHERE email = ?', email, (e, r) => {
        if(e){
            throw e;
        }else{
            const dictionary = import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}});
            if(r.length){
                const token = generateToken();
                clearResetPasswordQueue('', email);
                resetPasswordQueue.push({token, email});
                setTimeout(clearResetPasswordQueue, 300000, token);
                mailOptions.to=email;
                mailOptions.subject=dictionary.mail[8].data;
                mailOptions.text = dictionary.mail[9].data
                    + urlFront
                    + 'reset-password?token='
                    + token;
                transporter.sendMail(mailOptions, async function (error) {
                    if (error) {
                        res.json({status: 0, message: dictionary.mail[2].data});
                    } else {
                        res.json({status: 1, message: dictionary.mail[10].data});
                    }
                });
            }else{
                res.json({status: 1, message: dictionary.mail[10].data});
            }
        }
    });
}

//asks if token is in the resetPassword queue
export function checkResetPasswordToken(token, language, res) {
    const dictionary = import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}});
    for (const line of resetPasswordQueue) {
        if (line.token === token) {
            res.json({status: 1, message: dictionary.mail[4].data});
            return 1;
        }
    }
    res.json({status: 0, message: dictionary.mail[5].data});
    return 0;
}

//resets the password of the account linked to the email, himself linked to the token
export function resetPassword(token, password, language, con, res){
    for(const line of resetPasswordQueue) {
        if (line.token === token) {
            con.query('UPDATE users SET password = ? WHERE email = ?', [ash(password), line.email], (err) => {
                if (err) {
                    throw err;
                } else {
                    const dictionary = import('../files/json/translation/' + language + '.json', {assert: {type: 'json'}});
                    clearResetPasswordQueue(token);
                    res.json({status: 1, message:dictionary.mail[11].data});
                }
            });
        }
    }
}