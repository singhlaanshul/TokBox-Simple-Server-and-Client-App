var OpenTok = require('opentok')
var express= require('express')
var fs = require('fs')
var qs = require('querystring')
var url=require('url')
var ejs=require('ejs')
var newSessionCreated=false;
var sessionId; 
var apiKey='45631912';

opentok = new OpenTok(apiKey, 'ab40bd3c873ac61a56b82cb3d309d1023f5968ee');
app=express();
app.use(express.static(__dirname + '/views/public'));

//Starting the server
var server=app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("TokBox Server listening at http://%s:%s", host, port)

});

//Returning client.html on simple launch of localhost:8081
app.get('/', function(req, res) {
	console.log("\nLaunching client.html");
    
	res.sendFile( __dirname + "/" + "views/public/client.html" );	
});

//On Submitting the form, sessionId and Token are returned.
app.get('/getSession', function (req, res) {
	if(req.method=='GET'){
		//console.log("Request data: ."+req.params.name);
				
		if(!sessionId){
			console.log('\nSession not created for the user');
			
			createNewSession(function(){
				
				//res.writeHead(200, {'Content-Type': 'text/html'});
				res.send({"sessionId":sessionId});
				res.end();
				//fs.createReadStream('LoggedIn.html').pipe(res);
			}
			);
		}
		else{
			//res.writeHead(200, {'Content-Type': 'text/html'});
			res.send({"sessionId":sessionId});
			res.end();
		}	
	}
	else
		console.log("POST METHOD YET TO BE IMPLEMENTED")
})

function createNewSession(callback){
	 opentok.createSession({mediaMode:'routed', archiveMode:'always'},function(error,session){
				if(error){
					console.log("Error creating session",error);
					process.exit(1);
				}
				else{
					sessionId=session.sessionId;
		            console.log("\nReceived session id="+sessionId);
					callback();
				}
			});
}

//Generating Token
app.get('/getToken', function (req, res) {
	if(req.method=='GET'){
		console.log('\nGenerating Token on sessionId='+sessionId);
		//Generating the Token for user
		tokenId=opentok.generateToken(sessionId);  //or session.generateToken();
		console.log("Token Generated:"+tokenId);
		res.send({"tokenId":tokenId});
		res.end();		
	}
	else
		console.log("POST METHOD YET TO BE IMPLEMENTED")
})
