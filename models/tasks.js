const mongoose = require('mongoose')

const TasksSchema = mongoose.Schema({
    taskname: {
        type: String,
        require: true
    },
    date: {
        type: String,
        require: false
    },
    status: {
        type: String,
        require: true
    },
    userid: {
        type: String,
        require: true
    },
})

module.exports = mongoose.model('Task', TasksSchema)