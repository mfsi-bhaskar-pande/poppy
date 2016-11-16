/** loading modules */
var mongoose = require("mongoose");
var models = require("./db_models");
var fs = require("fs");

/** Models: User Accounts */
var UserAccounts;
var EmployeeIdRoles;
var Devices;

// var mongoDb_connection = process.env.OPENSHIFT_MONGODB_DB_URL ||
// process.env.MONGO_URL||("mongodb://localhost/");
var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
var mongoURLLabel = "";

console.log("MONGO URL: ENV: "+mongoURL);

if (mongoURL === null && process.env.DATABASE_SERVICE_NAME) {
	var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(), 
	mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
	mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
	mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
	mongoPassword = process.env[mongoServiceName + '_PASSWORD'],
	mongoUser = process.env[mongoServiceName + '_USER'];
	
	console.log("MONGO URL: HOST: "+mongoHost);
	console.log("MONGO URL: PORT: "+mongoPort);
	console.log("MONGO URL: DATABASE: "+mongoDatabase);
	console.log("MONGO URL: ENV: "+mongoPassword);
	console.log("MONGO URL: ENV: "+mongoUser);

	if (mongoHost && mongoPort && mongoDatabase) {
		mongoURLLabel = mongoURL = 'mongodb://';
		if (mongoUser && mongoPassword) {
			mongoURL += mongoUser + ':' + mongoPassword + '@';
		}
		// Provide UI label that excludes user id and pw
		mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
		mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;

	}
}

console.log("MONGO URL: LABEL: "+mongoURLLabel)
console.log("MONGO URL: ENV: "+mongoURL);;

if (!mongoURL) {
	mongoURL = "mongodb://localhost/poppymfsi";
}

console.log("CONNECTING TO: "+mongoURL);
mongoose.connect(mongoURL);

var db = mongoose.connection;
db.on("error", function() {
	console.log(mongoURL);
	console.log("ERROR OPENING CONNECTION");
});

function initializeDb(collection, initializingData, callback) {

	var data = JSON.parse(initializingData);

	collection.insertMany(data, {
		ordered : false
	}, function(error, rows) {
		if (error) {
			console.log("INITIALIZATION FAILED: " + error + "," + rows);
		} else {
			console.log("INITIALIZATION OF " + rows.insertedCount
					+ " ROWS SUCCEDED");
		}
		if (rows) {
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
			initializeDb(EmployeeIdRoles.collection, data, function() {
				fs.readFile("./rootuser.json", function(err, data) {
					initializeDb(UserAccounts.collection, data, function() {
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
		deviceEntry = models.getDevicesInstance(Devices, requestBody,
				checkForNull);
	}
	return deviceEntry;
};

exports.getDevicesModel = function() {
	if (!Devices) {
		Devices = models.getDevicesModel(mongoose);
	}
	return Devices;
};