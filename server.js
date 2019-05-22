'use strict';

var express = require('express');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors');
const dns = require('dns');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;
let counter = 1;

const urlSchema = mongoose.Schema({
	original_url: { type: String, required: true },
	short_url: { type: Number, default: 1 }
});

const Url = mongoose.model('url', urlSchema);

/** this project needs a db !! **/
mongoose.connect(
	process.env.MONGOLAB_URI ||
		`mongodb+srv://lioartoil:jbpr0Zow1HFtXZOH@api-and-microservices-a57mx.mongodb.net/url-shortener?retryWrites=true`,
	{
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	}
);

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function(req, res) {
	res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:shorten', async (req, res) => {
	const url = await Url.findOne({ short_url: shorten });

	if (url) {
		res.redirect(url.original_url);
	}
});

app.post('/api/shorturl/new', (req, res) => {
	dns.lookup(req.body.url, (err, addresses) => {
		if (err) return;

		const url = new Url({ original_url: req.body.url, short_url: counter++ });

		url.save((err, data) => {
			if (err) return res.status(400).send();
			res.json({ original_url: url.original_url, short_url: url.short_url });
		});
	});
});

app.listen(port, function() {
	console.log('Node.js listening ...');
});
