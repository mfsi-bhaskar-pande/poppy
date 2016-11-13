var responseSetter = require("./responses");

function isValueValid(value) {
	return value !== undefined && ""+value !== "";
}

function searchByMatch(justOne, model, match, response, callback, selection) {

	var searchFunctionName = justOne ? "findOne" : "find";
	model[searchFunctionName](match, selection, function(error, document) {

		if (error) {
			if (response) {
				responseSetter.internalServerError(response, error);
			} else if (callback) {
				callback(error, null);
			}
		} else if (document) {
			if (response) {
				responseSetter.success(response, document);
			} else if (callback) {
				callback(null, document);
			}
		} else {
			
			if (response) {
				responseSetter.success(response,[]);
			} else if (callback) {
				callback(null,null);
			}
		}
	});

}


function updateDocInstance(document, deviceupdate) {
	
	if (isValueValid(deviceupdate.device_fcmToken)) {
		document.device_fcmToken = deviceupdate.device_fcmToken;
	}
	if (isValueValid(deviceupdate.device_name)) {
		document.device_name = deviceupdate.device_name;
	}
	if (isValueValid(deviceupdate.device_os)) {
		document.device_os = deviceupdate.device_os;
	}
	if (isValueValid(deviceupdate.device_osversion)) {
		document.device_osversion = deviceupdate.device_osversion;
	}
	if (isValueValid(deviceupdate.device_model)) {
		document.device_model = deviceupdate.device_model;
	}
	if (isValueValid(deviceupdate.device_addedBy)) {
		document.device_addedBy = deviceupdate.device_addedBy;
	}
	if (isValueValid(deviceupdate.device_isBusy)) {
		document.device_isBusy = deviceupdate.device_isBusy;
	}
	if (isValueValid(deviceupdate.device_requester)) {
		var requesters = document.device_requester;
		if(requesters){
			document.device_requester = requesters.concat(deviceupdate.device_requester);
		}
	}
	console.log("DeviceUser: "+deviceupdate.device_user);
	if (isValueValid(deviceupdate.device_user)) {
		
		if(deviceupdate.device_user === "0000-00000"){
			document.device_isBusy = false;
		}
		
		document.device_user = deviceupdate.device_user;
		var requesters = document.device_requester;
		if(requesters){
			var index = requesters.indexOf(deviceupdate.device_user);
			if(index >=0){				
				requesters.splice(index, 1);
				document.device_requester = requesters;
			} 
		}
	}
}

function saveDocument(device, response, callback) {

	if (device) {
		device.save(function(error, document) {
			
			console.log(""+document);
			
			if (document) {
				if (response) {
					responseSetter.success(response, {
						"id" : document._id
					});
				} else if(callback) {
					callback(null, document);
				}else{
					throw new Error("Illegal Arguments!");
				}
			} else {
				if (callback) {
					callback(error, null);					
				} else {
					responseSetter.internalServerError(response, error);
				}
			}
		});
	} else {
		responseSetter.internalServerError(response);
	}
}

/** Find All Users */
exports.fetchAllDevices = function(model, response) {
	searchByMatch(false, model, {}, response, null);
};

/** Inserts the Device Details passed In as Argument */
exports.insertDevice = function(device, response, callback) {
	saveDocument(device, response, callback);
};

/** Find User By Id */
exports.findDeviceById = function(model,deviceId, response) {
	searchByMatch(true, model, {
		_id : deviceId
	}, response, null);
};

exports.deviceRecordsVersioning = function(model,callback){
	
	searchByMatch(false, model,{},null,callback,"__v");
	
};

exports.updateDevice = function(deviceId, model, deviceUpdate, callback){
	
	function onDocumentFetched(error, document) {
		if (!error && deviceUpdate && document) {
			updateDocInstance(document, deviceUpdate);
			saveDocument(document, null, callback);
		} else {
			if (!document && !error) {
				error = new Error("This Device Does Not Exist");
				callback(error);
			} else {
				callback(error);
			}
		}
	}
	searchByMatch(true, model, {
        _id : deviceId
	}, null, onDocumentFetched);

	
};

exports.upsertDevice = function(deviceId, model, deviceUpdate, deviceInstance, callback){
	
	
	
	function onDocumentFetched(error, document) {
		if (!error && deviceUpdate && document) {
			
			updateDocInstance(document, deviceUpdate);
			saveDocument(document, null, callback);
		} else {
			console.log(document);
			console.log(error);
			if (!document && (!error || error.message === "No Device Present")) {				
				saveDocument(deviceInstance, null, callback);				
			} else {
				callback(error);
			}
		}
	}
	searchByMatch(true, model, {
        device_deviceId : deviceId
	}, null, onDocumentFetched);

	
};

