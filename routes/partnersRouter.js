const express = require("express");
const partnersRouter = express.Router();

partnersRouter
	.route("/")
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		next();
	})
	.get((req, res) => {
		res.end("Will send all the partners info to you");
	})
	.post((req, res) => {
		res.end(
			`Will add the partner: ${req.body.name} with description: ${req.body.description}`
		);
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /partners info");
	})
	.delete((req, res) => {
		res.end("Deleting all partners info");
	});

partnersRouter
	.route("/:promotionId")
	.get((req, res) => {
		res.end(
			`Will send all the information to you for partner at ${req.params.promotionId}`
		);
	})
	.post((req, res) => {
		res.end(
			`Will add the partner ${req.params.promotionId}: ${req.body.name} with description: ${req.body.description} to db`
		);
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /campsites");
	})
	.delete((req, res) => {
		res.end(`Deleting partner at partner number ${req.params.promotionId}`);
	});

module.exports = partnersRouter;
