$(document).ready(function () {
    var socket = io(); //Socket instance

    // variabel komponen
    var chatWindow = $('#chat'); // tampilan chat element div
    var loginWindow = $('#masuk'); // tampilan masuk element div
    var addChannelWindow = $('#ruangan'); //Add channel window (dialog) div  
    var namaRuangan = $('#nama-ruangan');  
    var inputNama = $('#nama-chat-form-input');
    var inputEmail = $('#email-chat-form-input');
    var btnMasuk = $('#masuk-chat-button');
    var btnTambahRuang = $('#tambah-ruangan');
    var lblIdentitasEmail = $('#identitas-email');
    var imgIdentitasFoto = $('#identitas-foto');
    var inputPesan = $('#send-message-form-input');
    var kirimPesanForm = $('#send-message-form'); //Form untuk kirim pesan
    var kirimPesanFormInput = $('#send-message-form-input'); // untuk kirim pesan dari input
    var kirimPesanButton = $('#send-message-button'); //Button untuk kirim pesan
    var inputNamaRuangan = $('#nama-ruangan-form-input');
    var btnBuatRuang = $('#buat-ruangan-form-button');
    var tutupModalRuangan = $('#tutup-modal-ruangan');

    var daftarRuangan = $('#daftar-ruangan');

    var ruanganSekarang = 'Semua';

    // trigerna
    btnMasuk.click(function(){
        masuk();
        return false;
    });

    btnTambahRuang.click(function(){
        addChannelWindow.show();
        return false;
    });

    btnBuatRuang.click(function(){
        tambahRuangan();
        return false;
    });

    tutupModalRuangan.click(function(){
        addChannelWindow.hide();
        return false;
    });
    
    kirimPesanButton.click(function(){
        kirimPesan();
        return false;
    });

    kirimPesanForm.submit(function(){
        kirimPesan();
        return false;
    });

    daftarRuangan.click(function(e){
        if (e.target.tagName === 'A' && e.target.id.substring(0, 7) === 'ruangan') {
            var namaRuangan = e.target.id.substring(8);
            loadRuangan(namaRuangan);
        }
    });

    function masuk(){
        // inisiasi awal
        buatRuangan('Semua');
        $('#chat-list-Semua').show();
        namaRuangan.text('Ruangan : Semua');

        socket.emit('masuk', {email:inputEmail.val(), nama:inputNama.val()}, function (data) {
            if(data) {
                loginWindow.hide();
                chatWindow.show();

                socket.emit('pesan_sistem', { pesan: '<font color"green"><strong>'+inputNama.val()+'</strong> bergabung dalam obrolan.</font>', room: 'Semua' });
                
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
        var ruanganBaru = $('<ol class="chat-list mdl-color--teal-100" id="chat-list-' + namaRuangan + '"><li class="bot"><div class="msg"><p>Invite teman anda dengan memberti tahu nama ruangan ini!</p></div></li></ol>');
        $('#chat-cell').append(ruanganBaru);
    }

    // Kirim pesan
    function kirimPesan() {  
        var ruanganSekarang = "";
        $('#chat-cell').children('ol').each(function () {
            if ($(this).is(":visible")) {
                ruanganSekarang = $(this).prop('id').substring(10);
            }
        });

        socket.emit('chat', { msg: inputPesan.val(), room: ruanganSekarang });
        inputPesan.val('');
    }

    // Buat atau gabung ke ruangan baru
    function tambahRuangan() {
        var namaRuanganBaru = inputNamaRuangan.val().trim().toLowerCase();
        var sudahGabung = false;
        $('#chat-cell').children('ol').each(function () {
            if ($(this).prop('id').substring(10) == namaRuanganBaru) {
                sudahGabung = true;
            }
        });
        if (!sudahGabung) {
            var linkRuangan = $('<a class="mdl-navigation__link" id="ruangan-'+namaRuanganBaru+'"></a>');
            linkRuangan.html('<i class="material-icons" role="presentation">forum</i>&nbsp;'+namaRuanganBaru);
            daftarRuangan.prepend(linkRuangan);

            inputNamaRuangan.val('');
            loginWindow.hide();
            chatWindow.show();
            addChannelWindow.hide();
            buatRuangan(namaRuanganBaru);
            socket.emit('gabung', namaRuanganBaru);
            loadRuangan(namaRuanganBaru);

            socket.emit('pesan_sistem', { pesan: '<font color"green"><strong>'+inputNama.val()+'</strong> bergabung dalam obrolan.</font>', room: namaRuanganBaru });
            
        } else {
            inputNamaRuangan.val('');
            loginWindow.hide();
            chatWindow.show();
            addChannelWindow.hide();
            loadRuangan(newChannelName);
        }
    }

    // load ruangan
    function loadRuangan(nama){
        $('#chat-cell').children('ol').each(function () {
            if ($(this).prop('id').substring(10) == nama) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        socket.emit('daftaruser', nama);
        ruanganSekarang = nama;
        namaRuangan.text('Ruangan : '+nama);
    }

    /* Server sends */
    socket.on('users', function (data) {
        $('#users').html('');

        console.log(data);
        //Loop through the users
        for (i = 0; i < data.length; i++) {
            var listItem = $('<li class="user-list-item mdl-list__item">');
            var mainSpan = $('<span class="mdl-list__item-primary-content dkOrang"></span>');
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

        // Buat pesan baru
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