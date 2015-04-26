var mongoose = require('mongoose');

// Schema for database record of user
var userSchema = mongoose.Schema({
	instagram: {
		id: String,
		name: String,
		access_token: String
	}
});

exports.User = mongoose.model('User', userSchema);
