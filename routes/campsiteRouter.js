const express = require("express");
const Campsite = require("../models/campsite");
const authenticate = require("../authenticate");
const cors = require("./cors");
const campsiteRouter = express.Router();
//  db.users.update({ username: "user" }, { $set: { admin: true } });

campsiteRouter
	.route("/")

	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, (req, res, next) => {
		// console.log(req.user._id);
		Campsite.find()
			.populate("comments.author")
			.then((campsites) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(campsites);
			})
			.catch((err) => next(err));
	})
	.post(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyUser,
		(req, res, next) => {
			Campsite.create(req.body)
				.then((campsite) => {
					console.log(campsite, "campsite created");
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(campsite);
				})
				.catch((err) => next(err));
		}
	)
	.put(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res) => {
			res.statusCode = 403;
			res.end("PUT operation not supported on /campsites");
		}
	)
	.delete(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Campsite.deleteMany()
				.then((response) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(response);
				})
				.catch((err) => next(err));
		}
	);

campsiteRouter
	.route("/:campsiteId")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, (req, res, next) => {
		Campsite.findById(req.params.campsiteId)
			.populate("comments.author")
			.then((campsite) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(campsite);
			})
			.catch((err) => next(err));
	})

	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /campsites/${req.params.campsiteId}`
		);
	})
	.put(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Campsite.findByIdAndUpdate(
				req.params.campsiteId,
				{
					$set: req.body,
				},
				{ new: true }
			)
				.then((campsite) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(campsite);
				})
				.catch((err) => next(err));
		}
	)
	.delete(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Campsite.findByIdAndDelete(req.params.campsiteId)
				.then((response) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(response);
				})
				.catch((err) => next(err));
		}
	);

campsiteRouter
	.route("/:campsiteId/comments")
	.get((req, res, next) => {
		Campsite.findById(req.params.campsiteId)
			.populate("comments.author")
			.then((campsite) => {
				if (campsite) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(campsite.comments);
				} else {
					err = new Error(`Campsite ${req.params.campsiteId} not found`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res, next) => {
		Campsite.findById(req.params.campsiteId)
			.then((campsite) => {
				if (campsite) {
					req.body.author = req.user._id;
					campsite.comments.push(req.body);
					campsite
						.save()
						.then((campsite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(campsite);
						})
						.catch((err) => next(err));
				} else {
					err = new Error(`Campsite ${req.params.campsiteId} not found`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.put(authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end(
			`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`
		);
	})
	.delete(
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Campsite.findById(req.params.campsiteId)
				.then((campsite) => {
					if (campsite) {
						for (let i = campsite.comments.length - 1; i >= 0; i--) {
							campsite.comments.id(campsite.comments[i]._id).remove();
						}
						campsite
							.save()
							.then((campsite) => {
								res.statusCode = 200;
								res.setHeader("Content-Type", "application/json");
								res.json(campsite);
							})
							.catch((err) => next(err));
					} else {
						err = new Error(`Campsite ${req.params.campsiteId} not found`);
						err.status = 404;
						return next(err);
					}
				})
				.catch((err) => next(err));
		}
	);

campsiteRouter
	.route("/:campsiteId/comments/:commentId")
	.get((req, res, next) => {
		Campsite.findById(req.params.campsiteId)
			.populate("comments.author")
			.then((campsite) => {
				if (campsite && campsite.comments.id(req.params.commentId)) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(campsite.comments.id(req.params.commentId));
				} else if (!campsite) {
					err = new Error(`Campsite ${req.params.campsiteId} not found`);
					err.status = 404;
					return next(err);
				} else {
					err = new Error(`Comment ${req.params.commentId} not found`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`
		);
	})
	.put(authenticate.verifyUser, (req, res, next) => {
		Campsite.findById(req.params.campsiteId)
			.then((campsite) => {
				const comment = campsite.comments.id(req.params.commentId);
				if (
					campsite &&
					campsite.comments.id(req.params.commentId) &&
					comment.author.equals(req.user._id)
				) {
					if (req.body.rating) {
						campsite.comments.id(req.params.commentId).rating = req.body.rating;
					}
					if (req.body.text) {
						campsite.comments.id(req.params.commentId).text = req.body.text;
					}
					campsite
						.save()
						.then((campsite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(campsite);
						})
						.catch((err) => next(err));
				} else if (!campsite) {
					err = new Error(`Campsite ${req.params.campsiteId} not found`);
					err.status = 404;
					return next(err);
				} else if (!comment) {
					err = new Error(`Comment ${req.params.commentId} not found`);
					err.status = 404;
					return next(err);
				} else if (!comment.author.equals(req.user._id)) {
					console.log(comment.author.equals(req.user._id), "match?");
					err = new Error(
						`You are not the author of ${req.params.commentId}, you may not edit it`
					);
					err.status = 403;
					return next(err);
				} else {
					err = new Error(`Something went wrong`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		Campsite.findById(req.params.campsiteId)
			.then((campsite) => {
				const comment = campsite.comments.id(req.params.commentId);
				if (
					campsite &&
					campsite.comments.id(req.params.commentId) &&
					comment.author.equals(req.user._id)
				) {
					campsite.comments.id(req.params.commentId).remove();
					campsite
						.save()
						.then((campsite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(campsite);
						})
						.catch((err) => next(err));
					// return next();
				} else if (!campsite) {
					err = new Error(`Campsite ${req.params.campsiteId} not found`);
					err.status = 404;
					return next(err);
				} else if (!comment) {
					err = new Error(`Comment ${req.params.commentId} not found`);
					err.status = 404;
					return next(err);
				} else if (!comment.author.equals(req.user._id)) {
					console.log(comment.author.equals(req.user._id), "match?");
					err = new Error(
						`You are not the author of ${req.params.commentId}, you may not delete it`
					);
					err.status = 403;
					return next(err);
				} else {
					err = new Error(`Something went wrong`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	});

module.exports = campsiteRouter;
