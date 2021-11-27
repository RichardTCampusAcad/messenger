const mongoose = require('./mongoose')

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    chat: {
        type: String,
        required: true,
        ref: 'Chat'
    },
    author: {
        type: String,
        required: true,
        ref: 'User'
    }
}, {timestamps: true})

const messageModel = mongoose.model('message', messageSchema);

module.exports = messageModel