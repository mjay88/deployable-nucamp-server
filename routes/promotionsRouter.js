const express = require("express");
const promotionsRouter = express.Router();

promotionsRouter
	.route("/")
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		next();
	})
	.get((req, res) => {
		res.end("Will send all the promotions to you");
	})
	.post((req, res) => {
		res.end(
			`Will add the promotion: ${req.body.name} with description: ${req.body.description}`
		);
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /promotions");
	})
	.delete((req, res) => {
		res.end("Deleting all promotions");
	});

promotionsRouter
	.route("/:promotionId")
	.get((req, res) => {
		res.end(
			`Will send all the information to you for promotion at ${req.params.promotionId}`
		);
	})
	.post((req, res) => {
		res.end(
			`Will add the promotion ${req.params.promotionId}: ${req.body.name} with description: ${req.body.description} to db`
		);
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /campsites");
	})
	.delete((req, res) => {
		res.end(`Deleting promotion at promotion number${req.params.promotionId}`);
	});

module.exports = promotionsRouter;
