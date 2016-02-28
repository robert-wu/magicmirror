'use strict';

const iMessage = require('imessage');
const im = new iMessage();

let callback = null;
let lastDate = 0;

function listenForMessages() {
	im.getDb(function(err, db) {
		const results = db.get('SELECT * FROM `message` WHERE is_sent=0 AND date > ' + lastDate + ' ORDER BY date DESC LIMIT 1', function(err, row) {
			// row is latest message after last check
			if (row) {
				const text = row.text;
				lastDate = row.date + 1;
				callback(text);
				console.log('got message: ' + text);
				//getting person doesn't work cuz we can't easily get the name
				// db.get("SELECT * FROM `handle` WHERE ROWID = $id", { $id: row.handle_id }, function(err, person) {
				// 	console.log(person);
				// });
			}
		});
	})
	//schedule another check
	setTimeout(listenForMessages, 500);
}

module.exports = function(cb) {
	console.log('Starting listening for messages');
	callback = cb;
	listenForMessages();
};
