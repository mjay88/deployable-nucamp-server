const express = require("express");
const Favorite = require("../models/favorites");
const authenticate = require("../authenticate");
const cors = require("./cors");
const favoriteRouter = express.Router();

favoriteRouter
	.route("/")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		//retrieve favorite document for logged in user, search favorite collection by userId
		console.log(req.user, "req.user");
		Favorite.find({ user: req.user._id })
			.populate("user")
			.populate("campsites")
			.then((favorites) => {
				// console.log(favorites, "favorites");
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(favorites);
			})
			.catch((err) => next(err));
	})
	.post(
		cors.corsWithOptions,
		authenticate.verifyUser,

		(req, res, next) => {
			//submit array of campsitesIds in request body, check if favorite document exists for user, no duplicates, if no favorite document, create one for user and add campsites to it
			Favorite.findOne({ user: req.user._id })
				.then((favorite) => {
					if (favorite) {
						const campsitesToAdd = req.body;
						campsitesToAdd.forEach((campsite) => {
							if (!favorite.campsites.includes(campsite._id)) {
								favorite.campsites.unshift(campsite);
							} else {
								console.log("campsite already exists in favorites");
							}
						});
						favorite.save().then((favorite) => {
							console.log("found favorite and adding to favorites successfull");
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(favorite);
						});
					} else {
						// console.log(req.body, "req.body");

						Favorite.create({
							user: req.user._id,
							campsites: [...req.body],
						}).then((favorite) => {
							console.log(
								favorite,
								"did not find favorites created new favorites"
							);
							favorite.save().then((favorite) => {
								res.statusCode = 200;
								res.setHeader("Content-Type", "application/json");
								res.json(favorite);
							});
						});
					}
				})

				.catch((err) => next(err));
		}
	)
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on this route");
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		//if there is a favorite document delete it

		Favorite.findOneAndDelete({ user: req.user._id })
			.then((response) => {
				console.log(response, "response");
				if (response) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(response);
				} else {
					res.setHeader("Content-Type", "text/plain");
					res.end("You do not have any favorites to delete");
				}
			})
			.catch((err) => next(err));
	});

favoriteRouter
	.route("/:campsiteId")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, (req, res, next) => {
		res.statusCode = 403;
		res.end("GET operation not supported on this route");
	})

	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		//check if favorite document exists for user, if so only add campsiteId if not already in favorite document, if no favorite document for user, add on and add the campsite from the URL parameter to its array of campsites
		Favorite.findOne({ user: req.user._id })
			.then((favorite) => {
				if (favorite) {
					const campsiteToAdd = req.params.campsiteId;
					console.log(
						campsiteToAdd,
						"campsiteToAdd in favorites/campsiteId post route"
					);

					if (!favorite.campsites.includes(campsiteToAdd._id)) {
						favorite.campsites.unshift(campsiteToAdd);
					} else {
						console.log("campsite already exists in favorites");
						//error handling?
						res.end("Campsite already exists in favorites");
					}
					favorite.save().then((favorite) => {
						console.log("found favorite and adding to favorites successfull");
						res.statusCode = 200;
						res.setHeader("Content-Type", "application/json");
						res.json(favorite);
					});
				} else {
					Favorite.create({
						user: req.user._id,
						campsites: [req.params.campsiteId],
					}).then((favorite) => {
						console.log(
							favorite,
							"did not find favorites created new favorites"
						);
						favorite.save().then((favorite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(favorite);
						});
					});
				}
			})

			.catch((err) => next(err));
	})
	.put(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			res.statusCode = 403;
			res.end("PUT operation not supported on this route");
		}
	)
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		//if there is a favorite document for the user, check if campsiteId from url param is in its campsites array, delete if so
		Favorite.findOne({ user: req.user._id })
			.then((favorite) => {
				if (favorite) {
					const campsiteToBeDeleted = req.params.campsiteId;
					favorite.campsites = favorite.campsites.filter(
						(campsite) => !campsite.equals(campsiteToBeDeleted)
					);
					favorite.save().then((favorite) => {
						res.statusCode = 200;
						res.setHeader("Content-Type", "application/json");
						res.json(favorite);
					});
				} else {
					console.log("You have no favorites");
					res.setHeader("Content-Type", "text/plain");
					res.end("You do not have any favorites to delete");
				}
			})
			.catch((err) => next(err));
	});

module.exports = favoriteRouter;
