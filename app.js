var apiKey='45631912';
var sessionId,token;

function getSession(){
			$.ajax({
				type: 'GET',
				url: 'http://localhost:8081/getSession',
				success: function(resultData) {
					console.log(resultData);
					document.getElementById("sessionId").innerHTML=resultData.sessionId;
				}
			});
	}
	function getToken(){
			var sessionId=document.getElementById("sessionId").innerHTML;
			$.ajax({
				type: 'GET',
				url: 'http://localhost:8081/getToken?sessionId='+sessionId,
				success: function(resultData) {
					console.log(resultData);
					document.getElementById("tokenId").innerHTML=resultData.tokenId;
				}
			});
	}
	function establishConnection(){
		var sessionId=document.getElementById("sessionId").innerHTML;
		var tokenId=document.getElementById("tokenId").innerHTML;
		initializeSession(sessionId);
	}


function initializeSession(sessionId) {
  console.log("Called initializeSession...");
  var session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function(event) {
    session.subscribe(event.stream, 'subscriber', {
      insertMode: 'append',
      width: '50%',
      height: '50%'
    });
  });

  session.on('sessionDisconnected', function(event) {
    console.log('You were disconnected from the session.', event.reason);
  });

  // Connect to the session
  session.connect(token, function(error) {
    // If the connection is successful, initialize a publisher and publish to the session
	console.log("Establishing connection! please wait...");
    if (!error) {
      var publisher = OT.initPublisher('publisher', {
        insertMode: 'append',
        width: '50%',
        height: '50%'
      });

      session.publish(publisher);
    } else {
      console.log('There was an error connecting to the session: ', error.code, error.message);
    }
  });
}
