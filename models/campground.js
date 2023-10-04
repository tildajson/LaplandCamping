const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const mongoosePaginate = require("mongoose-paginate-v2");


const ImageSchema = new Schema({
	url: String,
	filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/w_200");
});


const campgroundOptions = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		price: Number,
		description: String,
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: "Review",
			},
		],
	},
	campgroundOptions
);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
	return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
	<p>${this.description.substring(0, 20)}...</p>`;
});

// Delete review middleware Mongoose
CampgroundSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews,
			},
		});
	}
});

CampgroundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Campground", CampgroundSchema);
