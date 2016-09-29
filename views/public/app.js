var apiKey='45631912';

function getSession(){
			$.ajax({
				type: 'GET',
				url: '/getSession',
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
				url: '/getToken?sessionId='+sessionId,
				success: function(resultData) {
					console.log(resultData);
					document.getElementById("tokenId").innerHTML=resultData.tokenId;
				}
			});
	}
	function establishConnection(){
		var sessionId=document.getElementById("sessionId").innerHTML;
		var tokenId=document.getElementById("tokenId").innerHTML;
		console.log("Session Id:"+sessionId);
		console.log("Token id:"+tokenId);
		
		initializeSession(sessionId,tokenId );
	}


function initializeSession(sessionId, tokenId) {
	console.log("Called initializeSession...");
	var session = OT.initSession(apiKey, sessionId);
	if(session==null){
	  console.log("Not able to create session object. You may exit");	  
	}	
  
	// Connect to the session
	session.connect(	tokenId, function(error) {
		// If the connection is successful, initialize a publisher and publish to the session
		console.log("Establishing connection! please wait...");
		if (error) {
			console.log('Unable to connect: ', error.message);
		}else{
			publisherProperties={insertMode: 'append',width: '100%',height: '100%'};
			var publisher = OT.initPublisher('publisherContainer', null , function (error){
							if (error) {
								console.log("The client cannot publish!")
							} else {
								console.log('Publisher initialized.');
								session.publish(publisher);
							}
						}
			);
			//The Publish object dispatches a streamCreated event when it starts streaming to the session:
			//The Publisher object dispatches a streamDestroyed event when it stops streaming to the session: These reasons include "clientDisconnected", "forceDisconnected", "forceUnpublished", or "networkDisconnected"
			//publisher.on(
				//streamCreated: function (event) {
					//	console.log('The publisher started streaming.');
				//},
				//streamDestroyed: function (event) {
					//	console.log("The publisher stopped streaming. Reason: "+ event.reason);
				//}
			
			//);
		//} else {
			//console.log('There was an error connecting to the session: ', error.code, error.message);
		}
	});
  
	// Subscribe to a newly created stream
	session.on('streamCreated', function(event) {
		session.subscribe(event.stream, 'subscriber', {
			insertMode: 'append',
			width: '100%',
			height: '100%'
		});
	});

	session.on({
		connectionCreated: function (event) {
			connectionCount++;
			console.log(connectionCount + ' connections.');
		},
		connectionDestroyed: function (event) {
			connectionCount--;
			console.log(connectionCount + ' connections.');
		},
		sessionDisconnected: function sessionDisconnectHandler(event) {
			// The event is defined by the SessionDisconnectEvent class
			console.log('Disconnected from the session.', event.reason);
			document.getElementById('disconnectBtn').style.display = 'none';
			if (event.reason == 'networkDisconnected') {
				alert('Your network connection terminated.')
			}
		}
	});
}

function disconnect() {
  session.disconnect();
}

