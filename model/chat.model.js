const mongoose = require('./mongoose')

const chatSchema = new mongoose.Schema({
    chatname: {
        type: String,
        required: true,
        index: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
})

const chatModel = mongoose.model('chat', chatSchema);

module.exports = chatModel