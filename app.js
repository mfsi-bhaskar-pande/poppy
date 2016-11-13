
/**
 * Module dependencies.
 */

var express = require('express')
  //, routes = require('./routes')
  //, user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require("fs");

//var dbhelper = require('./dbhelper');

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

//app.get("/login",renderHtmlfile("./views/login.html"));
//app.get("/register",renderHtmlfile("./views/register.html"));
app.get("/",renderHtmlfile("./views/poppy.html"));
app.get("/quotes",renderHtmlfile("./views/quotes.html"));

module.exports = app ;
