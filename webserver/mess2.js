var iMessage = require('imessage');
var im = new iMessage();
var socket = require('socket.io-client')('http://172.20.10.2:3006');

var lastDate=0;
var mess='';

socket.on('connect', function(){});
socket.on('event', function(data){});
socket.on('disconnect', function(){});

function listenForMessages() {
	im.getDb(function(err, db) {
		results = db.get('SELECT * FROM `message` WHERE is_sent=0 AND date > ' + lastDate + ' ORDER BY date DESC LIMIT 1', function(err, row) {
			// row is latest message after last check
			console.log(row);
			if (row!=undefined) {
				text = row.text;
				lastDate = row.date + 1;
				mess=text;
				console.log('got message: ' + text);
				socket.emit('CH01', 'kin-mess:'+mess);
				socket.emit('CH01', "kin-time:"+row.date);

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

listenForMessages();