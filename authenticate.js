const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
exports.verifyUser = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	} else {
		let err = new Error("You are not authenticated!");
		err.status = 403;
		return next(err);
	}
};
