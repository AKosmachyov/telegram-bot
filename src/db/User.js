const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	userId: Number,
	firstName: String,
	lastName: String
});
const User = mongoose.model('User', UserSchema);

function getUser(id) {
	return User.findOne({userId: id});
}

function updateUser(id, first_name, last_name) {
	return User.findOneAndUpdate(
		{ userId: id },
		{
			$set: {
				userId: id,
				firstName: first_name,
				lastName: last_name
			}
		},
		{ upsert: true, new: true }
	);
}

module.exports = {
	updateUser,
	getUser
};
