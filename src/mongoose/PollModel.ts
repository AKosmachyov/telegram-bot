import { Schema, model } from 'mongoose';

const PollSchema = new Schema({
	chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
	title: String,
	createDate: Date,
	endDate: Date,

	pollOptions: [
		{
			title: String,
			value: String
		}
	],
	answers: [
		{
			user: { type: Schema.Types.ObjectId, ref: 'User' },
			answer: String
		}
	]
});

const PollModel = model('Poll', PollSchema);

export default PollModel;
