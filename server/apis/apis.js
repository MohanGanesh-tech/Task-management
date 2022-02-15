require('dotenv').config()

const express = require('express')
const apis = express()
const jwt = require('jsonwebtoken')
const User = require('../models/users')
const Task = require('../models/tasks')
session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);

apis.use(express.json())

// User

// const store = new MongoDBStore({
//     uri: `mongodb+srv://Ganesh:Mohanganeshn944870@cluster0.qc2br.mongodb.net/taskmanagement?retryWrites=true&w=majority`,
//     collection: 'sessions'
// });
// apis.use(session({
//     secret: '89a9045d3b280b973a112cbbe41085e7aad9ae3eaf8df06b44995cd0eac56343556a85e86b7cce2ff2a8c2948f9093b1597d741c07315494aeca84cf27e286c4',
//     resave: false,
//     saveUninitialized: true,
//     store: store
// }));

var userid

let refreshTokens = []

function generateAccessToken(user) {
    return jwt.sign(user, 'a4aa7d9967d03b8876661888e0bc1f6bd0fbd3df90278fa77fd44b898d8ba24a07b05871b79f7b1a2c91b3e0261f79b6f44e4c4a30d675cd98210a2b5a5208bc', { expiresIn: '30m' })
}

apis.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, '94a9045d3b280b973a112cbbe41085e7aad9ae3eaf8df06b44995cd0eac56343556a85e86b7cce2ff2a8c2948f9093b1597d741c07315494aeca84cf27e286c4', (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

apis.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    userid = ''
    res.sendStatus(204)
})

apis.post('/login', (req, res) => {
    const uname = req.body.username
    const passd = req.body.password

    User.findOne({ username: uname, password: passd }, function (err, result) {
        if (err) {
            res.status(400).send("Error fetching listings!" + err);
        }
        else {
            if (result != null) {
                const user = { name: uname, pass: passd }
                const accessToken = generateAccessToken(user)
                const refreshToken = jwt.sign(user, '94a9045d3b280b973a112cbbe41085e7aad9ae3eaf8df06b44995cd0eac56343556a85e86b7cce2ff2a8c2948f9093b1597d741c07315494aeca84cf27e286c4')
                refreshTokens.push(refreshToken)
                userid = result._id.valueOf()
                res.json({ accessToken: accessToken, refreshToken: refreshToken, statuscode: 200 })
            }
            else {
                res.json({ msg: "Incorrect createndial", statuscode: 401 });
            }
        }
    })

    console.log(userid)

})

apis.post('/signup', (req, res) => {

    let newUser = new User({
        username: req.body.username,
        phone: req.body.phone,
        email: req.body.email,
        password: req.body.password,
    })

    User.findOne({ username: newUser.username }, function (err, result) {
        if (err) {
            res.status(400).send("Error fetching listings!" + err);
        }
        else {
            if (result != null) {
                res.json({ msg: 'Username already exit' })
            }
            else {
                newUser.save((err, user) => {
                    if (err) {
                        res.json({ msg: 'Failed to add user' })
                    } else {
                        res.json({ msg: 'User added successfully' })
                    }
                })
            }
        }
    })
})

// Task

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, 'a4aa7d9967d03b8876661888e0bc1f6bd0fbd3df90278fa77fd44b898d8ba24a07b05871b79f7b1a2c91b3e0261f79b6f44e4c4a30d675cd98210a2b5a5208bc', (err, user) => {
        if (err) {
            console.log("error:" + err)
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

apis.get('/tasks', authenticateToken, (req, res, next) => {
    console.log("all task "+userid)

    if (userid) {
        Task.find({ userid: userid }, function (err, tasks) {
            res.json(tasks)
        }).sort({ date: 1 })
    }
    else {
        console.log("userid: " + userid)
        res.json({ tasks: 'userid: ' + userid })
    }
})

apis.post('/tasks', authenticateToken, (req, res, next) => {
    if (userid == "undefined") {
        console.log("userid: " + userid)
        res.json({ msg: 'Failed to add task' })
    }
    else {
        console.log(userid)
        let newTask = new Task({
            taskname: req.body.taskname,
            date: req.body.date,
            status: "pending",
            userid: userid
        })

        newTask.save((err, apis) => {
            if (err) {
                res.json({ msg: 'Failed to add apis' })
            } else {
                res.json({ msg: 'Task added successfully' })
            }
        })
    }
})

apis.patch('/tasks/:id', authenticateToken, (req, res, next) => {
    Task.updateOne({ _id: req.params.id }, { status: "done" }, function (err, result) {
        if (err) {
            res.json(err)
        }
        else {
            res.json(result)
        }
    })
})

apis.delete('/tasks/:id', authenticateToken, (req, res, next) => {
    Task.deleteOne({ _id: req.params.id }, function (err, result) {
        if (err) {
            res.json(err)
        }
        else {
            res.json(result)
        }
    })
})

module.exports = apis;
