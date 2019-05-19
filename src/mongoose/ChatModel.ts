import { Schema, model } from 'mongoose';

const ChatSchema = new Schema({
	telegramId: Number,
	title: String,
	chatType: String,
	users: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
});

const ChatModel = model('Chat', ChatSchema);

export default ChatModel;