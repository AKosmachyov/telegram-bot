import { DataProvider, Chat, User, Poll, PollAnswer } from '../dataProvider';
import { Connection, set, connect, connection, Types } from 'mongoose';

import UserModel from './UserModel';
import ChatModel from './ChatModel';
import PollModel from './PollModel';

const config = require('../../config.json');

set('useNewUrlParser', true);
set('useFindAndModify', false);
set('useCreateIndex', true);

class MongooseProvider implements DataProvider {
	db: Connection;

	init() {
		return new Promise((resolve, reject) => {
			connect(config.DB_URL);
			this.db = connection;
			this.db.on('error', reject);
			this.db.once('open', resolve);
		});
	}

	// Chat

	addChat(options: { telegramId: number; title: string; chatType: string }): Promise<Chat> {
		const { telegramId, title, chatType } = options;
		const chat = new ChatModel({ title, telegramId, chatType, users: [] });
		return chat.save();
	}

	getChat(telegramId: number): Promise<Chat> {
		return ChatModel.findOne({ telegramId });
	}

	// getChatForUser(userId: number): Promise<Chat[]> {
	// 	return ChatModel.find({ users: userId }).populate('users');
	// }

	async addUserForChat(chatId: number, user: User): Promise<void> {
		await ChatModel.updateOne(
			{ _id: chatId },
			{ $addToSet: { users: Types.ObjectId(user.id) } }
		);
		return Promise.resolve();
	}

	// User

	// getUser(telegramId: number): Promise<User> {
	// return UserModel.findOne({ userId: telegramId });
	// }

	addOrUpdateUser(options: { telegramId: number; firstName: string; lastName: string }): Promise<User> {
		const { telegramId, firstName, lastName } = options;
		return UserModel.findOneAndUpdate(
			{ telegramId: telegramId },
			{
				$set: {
					userId: telegramId,
					firstName: firstName,
					lastName: lastName
				}
			},
			{ upsert: true, new: true }
		);
	}

	// // Poll

	// addPoll(poll: Poll): Promise<Poll> {
	// 	const createDate = new Date().toISOString();
	// 	const endDate = new Date();
	// 	endDate.setHours(endDate.getHours() + 1);

	// 	const poll = new Poll({
	// 		title,
	// 		options,
	// 		chat,
	// 		createDate: createDate,
	// 		endDate: endDate.toISOString()
	// 	});
	// 	return poll.save();
	// }

	// getPoll(id: number): Promise<Poll> {
	// 	return Poll.findOne({ _id: pollId });
	// }

	// getActivePollsForChat(id: number): Promise<Poll[]> {
	// return PollModel.find({ chat: id, endDate: { $gt: Date.now() } });
	// }

	// addOrUpdateAnswer(poll: Poll, user: User, answer: string): Promise<PollAnswer> {
	// 	const answer = poll.answers.find((answer) => answer.user.equals(user.id));
	// 	if (answer) {
	// 		answer.value = answerOption;
	// 	} else {
	// 		poll.answers.push({ value: answer, user: user });
	// 	}
	// 	return await poll.save();
	// }
}

const mongooseProvider = new MongooseProvider();
export default mongooseProvider;
