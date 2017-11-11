$(document).ready(function () {
    var socket = io(); //Socket instance

    // var tampilan 
    var chatWindow = $('#chat'); // tampilan chat element div
    var loginWindow = $('#masuk'); // tampilan masuk element div
    var addChannelWindow = $('#ruangan'); //Add channel window (dialog) div

    // var komponen
    var inputNama = $('#nama-chat-form-input');
    var inputEmail = $('#email-chat-form-input');
    var btnMasuk = $('#masuk-chat-button');
    var btnTambahRuang = $('#tambah-ruangan');
    var lblIdentitasEmail = $('#identitas-email');
    var imgIdentitasFoto = $('#identitas-foto');
    var inputPesan = $('#send-message-form-input');
    var sendMessageForm = $('#send-message-form'); //Form for sending messages
    var sendMessageFormInput = $('#send-message-form-input'); //Textfield for message input
    var sendMessageButton = $('#send-message-button'); //Button for sending message
    var inputNamaRuangan = $();

    // chatWindow.show();

    btnMasuk.click(function () {
        masuk();
        console.log('hitut');
        return false;
    });

    btnTambahRuang.click(function () {
        addChannelWindow.show();
        return false;
    });

    //Send message form triggers
    sendMessageButton.click(function () {
        sendMessage();
        return false;
    });

    sendMessageForm.submit(function () {
        sendMessage();
        return false;
    });


    function masuk(){
        buatRuangan('Semua');
        $('#chat-list-Semua').show();

        socket.emit('pesan_sistem', { pesan: '<font color"green"><strong>'+inputNama.val()+'</strong> bergabung dalam obrolan.</font>', room: 'Semua' });

        socket.emit('masuk', {email:inputEmail.val(), nama:inputNama.val()}, function (data) {

            if(data) {
                loginWindow.hide();
                chatWindow.show();
                
                lblIdentitasEmail.text(inputEmail.val()+'('+inputNama.val()+')');
                imgIdentitasFoto.attr("src", data);
            }else {
                var errorText = $('#email-field-title');
                errorText.css("color", "red");
                errorText.html('Email sudah digunakan!');
            }

        });
        // $loginChatFormInput.val('');
    }

    function buatRuangan(namaRuangan) {
        var ruanganBaru = $('<ol class="chat-list mdl-color--teal-100" id="chat-list-' + namaRuangan + '"><li class="bot"><div class="msg"><p>Invite teman anda dengan join ke ruangan ini!</p></div></li></ol>');
        $('#chat-cell').append(ruanganBaru);
    }

    //Send message
    function sendMessage() {  
        var currentroom = "";
        $('#chat-cell').children('ol').each(function () {
            if ($(this).is(":visible")) {
                currentroom = $(this).prop('id').substring(10);
            }
        });

        socket.emit('chat', { msg: inputPesan.val(), room: currentroom });
        inputPesan.val('');
    }

    /* Server sends */
    socket.on('users', function (data) {
        $('#users').html('');

        console.log(data);
        //Loop through the users
        for (i = 0; i < data.length; i++) {
            var listItem = $('<li class="user-list-item mdl-list__item">');
            var mainSpan = $('<span class="mdl-list__item-primary-content"></span>');
            mainSpan.append('<img src="'+data[i].foto+'" class="demo-avatar">&nbsp;' + data[i].nama);
            listItem.append(mainSpan);
            $('#users').append(listItem);
        }
    });

    socket.on('user', function () {
        // get ruangan
        $('#chat-cell').children('ol').each(function () {
            if ($(this).is(":visible")) {
                socket.emit('daftaruser', $(this).prop('id').substring(10));
            }
        });
    });

    socket.on('pesan_sistem', function(data){
        var listItem = '<li class="bot"><div class="msg"><p>'+data.pesan+'</p></div></li>';

        $('#chat-list-' + data.room).append(listItem);

        //Scroll down
        $('#chat-list-' + data.room).animate({ scrollTop: $('#chat-list-' + data.room).prop("scrollHeight") }, 500);
    });

    socket.on('chat', function (msg) {
        
        //Calculate time
        var d = new Date();
        var s = d.getSeconds();
        var m = d.getMinutes();
        var h = d.getHours();
        if (s < 10) {
            s = '0' + s;
        }
        if (m < 10) {
            m = '0' + m;
        }
        if (h < 10) {
            h = '0' + h;
        }

        //Create new message
        var listItem = '';
        if(inputEmail.val()==msg.email){
            listItem = '<li class="self">';
        }else{
            listItem = '<li class="other">';
        }
        
        listItem += '<div class="avatar"><img src="'+msg.foto+'" draggable="false"/></div>';
        listItem += '<div class="msg">';
        listItem += '<strong>'+msg.nama+'</strong><hr>';
        listItem += '<p>'+msg.pesan+'</p>';
        listItem += '<time>'+h+':'+m+'</time>';
        listItem += '</div>';
        listItem += '</li>';

        $('#chat-list-' + msg.room).append(listItem);

        // Scroll down
        $('#chat-list-' + msg.room).animate({ scrollTop: $('#chat-list-' + msg.room).prop("scrollHeight") }, 500);
    }); 
});