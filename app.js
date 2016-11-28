/**
 * Module dependencies.
 */

var express = require('express')
  //, routes = require('./routes')
  //, user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require("fs");

var dbhelper = require('./dbhelper');
var employees = require('./db_employees');
var users = require('./db_users');
var devices = require('./db_devices');
var responseSetter = require('./responses');
var firebase = require('./FireBase');

var app = express();

console.log(process.env.POPPY_DEVELOPER_NAME);

// all environments
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('ip', process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');



//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
  console.log('Express server listening on port ' + app.get('port')+","+app.get('ip'));
});

function renderHtmlfile(fileLocation){	
	return function(request, response){
	response.writeHead(200, {
		"Content-Type" : "text/html"
	});
	var body = fs.createReadStream(fileLocation);
	body.pipe(response);
	};	
}

app.post("/loginUser", function(request, response){
	
	try{
	var userAccountModel = dbhelper.getUserAccountModel();
	
	var username = request.body.username;
	var password = request.body.password;
	
	users.verifyCredentials(userAccountModel, username, password, function(error, document){
		
	   if(document){		   
		   responseSetter.success(response, document);		   
	   }else{
		   responseSetter.badrequest(response, error);
	   }	
	});
	
	}catch(error){
		responseSetter.badrequest(response, error);
	}
	
});

app.get("/fetchAllDevices", function(request, response){
	
	try{		
		var deviceModel = dbhelper.getDevicesModel();
		devices.fetchAllDevices(deviceModel, response);
		
	}catch(error){
		responseSetter.badrequest(response, error);
	}
	
});

app.get("/fetchUserDetails/:empId", function(request, response){
	
	try{
		
		var empId = request.params.empId;
		console.log("empId: "+empId);
		
		if(empId){
			
			var empModel = dbhelper.getUserAccountModel();
			users.findUserByEid(empModel, empId, response);			
			
		}else{
			throw new Error("Invalid Url");
		}		
		
	}catch(error){
		responseSetter.badRequest(response, error);
	}
	
	
});

app.post("/upsertDevice", function(request, response){
	
	try{
		
		var devicesModel = dbhelper.getDevicesModel();
		console.log("WHO IS THE USER"+request.body.device_addedBy);
        var deviceId = request.body.device_deviceId;		
		console.log(deviceId);
		
		if(deviceId){			
		var deviceInstance = dbhelper.getDevicesInstance(request.body, true);		
		devices.upsertDevice(deviceId, devicesModel,request.body,deviceInstance, function(error, document){
			console.log("DOCUMENT: "+document);
			if(document){
				responseSetter.success(response, document);				
			}else{
				responseSetter.badRequest(response, error);	
			}
		});
		}else{
			throw new Error("Invalid Request. Insufficient Body Parameters");
		}
		
	}catch(error){
		console.log(error);
		responseSetter.badrequest(response, error);
	}
	
});



app.post("/registerUser", function(request, response){
	
	try {

		var empIdRoleModel = dbhelper.getEmpIdRolesModel();
		var employeeId = request.body.employeeId;
		
		console.log(employeeId);
		
		if(employeeId && empIdRoleModel){		
		employees.findEid(empIdRoleModel, employeeId, function(error, document) {
					if (error) {
						responseSetter.badrequest(response, error);
					} else if(document){
						request.body.userRole= document.emp_role;
						var userAccount = dbhelper.getUserAccountInstance(
								request.body, true);
						users.insertUserAccount(userAccount,
								null,function(error, document){
							
							if(document){
								responseSetter.success(response, document);
							}else{
								responseSetter.internalServerError(response, error);
							}							
						});
					}else{
						responseSetter.unexpectedUser(response);
					}
				});
		}else{
			throw new Error("Invalid Arguments");
		}

	} catch (error) {
		responseSetter.badrequest(response, error);
	}	
});


app.post("/submitDevice", function(request, response){
	
	try{
		
		var devicesModel = dbhelper.getDevicesModel();		
		var reqId = request.body.reqDeviceId;
		var match  = (reqId)? {device_deviceId : reqId} : {_id : request.body.id};
		
		console.log("requested Id: "+JSON.stringify(match));
		
		if(match){
		devices.updateDevice(match, devicesModel,request.body,function(error, document){
			console.log("DOCUMENT: "+document);		
			if(document){				
				var newUserEid = document.device_user.currentUser;
				var fcmToken = document.device_fcmToken;
				firebase.acknowledgeSubmit(newUserEid,"User", function(boolError,boolSuccess) {
					
					if(boolSuccess){
						responseSetter.success(response, document);
					}else{
						responseSetter.badrequest(response, error);
					}		
					
				}, fcmToken);
								
			}else{
				responseSetter.badrequest(response, new Error("Failed To Notify Device"));	
			}
		});
		}else{
			throw new Error("Invalid Request. Insufficient Body Parameters");
		}
		
	}catch(error){
		responseSetter.badrequest(response, error);
	}
	
});

app.get("/fetchDeviceDetails/:deviceId", function(request, response){
	
	try{
		
		var deviceId = request.params.deviceId;
		console.log("deviceId: "+deviceId);
		
		if(deviceId){
			
			var model = dbhelper.getDevicesModel();
			devices.findDeviceById(model, deviceId, response);
			
		}else{
			throw new Error("Invalid Url");
		}		
		
	}catch(error){
		responseSetter.badRequest(response, error);
	}	
});

