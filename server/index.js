'use strict';

const express = require('express');
const volleyball = require('volleyball');
const cors = require('cors');

require('dotenv').config();

const app = express();

const middleware = require('./auth/middleware.js');
const auth = require('./auth/auth.js');
const notes = require('./api/notes.js');

const port = process.env.PORT || 5000;

app.use(volleyball);
app.use(cors({
	origin: 'http://localhost:8082'
}));
app.use(express.json());
app.use(middleware.checkTokenSetUser);

app.get('/', (req, res) => {
	res.json({
		message: 'Hello World',
		user: req.user
	});
});

app.use('/auth', auth);
app.use('/api/v1/notes', middleware.isLoggedIn, notes);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
	console.log('Listening on port', port);
});

function notFound(req, res, next) {
	res.status(404);
	next(new Error('Not Found - ' + req.originalUrl));
}

function errorHandler(err, req, res, next) {
	res.status(res.statusCode || 500);
	res.json({
		message: err.message,
		stack: err.stack
	});
}