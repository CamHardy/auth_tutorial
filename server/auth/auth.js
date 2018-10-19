const express = require('express');
const joi = require('joi');
const bcrypt = require('bcryptjs');

const db = require('../db/connection.js');
const users = db.get('users');
users.createIndex('username', {unique: true});

const router = express.Router();

const schema = joi.object().keys({
	username: joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(1).max(30).required(),
	password: joi.string().trim().min(8).required()
});

router.get('/', (req, res) => {
	res.json({
		message: 'success!'
	});
});

router.post('/signup', (req, res, next) => {
	const result = joi.validate(req.body, schema);
	if (result.error === null) {
		// input is valid
		// make sure input is unique
		users.findOne({
			username: req.body.username
		}).then(user => {
			// if user is undefined, username is not in the db
			if (user) {
				res.status(409);
				// throw an error, this user already exists
				next(new Error('User already exists'));
			} else {
				// hash the pssword and insert the user into the db
				bcrypt.hash(req.body.password, 8).then(hashedPass => {
					const newUser = {
						username: req.body.username,
						password: hashedPass
					};

					// insert the user into the db
					users.insert(newUser).then(insertedUser => {
						delete insertedUser.password;
						res.json(insertedUser);
					});
				});
			}
		});
	} else {
		res.status(422);
		// send the error back to the client
		next(result.error);
	}
});

router.post('/login', (req, res, next) => {
	const result = Joi.validate(req.body, schema);
	if (result.error === null) {
		users.findOne({
			username: req.body.username
		}).then(user => {
			if (user) {
				bcrypt.compare(req.body.password, user.password)
				.then(result => {
					if (result) {
						res.json({result});
					} else {
						respondError422(res, next);
					}
				});
			} else {
				respondError422(res, next);
			}
		});
	} else {
		respondError422(res, next);
	}
});

function respondError422(res, next) {
	res.status(422);
	next(new Error('Unable to log in'));
}

module.exports = router;