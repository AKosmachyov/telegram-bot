const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    chatId: Number,
    title: String,
    type: String,
    users: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ]
});
const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
