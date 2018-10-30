'use strict';

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const db = require('../db/connection');
const notes = db.get('notes');

const schema = Joi.object().keys({
	title: Joi.string().trim().max(100).required(),
	note: Joi.string().trim().required()
});

router.get('/', (req, res) => {
	notes.find({
		user_id: req.user._id,
	}).then(notes => {
		res.json(notes);
	});
});

router.post('/', (req, res, next) => {
	const result = Joi.validate(req.body, schema);
	if (result.error === null) {
		const note = {
			...req.body,
			user_id: req.user._id
		};
		notes.insert(note).then(note => {
			res.json(note);
		});
	} else {
		res.status(422);
		next(new Error(result.error));
	}
});

module.exports = router;