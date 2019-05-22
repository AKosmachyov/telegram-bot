import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
	telegramId: Number,
	firstName: String,
	lastName: String,
	userName: String
});

const UserModel = model('User', UserSchema);

export default UserModel;