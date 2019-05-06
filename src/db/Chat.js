const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
	chatId: Number,
	title: String,
	type: String,
	users: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ]
});
const Chat = mongoose.model('Chat', ChatSchema);

function getChat(id) {
    return Chat.findOne({ chatId: id });
}

function getUserChats(userId) {
    return Chat.find({ users: userId }).populate('users');
}

function addChat(id, title, type) {
	const chat = new Chat({ chatId: id, users: [], title, type });
	return chat.save();
}

async function addUser(chatId, user) {
	const chat = await getChat(chatId);
	if (chat && chat.users.indexOf(user.id) == -1) {
		chat.users.push(user);
		return chat.save();
	}
}

module.exports = {
    getChat,
	addChat,
    addUser,
    getUserChats
};