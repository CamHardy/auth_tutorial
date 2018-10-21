'use strict';

const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../db/connection.js');
const users = db.get('users');
users.createIndex('username', {unique: true});

const router = express.Router();

const schema = Joi.object().keys({
	username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(1).max(30).required(),
	password: Joi.string().trim().min(8).required()
});

function createTokenSendResponse(user, res, next) {
	const payload = {
		_id: user._id,
		username: user.username
	};

	jwt.sign(
		payload, 
		process.env.TOKEN_SECRET, 
		{expiresIn: '1d'}, 
		(err, token) => {
			if (err) {
				respondError422(res, next);
			} else {
				res.json({token});
			}
		});
}

router.get('/', (req, res) => {
	res.json({
		message: 'success!'
	});
});

router.post('/signup', (req, res, next) => {
	const result = Joi.validate(req.body, schema);
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
				bcrypt.hash(req.body.password.trim(), 8).then(hashedPass => {
					const newUser = {
						username: req.body.username,
						password: hashedPass
					};

					// insert the user into the db
					users.insert(newUser).then(insertedUser => {
						createTokenSendResponse(insertedUser, res, next);
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
						createTokenSendResponse(user, res, next);
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