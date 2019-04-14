const mongoose = require('mongoose');
const config = require('../../config.json');
const User = require('./User.js');
const Chat = require('./Chat.js');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(config.DB_URL);

const db = mongoose.connection

db.on('error', (err) => console.error('connection error:', err));
db.once('open', () => console.log('DB connected'));

module.exports = db;