app.get("/isOnline/:deviceId", function(request, response){
	
	try{
		
		var devicesModel = dbhelper.getDevicesModel();
		var deviceId = request.params.deviceId;
		
		
		
		devices.queryDevices({_id: deviceId},"device_detection", devicesModel, function(error, document){
			
			
			
			if(document){
				
				var lastTime = document.device_detection.timeStamp;
				var isDeviceBusy = document.device_detection.busy;
				var currentTime = Date.now();
				
				var result  = {
						_id: deviceId,
						isOnline : (currentTime - lastTime)< 60000,
						isBusy: isDeviceBusy
				};
				responseSetter.success(response, result);				
				
			}else{
				responseSetter.badrequest(response, error);	
			}
			
			
		});		
	}catch(error){
		console.log(error);
		responseSetter.badrequest(response, error);
	}
	
});

app.post("/deviceStatus", function(request, response){
	
	try{
		
		var devicesModel = dbhelper.getDevicesModel();
		var status = request.body.isBusy;
		var deviceId = request.body.device_deviceId;
		
		
		devices.updateDevice({ device_deviceId : deviceId}, devicesModel, request.body, function(error, deviceDetails){		
			
			if(deviceDetails){
				responseSetter.success(response, deviceDetails);
			}else{
				responseSetter.badrequest(response, error);
			}			
		});		
	}catch(error){
		console.log(error);
		responseSetter.badRequest(response, error);
	}
	
	
});

app.post("/ackReceipt", function(request, response){
	
	try{
		var devicesModel = dbhelper.getDevicesModel();		
		var reqId = request.body.reqDeviceId;
		var match  = (reqId)? {device_deviceId : reqId} : {_id : request.body.id};
		
		console.log("requested Id: "+JSON.stringify(match));
		
		
		devices.updateDevice(match,devicesModel,request.body, function(error, document) {
			
			if(document){
				responseSetter.success(response, document);
			}else{
				responseSetter.badrequest(response, error);	
			}
			
		});
		
	}catch(error){
		responseSetter.badrequest(response, error);	
	}
	
});

app.post("/requestAcknowledgement", function(request, response){
	
try{
		
		var devicesModel = dbhelper.getDevicesModel();
		var usersModel = dbhelper.getUserAccountModel();
		var deviceId = request.body.requested_deviceId;
		var receiverEid = request.body.deviceReceiverEid;
		
		
		users.fetchAccountDetails(receiverEid, usersModel, function(error, document){
					
             var requesterName;
             
             if(document){
            	 requesterName = document.user_firstname+" "+document.user_lastname;
             }
			
			devices.findDeviceById(devicesModel, deviceId, null, function(error, deviceDetails){
				
				if(deviceDetails){
					
					var fcmToken = deviceDetails.device_fcmToken;
					firebase.acknowledgeSubmit(receiverEid, requesterName, function(errorBool,successBool) {					
						if(successBool){
							devices.updateDevice({ _id : deviceId },devicesModel,request.body,function(error, document){
								if(document){
									responseSetter.success(response, document);
								}else{
									responseSetter.badrequest(response, error);
								}	
							});
						}else{
							responseSetter.badrequest(response, new Error("Failed To Notify device"));
						}				
					}, fcmToken);
					
				}else{
					responseSetter.badrequest(response, error);
				}		
				
			} );	
		}, "user_firstname user_lastname");
		
	
	}catch(error){
		responseSetter.badrequest(response, error);	
	}	
	
});

app.post("/requestDevice", function(request, response){
	
	try{
		
		var devicesModel = dbhelper.getDevicesModel();
		var usersModel = dbhelper.getUserAccountModel();
		var deviceId = request.body.requested_deviceId;
		var requesterId = request.body.device_requester;
		
		
		users.fetchAccountDetails(requesterId, usersModel, function(error, document){
					
             var requesterName;
             
             if(document){
            	 requesterName = document.user_firstname+" "+document.user_lastname;
             }
			
			devices.findDeviceById(devicesModel, deviceId, null, function(error, deviceDetails){
				
				if(deviceDetails){
					
					var fcmToken = deviceDetails.device_fcmToken;
					firebase.requestDevice(requesterId, requesterName, function(errorBool,successBool) {					
						if(successBool){
							devices.updateDevice({ _id : deviceId },devicesModel,request.body,function(error, document){
								if(document){
									responseSetter.success(response, document);
								}else{
									responseSetter.badrequest(response, error);
								}	
							});
						}else{
							responseSetter.badrequest(response, new Error("Failed To Notify device"));
						}				
					}, fcmToken);
					
				}else{
					responseSetter.badrequest(response, error);
				}		
				
			} );	
		}, "user_firstname user_lastname");
		
	
	}catch(error){
		responseSetter.badrequest(response, error);	
	}	
});

app.get("/login",renderHtmlfile("./views/login.html"));
app.get("/selectNextUser",renderHtmlfile("./views/nextuser.html"));
app.get("/quotes",renderHtmlfile("./views/quotes.html"));
app.get("/register",renderHtmlfile("./views/register.html"));
app.get("/",renderHtmlfile("./views/poppy.html"));
//app.get("/devices", renderHtmlfile("./views/devices.html"));
app.get("/devices", renderHtmlfile("./views/devicesmgmt.html"));
app.get("/httprequests.js", renderHtmlfile("./views/httprequests.js"));
app.get("/rendertable.js", renderHtmlfile("./views/rendertable.js"));
app.get("/modals.js", renderHtmlfile("./views/modals.js"));
app.get("/css/bootstrap.min.css", renderHtmlfile("./views/css/bootstrap.min.css"));
app.get("/js/bootstrap.min.js", renderHtmlfile("./views/js/bootstrap.min.js"));
app.get("/online.jpg", renderHtmlfile("./views/online.jpg"));
app.get("/state_online.png", renderHtmlfile("./views/state_online.png"));
app.get("/state_offline.png", renderHtmlfile("./views/state_offline.png"));
app.get("/state_busy.png", renderHtmlfile("./views/state_busy.png"));

module.exports = app ;
