const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
	chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    createDate: Date,
    endDate: Date,
	title: String,
	options: [
		{
			title: String,
			value: String
		}
	],
	answers: [
		{
			user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			value: String
		}
	]
});
const Poll = mongoose.model('Poll', PollSchema);

function addPoll(title, options, chat) {
    const createDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 1);

    const poll = new Poll({
        title,
        options,
        chat,
        createDate: createDate,
        endDate: endDate.toISOString()
    });
    return poll.save();
}

function updateAnswer(pollId, user, answer) {
	return Poll.findOneAndUpdate(
		{ _id: pollId },
		{ $push: { user, value: answer} },
		// { upsert: true, new: true }
	)
	// q.then(console.log, (err) => console.log('err', err))
	// return q;
}

module.exports = {
	addPoll,
	updateAnswer
};
