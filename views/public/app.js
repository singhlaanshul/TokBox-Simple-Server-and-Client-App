var apiKey='45631912';
var connectionCount=0;
var success='';
var session;
var publisher, subscriber, stream;

function getSession(){
			$.ajax({
				type: 'GET',
				url: '/getSession',
				success: function(resultData) {
					console.log(resultData);
					sessionId=resultData.sessionId;
					console.log("Session Id:"+sessionId);	
					document.getElementById("sessionId").innerHTML=sessionId;
					$.ajax({
						type: 'GET',
						url: '/getToken?sessionId='+sessionId,
						success: function(resultData) {
							console.log(resultData);
							tokenId=resultData.tokenId;
							console.log("Token id:"+tokenId);
							document.getElementById("tokenId").innerHTML=tokenId;
							initializeSession(sessionId,tokenId );
						}		
					});
				}
			});
	}
	
	
function initializeSession(sessionId, tokenId) {
	
	session = OT.initSession(apiKey, sessionId);
	console.log("Session object created");
	if(session==null){
	  console.log("Not able to create session object. You may exit");	  
	}	
  
	// Connect to the session
	session.connect(	tokenId, function(error) {
		// If the connection is successful, initialize a publisher and publish to the session
		
		if (error) {
			console.log('Unable to connect: ', error.message);
			//Object doesn't support property or method 'connect'
		}else{
			console.log("Session connected");
		}
	});
  
	// Subscribe to a newly created stream
	session.on('streamCreated', function(event) {
										
					subscriberProperties={insertMode: 'append',width: '100%',height: '100%'};
					stream=event.stream;
					subscriber= session.subscribe(stream, 'subscriberContainer',null, function(error){
						if (error) {
							console.log("Error while adding the subscriber:"+error);
						} else {
							console.log('Subscribing to stream='+stream.streamId+'.Video resolution:'+event.stream.videoDimensions.width +'x' + event.stream.videoDimensions.height);
						}
					});
					//console.log("Subscriber added:");
					//subscriber.setAudioLevel(0);
				},
				'streamDestroyed',function(event){
					console.log("Session Stream Destoryed Event: Stream="+event.stream.name+" destroyed. Reason="+event.reason);
				}		
	);

	session.on({
		connectionCreated: function (event) {
			connectionCount++;
			//As soon as clients call session.connect this is called
			//connection id from connection object
			console.log('Session Connection Created Event: '+connectionCount + ' connections. Connection Id'+event.connection);
		},
		connectionDestroyed: function (event) {
			connectionCount--;
			console.log('Session Connection Destroyed event: '+connectionCount + ' connections.');
		},
		sessionDisconnected: function sessionDisconnectHandler(event) {
			// The event is defined by the SessionDisconnectEvent class
			console.log('Session Disconnected Event: ', event.reason);
			document.getElementById('disconnectBtn').style.display = 'none';
			if (event.reason == 'networkDisconnected') {
				alert('Your network connection terminated.')
			}
		},
		streamDestroyed: function(event){
			console.log("Session Stream Destoryed Event1: Stream="+event.stream.streamId);
		}
	});
}

function publish(){
			publisherProperties={resolution: '640x480'}; //,insertMode: 'append',width: '100%',height: '100%'
			publisher = OT.initPublisher('publisherContainer', publisherProperties , function (error){
							if (error) {
								console.log("initPublisher error: The client cannot publish!: "+error.message)
							} else {
								console.log('initPublisher method: Publisher initialized.');
								session.publish(publisher, function(error) {
									if (error) {
										console.log("Publish method error:"+error.message);
									} else {
										console.log('Publish method: Publishing a stream.');
									}
								});
							}
						}
			);
			//The Publish object dispatches a streamCreated event when it starts streaming to the session:
			//The Publisher object dispatches a streamDestroyed event when it stops streaming to the session: These reasons include "clientDisconnected", "forceDisconnected", "forceUnpublished", or "networkDisconnected"
			publisher.on({
					accessAllowed: function (event) {
						console.log("accessAllowed: The user has granted access to the camera and mic.");
					},
					accessDenied: function (event) {
						//event.preventDefault();
						console.log("accessDenied: The user has denied access to the camera and mic.");
					},
					streamCreated: function (event) {
						console.log('Publisher streamCreated: The publisher started streaming. Resolution='+event.stream.videoDimensions.width +'x' + event.stream.videoDimensions.height+' Stream Id='+event.stream.streamId);
					},
					streamDestroyed: function (event) {
						if (event.reason === 'mediaStopped') {
							console.log("Publisher streamDestroyed: The publisher stopped streaming. Reason: "+ event.reason);
						} else if (event.reason === 'forceUnpublished') {
							console.log("Publisher streamDestroyed: The publisher stopped streaming. Reason: "+ event.reason);
						} else {
							console.log("Publisher streamDestroyed: The publisher stopped streaming. Reason: "+ event.reason);
						}
					},
					mediaStopped: function (event){
						
					}
			
		});
		//} else {
			//console.log('There was an error connecting to the session: ', error.code, error.message);
}
function unSubscribe(){
	console.log("Unsubcribing from session for stream Id:"+stream.streamId);
	session.unsubscribe(subscriber);
}
function disconnectFromSession() {
  session.disconnect();
}

function takePicture(){
	console.log("Take Picture function called");
	var imgData = publisher.getImgData();
	var img = document.createElement("img");
	img.setAttribute("src", "data:image/png;base64," + imgData);

	// Replace with the parent DIV for the img
	document.getElementById("subscriberContainer").appendChild(img);
}
