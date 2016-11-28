var ServerKey = process.env.POPPY_SERVER_KEY;
var SenderId = process.env.POPPY_SERVER_ID;
var DeviceRequest = 1;
var DeviceSubmitted = 2;
var DeviceReceived = 3;

var http = require("http");

exports.acknowledgeSubmit = function(receiverId, receiverName, callback,
		fcmToken) {

	var req = http.request({
		hostname : "fcm.googleapis.com",
		path : "/fcm/send",
		method : "POST",
		headers : {
			"Content-Type" : "application/json",
			"Authorization" : ("key=" + ServerKey)
		},
	}, function(response) {
		response.on("data", function(chunk) {

			console.log(chunk.toString());
			var fcmResponse = JSON.parse(chunk.toString());
			var error = (fcmResponse.failure !== 0);
			var success = (fcmResponse.success > 0);
			callback(error, success);
		});
	});

//	var sendPayload = JSON.stringify({
//		
//		notifId : receiverId,
//		purpose : DeviceReceived,
//		targetUser : receiverId
//
//	});

	var obj = JSON.stringify({
		to : fcmToken,
		notification : {
			title : "poppy",
			body : "hello! " + receiverName + " acknowledge receipt of device",
			icon : "myicon"
		},
		data : {
			notifId : receiverId,
			purpose : DeviceSubmitted,
			targetUser : receiverId

		}	   
	});
	req.end(obj);

};

exports.requestDevice = function(requesterId, requesterName, callback, fcmToken) {

	var req = http.request({
		hostname : "fcm.googleapis.com",
		path : "/fcm/send",
		method : "POST",
		headers : {
			"Content-Type" : "application/json",
			"Authorization" : ("key=" + ServerKey)
		},
	}, function(response) {
		response.on("data", function(chunk) {

			console.log(chunk.toString());
			var fcmResponse = JSON.parse(chunk.toString());
			var error = (fcmResponse.failure !== 0);
			var success = (fcmResponse.success > 0);
			callback(error, success);
		});
	});

//	var sendPayload = JSON.stringify({
//		notifId : requesterId,
//		purpose : DeviceRequest,
//		targetUser : requesterId
//
//	});

	var obj = JSON.stringify({
		to : fcmToken,
		notification : {
			title : "poppy",
			body :  "hello! " + requesterName + " (" + requesterId+ ") needs this device",
			icon : "myicon"
		},
		data : {
			notifId : requesterId,
			purpose : DeviceRequest,
			targetUser : requesterId
		}    

	});
	req.end(obj);

};
