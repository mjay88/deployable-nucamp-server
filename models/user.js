const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
	firstname: {
		type: String,
		default: "",
	},
	lastname: {
		type: String,
		default: "",
	},
	admin: {
		type: Boolean,
		default: false,
	},
	_id: {
		type: mongoose.Schema.Types.Mixed,
	},
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
