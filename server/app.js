var express = require('express')
var mongoose = require('mongoose')
var bodyparser = require('body-parser')
var cors = require('cors')
var path = require('path')

var app = express();
const router = express.Router();

const apis = require('./apis/apis')

mongoose.connect('mongodb+srv://Ganesh:Mohanganeshn944870@cluster0.qc2br.mongodb.net/taskmanagement?retryWrites=true&w=majority')
mongoose.connection.on('connected', () => {
    console.log('Connected to database mongodb')
})
mongoose.connection.on('error', () => {
    if (err) {
        console.log('Error in Database connection')
    }
})

const port = 3000;

app.use(cors());

app.use(bodyparser.json())

app.use('/api', apis)

app.get('/', (req, res) => {
    res.send('foobar')
})

app.listen(port, () => {
    console.log("server started at port:" + port)
})