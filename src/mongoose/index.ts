import { DataProvider, Chat, User, Poll, PollAnswer, PollOption } from '../dataProvider';
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

	getChatForUser(userId: string): Promise<Chat[]> {
		return ChatModel.find({ users: userId }).populate('users');
	}

	async addUserForChat(chatId: string, user: User): Promise<void> {
		await ChatModel.updateOne({ _id: chatId }, { $addToSet: { users: Types.ObjectId(user.id) } });
		return Promise.resolve();
	}

	// User

	getUser(telegramId: number): Promise<User> {
		return UserModel.findOne({ telegramId: telegramId });
	}

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

	addPoll(options: { title: string; chat: Chat; pollOptions: PollOption[] }): Promise<Poll> {
		const { title, chat, pollOptions } = options;

		const now = new Date();
		const expirationDate = new Date();
		expirationDate.setHours(now.getHours() + 1);

		const createDate = now.toISOString();
		const endDate = expirationDate.toISOString();

		const poll = new PollModel({
			chat,
			title,
			createDate,
			endDate,
			pollOptions
		});

		return poll.save();
	}

	async getPoll(id: string, withUser = false): Promise<Poll> {
		const result = PollModel.findOne({ _id: id });
		if (withUser) {
			return result.populate('answers.user');
		}
		return result;
	}

	getActivePollsForChat(id: string): Promise<Poll[]> {
		return PollModel.find({ chat: id, endDate: { $gt: Date.now() } });
	}

	async addOrUpdateAnswer(poll: Poll, user: User, answer: string): Promise<PollAnswer> {
		const userId = Types.ObjectId(user.id);
		const forInsert = {
			user: userId,
			answer: answer
		};

		const updateResult = await PollModel.updateOne(
			{ _id: poll.id },
			{
				$set: {
					'answers.$[el]': forInsert
				}
			},
			{
				arrayFilters: [ { 'el.user': userId } ],
				upsert: true
			}
		);

		if (updateResult.nModified == 0) {
			return PollModel.updateOne({ _id: poll.id }, { $set: { answers: forInsert } });
		}

		return updateResult;
	}

	//

	createPollOption(title: string, value: string): PollOption {
		return { title, value };
	}
}

const mongooseProvider = new MongooseProvider();
export default mongooseProvider;
