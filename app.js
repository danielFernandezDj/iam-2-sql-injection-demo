const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
require('dotenv').config();

app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');
db.serialize(function () {
	db.run("CREATE TABLE user (username TEXT, password TEXT, title TEXT)");
	db.run("INSERT INTO user VALUES ('privilegedUser', 'privilegedUser1', 'Administrator')");
});

// GET route to serve the HTML file
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

// POST route to handle form submission
app.post('/login', (req, res) => {
	// Extracting username and password from the form submission
	const username = req.body.username;
	const password = req.body.password;

	// Constructing the SQL query (note: this is intentionally vulnerable to SQL injection)
	const query = "SELECT title FROM user WHERE username = '" + username + "' AND password = '" + password + "'";

	// Logging the variables and the query to see how SQL injection could work
	console.log('Username:', username);
	console.log('Password:', password);
	console.log('SQL Query:', query);

	// Execute the query to check the validity of the credentials
	db.get(query, function (err, row) {
		if (err) {
			console.log('ERROR', err);
			res.redirect("/index.html#error");
		} else if (!row) {
			res.redirect("/index.html#unauthorized");
		} else {
			res.send('Hello <b>' + row.title + '!</b><br />' +
				'This file contains all your secret data: <br /><br />' +
				'SECRETS <br /><br /> MORE SECRETS <br /><br />' +
				'<a href="/index.html">Go back to login</a>');
		}
	});
});

const port = process.env.PORT;
app.listen(port, () => {
	console.log(`🎣 Fishing' on port: ${port}`);
});
