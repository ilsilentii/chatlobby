$(function() {

    var connection = new RTCMultiConnection();

    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    connection.maxParticipantsAllowed = 16;

    connection.session = {
        audio:true,
        video:false,
        data:true
    }

    let username;
    let roomID;
    let isRoomOpened = false;
    let speaking;
    let listUsers = [];
    let arrayOfUsers;
    let streamByUserId;
    let localStream;

    document.getElementById('open').onclick = function() {
        this.disabled = true;
        document.getElementById('join').disabled = true;
        lobby = "open";
        lobbyCreation();

    }

    document.getElementById('join').onclick = function() {
        this.disabled = true;
        document.getElementById('open').disabled = true;
        lobby = "join";
        lobbyCreation();
        
    }

    document.getElementById('list').onclick = function() {
        this.disabled = false;
        
        var arrayOfUsers = connection.getAllParticipants();
        console.log(arrayOfUsers)
        
    }

    document.getElementById('leave').onclick = function() {
        this.disabled = false;
        document.getElementById('join').disabled = false;
        
        connection.closeSocket();

        $('*[id*=user]:visible').each(function() {
            $(this).remove();
        });
        
    }

    if($('.mute').length) {
        console.log('This button exists')
    }

function lobbyCreation() {

    username = $('#name').val()
    roomID = $('#roomID').val()
    speaking = username

    connection.session.audio = true;

    connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: false,
    OfferToReceiveData: true
	};

	connection.mediaConstraints = {
    video: false,
    audio: true
	};

	connection.addStream({
    audio:true,
    data:true
	});

   connection.extra = {
        userID: username 
    };

connection.onstream = function(event) {

    listUsers.push(event.extra.userID)

    initHark({
        stream: event.stream,
        streamedObject: event,
        connection: connection
    });

    if(event.type === "local") {
        
        localStream = connection.attachStreams[0];
        
        $('<div></div').attr('id', "user-" + username).addClass('microphone').appendTo('#sidebar');
        $('<i></i>').attr('id','mic-' + username).addClass('fas fa-volume-up').appendTo("#user-" + username);
        $('<span>' + username + '</span>').appendTo("#user-" + username);

        $('<input></input>').attr({'type': 'button','id':'btn-' + username,'value':'mute'}).addClass('mute').appendTo("#user-" + username);

        document.getElementById('btn-' + username).onclick = function() {
               
            if (this.value === 'mute') {
                this.value = 'unmute';
                localStream.mute('both');
            } else {
                this.value = 'mute';
                localStream.unmute('both');        
            }
        }
    }

    if(event.type === "remote") {
            
        streamByUserId = connection.streamEvents.selectFirst({ userid: event.userid}).stream;

        $('<div></div').attr('id', "user-" + event.extra.userID).addClass('microphone').appendTo('#sidebar');
        $('<i></i>').attr('id','mic-' + event.extra.userID).addClass('fas fa-volume-up').appendTo("#user-" + event.extra.userID);
        $('<span>' + event.extra.userID + '</span>').appendTo("#user-" + event.extra.userID);
        $('<input></input>').attr({'type': 'button','id':'btn-' + event.extra.userID,'value':'mute'}).addClass('mute').appendTo("#user-" + event.extra.userID); 

         document.getElementById('btn-' + event.extra.userID).onclick = function() {
               
            if (this.value === 'mute') {
                this.value = 'unmute';
                streamByUserId.mute();

            } else {
                this.value = 'mute';
                streamByUserId.unmute();
                
            }
        }
    }  
};

connection.onleave = function(event) {

    $('#user-' + event.extra.userID).remove()

};

connection.onmessage = function(event) {
   
    if (event.data.speaking === true) {
        $('#mic-' + event.data.whoIsSpeaking).css('color','white')
    }
    if(event.data.speaking === false) {
        $('#mic-' + event.data.whoIsSpeaking).css('color','#242426')
    }
};

connection.onmute = function(e) {
   if(e.type === 'local'){
        $('#mic-' + username).removeClass('fa-volume-up').addClass('fa-volume-mute').css('color','#242426')
        console.log(username)
    }
    if(e.type === 'remote') {
        connection.send({
            whoIsSpeaking: listUsers[0],
            speaking:true
        });
        $('#mic-' + username).css('color','#242426')
    }

};

connection.onunmute = function(e) {
   console.log("this user is free to talk")
};

connection.onspeaking = function (e) {
    // e.streamid, e.userid, e.stream, etc.

    if(e.type === 'local'){
        $('#mic-' + username).css('color','white')
        console.log(username)
    }
    if(e.type === 'remote') {
        connection.send({
            whoIsSpeaking: listUsers[0],
            speaking:true
        });
        $('#mic-' + username).css('color','white') //<=== Check to see if this line of code is needed!!!!
        console.log(listUsers[0])
    }
};

connection.onsilence = function (e) {
    // e.streamid, e.userid, e.stream, etc.

    if(e.type === 'local'){
        $('#mic-' + username).css('color','#242426')
    }
    if(e.type === 'remote') {
        connection.send({
            whoIsSpeaking: listUsers[0],
            speaking:false
        });
        $('#mic-' + username).css('color','#242426')
    }

};

connection.onvolumechange = function(event) {
    event.mediaElement.style.borderWidth = event.volume;
};

function initHark(args) {
    if (!window.hark) {
        throw 'Please link hark.js';
        return;
    }
  
    var connection = args.connection;
    var streamedObject = args.streamedObject;
    var stream = args.stream;

    var options = {};
    var speechEvents = hark(stream, options);

    speechEvents.on('speaking', function() {
        connection.onspeaking(streamedObject);
    });

    speechEvents.on('stopped_speaking', function() {
        connection.onsilence(streamedObject);
    });

    speechEvents.on('volume_change', function(volume, threshold) {
        streamedObject.volume = volume;
        streamedObject.threshold = threshold;
        connection.onvolumechange(streamedObject);
    });
}

    if(lobby === "open") {
        connection.open(roomID)
        }

    if(lobby === "join") {
        connection.join(roomID)

    } 

}

 $(document).keyup(function(event) { 
        if(event.keyCode == "76") {
 
        $('#sidebar').removeClass('invisible').toggleClass('fadeOutRight fadeInRight') 
    }
});


});

   





  
