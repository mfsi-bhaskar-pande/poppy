var ServerKey = "AIzaSyAcLG7diJ0_XT25pk_qhfV0BAu9lJoEmeI";
var SenderId = 42247483784;

var http = require("http");


exports.requestDevice = function(requesterId, requesterName, callback, fcmToken){
	
	var req = http.request({	
		hostname: "fcm.googleapis.com",
		path: "/fcm/send",
		method: "POST",
		headers: {
			"Content-Type" : "application/json",
			"Authorization" : ("key="+ServerKey)
		},	
	},function(response){
		response.on("data", function(chunk){
			
			console.log(chunk.toString());			
			var fcmResponse = JSON.parse(chunk.toString());
			var error = (fcmResponse.failure !== 0);
			var success = (fcmResponse.success > 0);			
			callback(error, success);
		});		
	});


	var obj = JSON.stringify({	
		to: fcmToken,
		notification : {
		      title : "DeviceMgmtPortal!",
		      body : "hello! "+requesterName+" ("+requesterId+") needs this device",
		      icon : "myicon"
		    }
	    
	});

	req.end(obj);
	
	
};

