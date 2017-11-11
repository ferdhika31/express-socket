var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var gravatar = require('gravatar');

app.use(express.static('public'));

var port = 1000;
var users = {};
var rooms = {};

app.get('/chat', function(req, res){

    res.sendFile(__dirname + '/public/chat.html');
});

app.post('/kk', function(req, res){
    // res.send('Hello World!');
    res.send(req.param('id', null));
    // res.sendFile(__dirname + '/public/index.html');
});

app.get('/email/:email', function(req, res){
    var filename = gravatar.url(req.params.email, {s: '140', r: 'x', d: 'mm'});
    // res.contentType(filename);

    res.send(filename);
})

io.on('connection', function(socket){
    socket.on('masuk', function (data, callback) {
        if (data.email in users) {
            callback(false);
        } else {
            socket.nama = data.nama;
            socket.email = data.email;
            socket.image = gravatar.url(data.email, {s: '140', r: 'x', d: 'mm'});

            callback(socket.image);

            users[socket.email] = socket;
            socket.join('semua');
            if (rooms['semua'] == undefined) rooms['semua'] = [];
            rooms['semua'].push({
                foto : socket.image,
                nama : socket.nama,
                email : socket.email
            });
            socket.emit('user');
        }
    });

    socket.on('pesan_sistem', function(data){
        var objMsg = { pesan: data.pesan, room:data.room };
        
        //kirim data ke semua client yang mengakses site(localhost) yang sama 
        socket.broadcast.emit("pesan_sistem", objMsg);
    });

    socket.on('gabung', function (room) {
        socket.join(room);
        if (rooms[room] == undefined) rooms[room] = [];
        rooms[room].push({
            foto : socket.image,
            nama : socket.nama,
            email : socket.email
        });
        io.emit('user');
    });

    socket.on('chat', function (msg) {
        // parameter
        var objMsg = { pesan: msg.msg, nama: socket.nama, email: socket.email, foto: socket.image, room: msg.room };

        //kirim data ke client yang minta/kirim sebelumnya.
        socket.emit('chat', objMsg);

        //kirim data ke semua client yang mengakses site(localhost) yang sama 
        socket.broadcast.emit("chat", objMsg);
    });

    socket.on('daftaruser', function (data) {
        //kirim data ke client yang minta/kirim sebelumnya.
        socket.emit('users', rooms[data.toLowerCase()]);
    });

    socket.on('disconnect', function (data) {

        delete users[socket.email];
        for (var room in rooms) {
            if (rooms.hasOwnProperty(room)) {
                var element = rooms[room];
                var index = element.map(function(el) {
                    return el.email;
                }).indexOf(socket.email);

                if (index > -1) {
                    // socket.emit('daftaruser', room);
                    element.splice(index, 1);
                    io.to(room).emit('user');
                    // kirim pesan dari sistem ke semua pengguna yang ada di ruangan
                    socket.broadcast.to(room).emit('pesan_sistem', { 
                        pesan: '<font color"green"><strong>'+socket.nama+'</strong> keluar dari ruangan.</font>', 
                        room: room 
                    });
                }
            }
        }  
    });

    socket.on('clientMsg', function(objMsg){
        //kirim data ke client yang minta/kirim sebelumnya.
        socket.emit("serverMsg", objMsg);
        
        //kirim data ke semua client yang mengakses site(localhost) yang sama 
        socket.broadcast.emit("serverMsg", objMsg);
    });
});

http.listen(port, () => console.log('App listening on port : '+port));