var apiKey='45631912';
var connectionCount=0;
function getSession(){
			$.ajax({
				type: 'GET',
				url: '/getSession',
				success: function(resultData) {
					console.log(resultData);
					sessionId=resultData.sessionId;
					document.getElementById("sessionId").innerHTML=resultData.sessionId;
					
					$.ajax({
						type: 'GET',
						url: '/getToken?sessionId='+sessionId,
						success: function(resultData) {
							console.log(resultData);
							tokenId=resultData.tokenId;
							document.getElementById("tokenId").innerHTML=resultData.tokenId;
							//initializeScreenSharingSessionForChrome();
						}
					});
				}
			});
	}
	
	
function disconnect() {
  session.disconnect();
}

function initializeScreenSharingSession(){
	var sessionId=document.getElementById("sessionId").innerHTML;
	var tokenId=document.getElementById("tokenId").innerHTML;
	console.log("Starting Screen sharing on session Id:"+sessionId);
	console.log("Token id:"+tokenId);
	
	session = OT.initSession(apiKey, sessionId);
	if(session==null){
	  console.log("Not able to create session object. You may exit");	  
	}	
    session.connect(tokenId, function(error) {
      if (error) {
        alert('Error connecting to session: ' + error.message);
        return;
      }
      // publish a stream using the camera and microphone:
      //var publisher = OT.initPublisher('camera-publisher');
      //session.publish(publisher);
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

function initializeScreenSharingSessionForChrome(){
	initializeScreenSharingSession();
	// Replace this with the ID for your Chrome screen-sharing extension, which you can
    // get at chrome://extensions/:
	var extensionId = 'lmnimhpghpjpbpeajcfmkkohbailaakp';
	
    // For Google Chrome only, register your extension by ID,
    // You can find it at chrome://extensions once the extension is installed
    OT.registerScreenSharingExtension('chrome', 'lmnimhpghpjpbpeajcfmkkohbailaakp', 2);
	//sabir kbkolbkilbamopfanfcphjnapjinkdii
	//lmnimhpghpjpbpeajcfmkkohbailaakp
}
function screenshare() {
       var ffWhitelistVersion; // = '36';
	   //var session = OT.initSession(apiKey, sessionId);
	  OT.checkScreenSharingCapability(function(response) {
        console.info(response);
        console.log('Response.supported: '+ response.supported);
		console.log('Response.extensionRegistered: '+ response.extensionRegistered);
		console.log('Response.extensionInstalled: '+ response.extensionInstalled);
		console.log('Response.extensionRequired: '+ response.extensionRequired);
		
		if (!response.supported || response.extensionRegistered === false) {
          alert('This browser does not support screen sharing.');
		  
        } else if (response.extensionInstalled === false && (response.extensionRequired || !ffWhitelistVersion)) {
          alert('Please install the screen-sharing extension and load this page over HTTPS.');
        } else if (ffWhitelistVersion && navigator.userAgent.match(/Firefox/)
          && navigator.userAgent.match(/Firefox\/(\d+)/)[1] < ffWhitelistVersion) {
            alert('For screen sharing, please update your version of Firefox to '
              + ffWhitelistVersion + '.');
        } else {
          // Screen sharing is available. Publish the screen.
          // Create an element, but do not display it in the HTML DOM:
          var screenContainerElement = document.createElement('div');
          var screenSharingPublisher = OT.initPublisher( screenContainerElement, { videoSource : 'application' },function(error) {
              if (error) {
                alert('Something went wrong: ' + error.message);
              } else {
                session.publish( screenSharingPublisher, function(error) {
                    if (error) {
                      alert('Something went wrong: ' + error.message);
                    }
                });
              }
            });
			screenSharingPublisher.on({
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
							console.log("Publisher streamDestroyed:mediaStopped");
						} else if (event.reason === 'forceUnpublished') {
							console.log("Publisher streamDestroyed: forceUnpublished");
						} else {
							console.log("Publisher streamDestroyed: The publisher stopped streaming. Reason: "+ event.reason);
						}
					},
					mediaStopped: function (event){
						console.log("Publisher mediaStopped: The publisher stopped screen sharing.");
					}
			
			});
          }
        });
    }
	
