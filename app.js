
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

var app = express();

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

app.get("/login",renderHtmlfile("./views/login.html"));
app.get("/quotes",renderHtmlfile("./views/quotes.html"));
app.get("/register",renderHtmlfile("./views/register.html"));
app.get("/",renderHtmlfile("./views/poppy.html"));
app.get("/devices", renderHtmlfile("./views/devices.html"));

module.exports = app ;
