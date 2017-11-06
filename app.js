var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/chat', function(req, res){
    // res.send('Hello World!');
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(3000, () => console.log('App listening on port 3000!'));