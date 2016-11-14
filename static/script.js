var io = require('socket.io-client');
var ss = require('socket.io-stream');

var socket = io();

ss.forceBase64 = true;

socket.on('connect', function(){
	var log ='';
	var pwd = '';
	while(log=== null || log === ''){
		 log = prompt('Welcome! Please enter your name!');
	}
	socket.emit('adduser', log);
	
	$('form').submit(function(){
        socket.emit('sendchat', $('#m').val());
        $('#m').val('');
        return false;
      });
});
//on connection to server, ask for user's name with an anonymous callback

//listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('chat message', function (user, msg) {
	$('#messages').append($('<li>')
			.append($('<span>').text('[ '
					+ (time.getHours() < 10 ? '0'
					+ time.getHours(): time.getHours())
					+ ':'
					+ (time.getMinutes() < 10 ? '0'
					+ time.getMinutes(): time.getMinutes())
					+ ' ] '),

				$('<b>').text(user+ ' : '),
				$('<span>').text(msg)));
});

$(document).ready(function() {
$('form').submit(function(event) {
	event.preventDefault();
	socket.emit('chat message', $('#m').val());
	$('#m').val('');
});

socket.on('file', function(data) {
	$('#messages').append($('<li class="upload">').append($('<span class="username">').text(data.userName)).append($('<div class="message">').append($('<a href="./download/' + data.filename + '">').text(data.filename)).append($('<div class="timestamp">').text(data.timeStamp))));
});

$('#fileinput').change(function(e) {
    var file = e.target.files[0];
    var stream = ss.createStream();

    // upload a file to the server.
    ss(socket).emit('file', stream, {size: file.size, filename: file.name});
    ss.createBlobReadStream(file).pipe(stream);
  });

});