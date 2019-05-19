import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
	telegramId: Number,
	firstName: String,
	lastName: String
});

const UserModel = model('User', UserSchema);

export default UserModel;