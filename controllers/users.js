const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
	res.render("users/register");
};

module.exports.registerUser = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, (err) => {
			if (err) return next(err);
			req.flash("success", "Welcome to LaplandCamping!");
			res.redirect("/campgrounds");
		});
	} catch (e) {
		req.flash("error", e.message);
		res.redirect("/register");
	}
};

module.exports.renderLogin = (req, res) => {
	if (req.query.returnTo) {
		req.session.returnTo = req.query.returnTo;
	}
	res.render("users/login");
};

module.exports.loginUser = (req, res) => {
	req.flash("success", "Welcome back!");
	const redirectUrl = res.locals.returnTo || "/campgrounds";
	res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		req.flash("success", "See you next time!");
		res.redirect("/campgrounds");
	});
};
