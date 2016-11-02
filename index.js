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

myParser = require("body-parser");
app=express();
app.use(myParser.json({extended : true}));
app.use(express.static(__dirname + '/views/public'));

//Starting the server
var server=app.listen(process.env.PORT || 5000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("TokBox Server listening at http://%s:%s", host, port)

});

//Returning client.html on simple launch of localhost:8081
app.get('/', function(req, res) {
	console.log("\nLaunching client.html");
    
	res.sendFile( __dirname + "/" + "views/public/client.html" );	
});
//just replace client.html with screensharingtest.html in case of testing the screensharingtest

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
app.post('/testme', function(req,res){
	console.log("Satnam Waheguru");
	res.end();
}
)
app.post('/archiveNotification',function(req, res){
	var jsonbody=req.body;
	console.log("With request", jsonbody);
	
	if(jsonbody==null){
		console.log("Archive Notification: No JSON received. Error!");		
	}
	else{
		console.log("Archive Notification: "+ jsonbody.status +" Archive Id:"+jsonbody.id);
	}
	
	res.end();
	
})

app.post('/StreamConnectionEvents',function(req, res){
	console.log("Stream Connection event is created");
	res.end();
		
})
app.get('/getarchives',function(req, res){
	if(req.method =="GET"){
		console.log("\nRetrieving the Archive List...");
		opentok.listArchives( function(error, archives, totalCount) {
			if (error) 
				return console.log("Got error while retrieving the list of archives:", error);

			console.log("Total Count ="+totalCount + " archives");
			console.log("Size of Archives="+archives.length);
			console.log("Archives JSON="+archives);
			
			for (var i = 0; i < archives.length; i++) {
				console.log("Archive Id="+archives[i].id+"   Archive name="+archives[i].name);
				
				opentok.getArchive(archives[i].id, function(err, archive) {
					if (err) return console.log(err);

					console.log(archive);
				});
			}
		});
		
		res.end();		
	}
	else
		console.log("You should use Get method for retrieving the archives");
})