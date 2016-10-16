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
			publisherProperties={resolution: '1280x720'}; //,insertMode: 'append',width: '100%',height: '100%'
			var publisher = OT.initPublisher('publisherContainer', publisherProperties , function (error){
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
						console.log('streamCreated: The publisher started streaming. Resolution='+event.stream.videoDimensions.width +'x' + event.stream.videoDimensions.height);
					},
					streamDestroyed: function (event) {
						console.log("streamDestroyed: The publisher stopped streaming. Reason: "+ event.reason);
					}
			
		});
		//} else {
			//console.log('There was an error connecting to the session: ', error.code, error.message);
		}
	});
  
	// Subscribe to a newly created stream
	session.on('streamCreated', function(event) {
					console.log("Subscribing Stream Id= " + event.stream.streamId);
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
					console.log("Stream="+event.stream.name+" destroyed. Reason="+event.reason);
				}		
	);

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