const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

// Fix deprecated mongoose
mongoose.set("strictQuery", false);

// Connect to mongoose
const dbUrl = process.env.DB_URL;
main().catch((err) => console.log(err));
async function main() {
	mongoose.connect(dbUrl);
	console.log("Connection open!");
}

// Generate random seed helper
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// Seed the database
const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random113 = Math.floor(Math.random() * 113);
		const price = Math.floor(Math.random() * 251) + 50;
		const camp = new Campground({
			author: "651b078ad44f11ac055ccd17", // MongoDB user ID
			location: `${cities[random113].city}, ${cities[random113].county}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!",
			price,
			images: [
				{
					url: "https://res.cloudinary.com/dfjwx5aqb/image/upload/v1696930398/tania-malrechauffe-GnIGPt3sCR0-unsplash_vfft5s.jpg",
					filename: "LaplandCamping/dw5yzttrn19z8zxl49bz",
				},
				{
					url: "https://res.cloudinary.com/dfjwx5aqb/image/upload/v1696930629/bit-cloud-xkCP1OuOk7c-unsplash_zt73lx.jpg",
					filename: "LaplandCamping/lpdx4yr3cjhzhblbds0w",
				},
			],
			geometry: {
				type: "Point",
				coordinates: [cities[random113].longitude, cities[random113].latitude],
			},
		});
		await camp.save();
	}
};

// Close the connection after function
seedDB().then(() => {
	mongoose.connection.close();
});
