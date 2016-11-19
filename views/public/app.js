var apiKey='45631912';
var connectionCount=0;
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
			//Object doesn't support property or method 'connect'
		}else{
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
						console.log("Publisher streamDestroyed: The publisher stopped streaming. Reason: "+ event.reason);
					}
			
		});
		//} else {
			//console.log('There was an error connecting to the session: ', error.code, error.message);
		}
	});
  
	// Subscribe to a newly created stream
	session.on('streamCreated', function(event) {
					console.log("Session Stream Created Event: Subscribing Stream Id= " + event.stream.streamId);
					
					subscriberProperties={insertMode: 'append',width: '100%',height: '100%'};
					
					var subscriber= session.subscribe(event.stream, 'subscriberContainer',null, function(error){
						if (error) {
							console.log("Error while adding the subscriber:"+error);
						} else {
							console.log('Subscriber added.Now width of video resolution:'+event.stream.videoDimensions.width +'x' + event.stream.videoDimensions.height);
						}
					});
					//console.log("Subscriber added:");
				},
				'streamDestroyed',function(event){
					console.log("Session Stream Destoryed Event: Stream="+event.stream.name+" destroyed. Reason="+event.reason);
				}		
	);

	session.on({
		connectionCreated: function (event) {
			connectionCount++;
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
		}
	});
}

function disconnect() {
  session.disconnect();
}

// Detect whether this browser is IE
function isIE () {
  var userAgent = window.navigator.userAgent.toLowerCase(),
      appName = window.navigator.appName;
 
  var result= ( appName === 'Microsoft Internet Explorer' ||                     		// IE <= 10
           (appName === 'Netscape' && userAgent.indexOf('trident') > -1) );     // IE >= 11
		   
	console.log("The browser is IE:"+result);

	var isInstalled = false;
	var version = null;
	var ieplugin=window.navigator.plugins;
	console.log("IE plugins:"+ieplugin);
	//if (window.ActiveXObject) {
		var control = null;
		try {
			control = new ActiveXObject('Installer for OpenTok Plugin');
			console.log("Tokbox Plugin exists");
			if (control) {
				isInstalled = true;
				version = parseFloat(control.versionInfo);
				console.log("Tokbox Plugin version:"+control.versionInfo);
			}
		} catch (e) {
			console.log("Tokbox Plugin error exists:"+e);
			return;
		}
	
}

function takePicture(){
	console.log("Take Picture function called");
	var imgData = publisher.getImgData();
	var img = document.createElement("img");
	img.setAttribute("src", "data:image/png;base64," + imgData);

	// Replace with the parent DIV for the img
	document.getElementById("subscriberContainer").appendChild(img);
}

function initializeScreenSharingSession(){
	var sessionId=document.getElementById("sessionId").innerHTML;
	var tokenId=document.getElementById("tokenId").innerHTML;
	console.log("Session Id:"+sessionId);
	console.log("Token id:"+tokenId);
	
	var session = OT.initSession(apiKey, sessionId);

    session.connect(tokenId, function(error) {
      if (error) {
        alert('Error connecting to session: ' + error.message);
        return;
      }
      // publish a stream using the camera and microphone:
      var publisher = OT.initPublisher('camera-publisher');
      session.publish(publisher);
      document.getElementById('shareBtn').disabled = false;
    });

    session.on('streamCreated', function(event) {
      if (event.stream.videoType === 'screen') {
        // This is a screen-sharing stream published by another client
        var subOptions = {
          width: event.stream.videoDimensions.width / 2,
          height: event.stream.videoDimensions.height / 2
        };
        session.subscribe(event.stream, 'screen-subscriber', subOptions);
      } else {
        // This is a stream published by another client using the camera and microphone
        session.subscribe(event.stream, 'camera-subscriber');
      }
    });
}