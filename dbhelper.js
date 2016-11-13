/** loading modules */
var mongoose = require("mongoose");
var models = require("./db_models");
var fs = require("fs");

/** Models: User Accounts */
var UserAccounts;
var EmployeeIdRoles;
var Devices;

var databaseName = "poppymfsi";

var mongoDb_connection = (process.env.OPENSHIFT_MONGODB_DB_URL)||("mongodb://localhost/"); 

var mongodb_conn_string = mongoDb_connection+databaseName;

mongoose.connect(mongodb_conn_string);

var db = mongoose.connection;
db.on("error", function() {
	console.log("ERROR OPENING CONNECTION");
});

function initializeDb(collection,initializingData,callback) {

	var data = JSON.parse(initializingData);
	
	collection.insertMany(data, {
		ordered : false
	}, function(error, rows) {
		if (error) {
			console.log("INITIALIZATION FAILED: " + error+","+rows);			
		} else {
			console.log("INITIALIZATION OF " + rows.insertedCount+ " ROWS SUCCEDED");
		}
		if(rows){
			callback();
		}
	});

}

db.on("open", function() {
	console.log("CONNECTION OPEN");
	
	UserAccounts = models.getUserAccountsModel(mongoose);
	EmployeeIdRoles = models.getEmployeeIdRolesModel(mongoose);
	Devices = models.getDevicesModel(mongoose);
	
	fs.readFile("./employeeIds.json", function(err, data) {
		if (err || !data) {
			console.log("File READ FAILED " + err);
		} else {
			initializeDb(EmployeeIdRoles.collection, data, function(){
				fs.readFile("./rootuser.json", function(err,data){
					initializeDb(UserAccounts.collection,data,function(){
						console.log("Finished");
					});
					
				});
			});
		}
	});
});

exports.getUserAccountInstance = function(requestBody, checkForNull) {
	var userAccount;
	if (UserAccounts) {
		userAccount = models.getUserAccountsInstance(UserAccounts, requestBody,
				checkForNull);
	}
	return userAccount;
};

exports.getUserAccountModel = function() {
	if (!UserAccounts) {
		UserAccounts = models.getUserAccountsModel(mongoose);
	}
	return UserAccounts;
};

exports.getEmpIdRolesModel = function() {
	if (!EmployeeIdRoles) {
		EmployeeIdRoles = models.getEmployeeIdRolesModel(mongoose);
	}
	return EmployeeIdRoles;
};

exports.getDevicesInstance = function(requestBody, checkForNull) {
	var deviceEntry;
	if (Devices) {
		deviceEntry = models.getDevicesInstance(Devices, requestBody, checkForNull);
	}
	return deviceEntry;
};


exports.getDevicesModel = function(){
	if(!Devices){
		Devices = models.getDevicesModel(mongoose);
	}
	return Devices;
};