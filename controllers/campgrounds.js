const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.paginate(
		{},
		{
			page: req.query.page || 1,
			limit: 10,
			sort: "-_id",
		}
	);
	campgrounds.page = Number(campgrounds.page);
	let totalPages = campgrounds.totalPages;
	let currentPage = campgrounds.page;
	let startPage;
	let endPage;

	if (totalPages <= 10) {
		startPage = 1;
		endPage = totalPages;
	} else {
		if (currentPage <= 6) {
			startPage = 1;
			endPage = 10;
		} else if (currentPage + 4 >= totalPages) {
			startPage = totalPages - 9;
			endPage = totalPages;
		} else {
			startPage = currentPage - 5;
			endPage = currentPage + 4;
		}
	}
	res.render("campgrounds/index", {
		campgrounds,
		startPage,
		endPage,
		currentPage,
		totalPages,
	});
};

module.exports.renderNewForm = (req, res) => {
	res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry;
	campground.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	campground.author = req.user._id;
	await campground.save();
	req.flash("success", "New campground created!");
	res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.showCampground = async (req, res) => {
	if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
		const campground = await Campground.findById(req.params.id)
			.populate({
				path: "reviews",
				populate: {
					path: "author",
				},
			})
			.populate("author");
		res.render("campgrounds/show", { campground });
	} else {
		req.flash("error", "Cannot find that campground!");
		res.redirect("/campgrounds");
	}
};

module.exports.renderEditForm = async (req, res) => {
	const id = req.params.id;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash("error", "Cannot find that campground!");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
	const id = req.params.id;
	const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	campground.images.push(...imgs);
	await campground.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	req.flash("success", "Campground updated");
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const id = req.params.id;
	await Campground.findByIdAndDelete(id);
	req.flash("success", "Campground deleted");
	res.redirect("/campgrounds");
};
