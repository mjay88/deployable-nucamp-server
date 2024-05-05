const mongoose = require("mongoose");
const config = require("../config");
const data = require("../utils/data");

const Campsite = require("../models/campsite");
// const Campsite = require("../models/favorites");
const Partner = require("../models/partner");
const Promotion = require("../models/promotion");

// const User = require("../models/user");

const importData = async () => {
	const url = config.mongoUrl;
	const connect = mongoose.connect(url, {
		useCreateIndex: true,
		useFindAndModify: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	connect.then(
		() => console.log("Connected correctly to server"),
		(err) => console.log(err)
	);

	try {
		//clear the data base
		await Campsite.deleteMany();
		await Partner.deleteMany();
		await Promotion.deleteMany();

		const createdCampsites = await Campsite.insertMany(data.campsites);
		const createdPartners = await Partner.insertMany(data.partners);
		const createPromotions = await Promotion.insertMany(data.promotions);
		console.log("Successfully updated db");
		process.exit();
	} catch (err) {
		console.log(err, "insertion error");
	}
};

importData();

const destroyData = async () => {
	try {
		await Campsite.deleteMany();
		await Promotion.deleteMany();
		await Partner.deleteMany();

		console.log("Data Destroyed!");
		process.exit();
	} catch (error) {
		console.error(`${error}`);
		process.exit(1);
	}
};

// destroyData();
