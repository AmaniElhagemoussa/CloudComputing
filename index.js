/**
 * http://usejsdoc.org/
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require("fs");
var ss = require('socket.io-stream');
var path = require('path');

var users = {};
var sockets = {};

//Port
http.listen(3000, function() {
	console.log('listening on *:3000');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/static', express.static(__dirname + '/static'));


app.get('/download/:file(*)', function(req, res) {
    var file = req.params.file;
    var path = __dirname + "/download/" + file;

    res.download(path);
});



// Starting connection
io.on('connection', function(socket) {
	
	socket.on('adduser', function(username) {
		if (username !== '' && username !== null) {

			// store username in socket session for this client
			socket.username = username;

			// socket.room = 'chatroom';
			// socket.join('chatroom');

			// add username to list
			users[username] = username;
			// add socket of user to list
			sockets[socket.username] = socket;

			// echo to client they are connected
			console.log(username + ' is connected');
			socket.broadcast.emit('chat message', username + ' has connected to the chatroom');

			// echo to room 1 that a person has connected to their room
			// socket.broadcast.to('chatroom').emit('updatechat', 'SERVER',
			// username
			// + ' has connected to this room');
			// socket.emit('updaterooms', rooms, 'chatroom');
		}
	});
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('chat message', function(msg) {
		var data = msg.trim();
//		console
		// we tell the client to execute 'updatechat' with 2 parameters
		if (data.substr(0, 6) === '/list') {
			sockets[socket.username].emit('chat message', "Users online: " + '| ' + Object.keys(users) + ' |');
			
			
		} else if (data.substr(0, 1) === '@') {
			data = data.substr(1);
			var index = data.indexOf(' ');
			if (index !== -1) {
				var name = data.substring(0, index);
				var pmsg = data.substring(index + 1);
				if (name in sockets) {
					sockets[name].emit('chat message', socket.username + ' : ' +msg);
					sockets[socket.username].emit('chat message', socket.username+ ' : ' + msg);
					console.log(socket.username + ' whispers to ' + name);
				}
			}
			// Message sent in console & chat
		}else {
			io.emit('chat message', socket.username + ": " +  msg);
			console.log(socket.username + ' schreibt..' + msg);

		}
	});
	
	
//user disconnects, when connection is no longer active
		socket.on('disconnect', function(msg){
//		  console.log('user disconnected');
//		  socket.emit('chat message', socket.id + ' disconnected');
			// remove the username from global usernames list
			delete users[socket.username];
			// update list of users in chat, client-side
			io.emit('updateusers', users);
			// echo globally that this client has left
			socket.broadcast.emit('chat message', socket.username + ' has disconnected');
			console.log(socket.username + ' has disconnected');
			// socket.leave(socket.room);
			
	  });
	  

	  ss(socket).on('file', function(stream, data) {
	            var filename = "./download/" + path.basename(data.filename); 
	            stream.pipe(fs.createWriteStream(filename));
	            io.emit('file', {filename: data.filename});
	  
	    });  
	  
});

//user list for connected & disconnected user
for (var socketId in io.sockets.sockets) {
    io.sockets.sockets[socketId].get('username', function(err, username) {
    console.log(username);
  	socket.broadcast.emit(username);
    });
}