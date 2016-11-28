function fetchDeviceDetails(callback) {

	var request = new XMLHttpRequest();
	request.open("GET", "/fetchAllDevices", true);

	request.addEventListener("load", function() {

		
		if (request.response) {
			console.log(request.responseText);
			var devices = JSON.parse(request.responseText);
			if (devices.result) {
				var deviceEntries = JSON.parse(devices.result);
				callback(deviceEntries);
			} else {
				callback(null);
			}
		} else {
			callback(null);
		}

	});
	request.send(null);
}

function fetchOnlineStatus(deviceId, callback) {

	return function() {
		var request = new XMLHttpRequest();
		request.open("GET", "/isOnline/"+deviceId, true);
		request.addEventListener("load", function() {

			if (request.response) {
				var responseObj = JSON.parse(request.responseText);
				console.log(responseObj);
				if (responseObj.result) {
					var onlineStatus = JSON.parse(responseObj.result);
					callback(onlineStatus);
				} else {
					callback(null);
				}
			} else {
				callback(null);
			}

		});
		request.send(null);
	}
}

function submitDevice(requestedDeviceId, userChosen, callback) {

	return function() {
		var request = new XMLHttpRequest();
		request.open("POST", "/submitDevice", true);
		request.setRequestHeader("Content-type", "application/json");
		request.addEventListener("load", function() {
			if (request.status === 200) {
				var device = JSON.parse(request.responseText);
				var deviceEntry = JSON.parse(device.result)
				callback(deviceEntry);
			} else {
				callback(null);
			}
		});

		console.log(userChosen+","+requestedDeviceId);

		var statusIsBusy = (userChosen === "0000-00000") ? false : true;

		if (userChosen) {
			var object = JSON.stringify({
				id : requestedDeviceId,
				targetUser : userChosen,
				device_isBusy : statusIsBusy
			});
			request.send(object);
		} else {
			callback(null);
		}
	};

}

function requestAcknowledgement(deviceId, deviceReceiver, callback){
	
	return function(){
		
		var request = new XMLHttpRequest();
		request.open("POST", "/requestAcknowledgement", true);
		request.setRequestHeader("Content-type", "application/json");
		request.addEventListener("load", function() {

			if (request.status === 200) {
				var deviceDetails = JSON.parse(request.response);
				deviceDetails = JSON.parse(deviceDetails.result);
				callback(deviceDetails);
			} else {
				callback(null);
			}
		});
		var object = JSON.stringify({
			requested_deviceId : deviceId,
			deviceReceiverEid : deviceReceiver 
		});
		request.send(object);
		
	};
	
}

function acknowledgeReceipt(deviceId, deviceReceiver, callback){
	
	return function(){
		
		var request = new XMLHttpRequest();
		request.open("POST", "/ackReceipt", true);
		request.setRequestHeader("Content-type", "application/json");
		request.addEventListener("load", function() {

			if (request.status === 200) {
				var deviceDetails = JSON.parse(request.response);
				deviceDetails = JSON.parse(deviceDetails.result);
				callback(deviceDetails);
			} else {
				callback(null);
			}
		});
		var object = JSON.stringify({
			id : deviceId,
			targetUser : deviceReceiver 
		});
		request.send(object);
		
	};
	
}

function requestDevice(deviceId, loggedUserEid, callback) {

	return function() {
		var request = new XMLHttpRequest();
		request.open("POST", "/requestDevice", true);
		request.setRequestHeader("Content-type", "application/json");
		request.addEventListener("load", function() {

			if (request.status === 200) {
				var deviceDetails = JSON.parse(request.response);
				deviceDetails = JSON.parse(deviceDetails.result);
				callback(deviceDetails);
			} else {
				callback(null);
			}
		});
		var object = JSON.stringify({
			requested_deviceId : deviceId,
			device_requester : loggedUserEid
		});
		request.send(object);
	};
}

function fetchEmpDetails(empId, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", "/fetchUserDetails/" + empId, true);

	request.addEventListener("load", function() {

		if (request.status == 200) {
			var empDetails = JSON.parse(request.response);
			empDetails = JSON.parse(empDetails.result);
			if (empDetails) {
				callback(empDetails)
			} else {
				callback(null);
			}
		} else {
			callback(null);
		}
	});
	request.send(null);
}
