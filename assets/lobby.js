$(function() {

   $(document).keyup(function(event) { 
  		if(event.keyCode == "76") {
 
        $('#sidebar').removeClass('invisible').toggleClass('fadeOutRight fadeInRight') 
    }
    });

let username;
let roomID;
let isRoomOpened = false;

console.log("start: ", isRoomOpened )

var connection = new RTCMultiConnection();

    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    connection.session = {
    	audio:true,
    	video:false
    }

    connection.session.audio = true;

    connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: false
	};

	connection.mediaConstraints = {
    video: false,
    audio: true
	};

	connection.addStream({
    audio:true
	});

var media = document.getElementById('media')

function works() {
connection.onstream = function(event) {

    console.log("onstream: ", isRoomOpened )

    initHark({
        stream: event.stream,
        streamedObject: event,
        connection: connection
    });

    if (isRoomOpened === true) {
        
        $('<div></div').addClass('microphone').appendTo('#sidebar');
        $('<i></i>').attr('id','mic').addClass('fas fa-volume-up').appendTo('.microphone');
        $('<span>' + username + '</span>').appendTo('.microphone');
    
    }

        

    console.log(event)
    var audio = event.stream

    media.appendChild(audio)
};

}

connection.onspeaking = function (e) {
    // e.streamid, e.userid, e.stream, etc.
    $('#mic').css('color','white')
};

connection.onsilence = function (e) {
    // e.streamid, e.userid, e.stream, etc.
    $('#mic').css('color','#242426')
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

	document.getElementById('open').onclick = function() {
    	this.disabled = true;
    	document.getElementById('join').disabled = true;
        isRoomOpened = true;
        works()

  		username = $('#name').val()
  		roomID = $('#roomID').val()
    	connection.open(roomID)
        

        console.log("open: ", isRoomOpened )

    }

    document.getElementById('join').onclick = function() {
    	this.disabled = true;
    	document.getElementById('open').disabled = true;

    	username = $('#name').val()
  		roomID = $('#roomID').val()
    	connection.join(roomID)
        

    	$('<div></div').addClass('microphone').appendTo('#sidebar');
    	$('<i></i>').attr('id','mic').addClass('fas fa-volume-up').appendTo('.microphone');
    	$('<span>' + username + '</span>').appendTo('.microphone');


        var array = connection.getAllParticipants();

        console.log("Join: ", isRoomOpened )
    }






});

   





  
