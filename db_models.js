
function anyUndefined(model){	
	for ( var property in model) {
		
		console.log(property+":"+model[property]);
		
		if(!model[property]){
			return true;
		}
	}
	
}

/*function splitByComma(value){
	var array = null;
	if(value){
		return value.split(",");
	}
	return array;
}*/

/**
 * Returns Schema For User Accounts
 */
exports.getUserAccountsModel = function(mongooseInstance){
	
	var userAccountModel = null;	
	if(mongooseInstance){		
		var userAccountSchema = mongooseInstance.Schema({
			
			user_firstname: String,
			user_lastname: String,
			user_eid: {type: String, index: {unique: true}},
			user_role: [String],
			user_emailId: {type: String, index: {unique: true}},
			user_primaryPhoneNumber: {type: String, index: {unique: true}},
			user_password: String
			
		});		
		userAccountModel = mongooseInstance.model("UserAccounts", userAccountSchema);
	}
	return userAccountModel;	
	
}; 


exports.getDevicesModel = function(mongooseInstance){
	
	var deviceModel = null;	
	if(mongooseInstance){		
		var deviceModelSchema = mongooseInstance.Schema({
			
			device_name: String,
			device_os: String,
			device_osversion: String,
			device_model: String,
			device_addedBy: String,
			device_isBusy: Boolean,
			device_user: String,
			device_fcmToken: {type: String, index: {unique: true}},
			device_deviceId: {type: String, index: {unique: true}},
			device_requester: [String]
			
		});		
		deviceModel = mongooseInstance.model("Devices", deviceModelSchema);
	}
	return deviceModel;	
	
}; 

/**
 * Returns Schema For EmployeeId-Roles
 */
exports.getEmployeeIdRolesModel = function(mongooseInstance){
	
	var employeeIdRolesModel = null;	
	if(mongooseInstance){		
		var employeeIdRolesSchema = mongooseInstance.Schema({
			emp_Id: {type: String, index: {unique: true}},
			emp_role: [String]	
		});		
		employeeIdRolesModel = mongooseInstance.model("EmployeeIdRoles", employeeIdRolesSchema);
	}
	return employeeIdRolesModel;	
	
}; 

/** Returns UserAccounts Instance from the response-body */
exports.getDevicesInstance = function(DeviceModel, requestBody, checkForNull){
	
	var model = {
		     device_name: requestBody.device_name,
		     device_os: requestBody.device_os,
		     device_osversion: requestBody.device_osversion,
		     device_model: requestBody.device_model,
		     device_addedBy: requestBody.device_addedBy,
		     device_fcmToken: requestBody.device_fcmToken,
		     device_deviceId: requestBody.device_deviceId,
		     device_user: requestBody.device_user
		};
	
    if(!model.device_user){
		model.device_user = model.device_addedBy;
		model.device_isBusy = model.device_user === "0000-00000"?false:true;
	}
    
    if(!model.device_requester){
    	model.device_requester = [];
    }
    
    if(!model.device_fcmToken){
    	model.device_fcmToken = "NA";
    }		
	
	if(checkForNull && anyUndefined(model)){
		throw Error("Invalid Request: Body Parameters insufficient");
	}
	
	return new DeviceModel(model);	
	
}; 

/** Returns UserAccounts Instance from the response-body */
exports.getUserAccountsInstance = function(UserModel, requestBody, checkForNull){
	
	var model = {
		     user_firstname: requestBody.firstName,
		     user_lastname: requestBody.lastName,
		     user_eid: requestBody.employeeId,
		     user_role: requestBody.userRole,
		     user_emailId: requestBody.emailId,
		     user_primaryPhoneNumber: requestBody.phoneNo,
		     user_password: requestBody.password
		};
	
	if(checkForNull && anyUndefined(model)){
		throw Error("Invalid Request: Body Parameters insufficient");
	}
	
	return new UserModel(model);	
	
}; 


