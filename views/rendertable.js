var table;

function createTable(data, loggedInUserEid) {

	table = document.createElement("table");
	var header = createHeader([ "", "MODEL", "OS", "VERSION", "STATUS", "with",
			"REQUESTER", "" ]);
	table.appendChild(header);

	data.forEach(function(element) {
				var status = element.device_isBusy ? "BUSY" : "FREE";
				var row = document.createElement("tr");
				
				populateRow(row, [ null, element.device_model,
						element.device_os, element.device_osversion, status,
						element.device_user, element.device_requester, null ],
						loggedInUserEid, element._id);
				table.appendChild(row);
			});

	return table;

}

function createHeader(headerColNames) {

	var header = document.createElement("tr");
	headerColNames.forEach(function(headerColName) {
		var column = document.createElement("th");
		header.appendChild(column);
		if (headerColName) {
			column.appendChild(document.createTextNode(headerColName));
		} else {
			column.className = "actionColumn";
		}
	});
	return header;
}

function createOnlineStatusColumn(deviceId) {
	var column = document.createElement("td");
	column.className = "actionColumn";
	var imageTag = document.createElement("img");
	imageTag.className = "onlineImage";
	imageTag.src = "./online.jpg";
	imageTag.dataset.toggle = "modal";
	//imageTag.dataset.target = "#onlineStatusModal";
	column.appendChild(imageTag);
	
    var onlineStatusfetcher = fetchOnlineStatus(deviceId, function(document){
		
		if(document){
			
			var isOnline = document.isOnline;
			var isBusy = document.isBusy;
			imageTag.src = isOnline?(isBusy?"./state_busy.png":"./state_online.png"):"./state_offline.png";
			
		}
		
	});
		
    onlineStatusfetcher();	
	var onlineTimerId = setInterval(onlineStatusfetcher, 30000);
	
	return column;
}

function createCurrentUserColumn(currentUserDetails) {
	
	var currentUserEmpCode = currentUserDetails.currentUser;
	var ackReceipt = currentUserDetails.ackReceipt;

	var column = document.createElement("td");
	var userColumnLink = document.createElement("a");
	
	var color = (ackReceipt === "" || ackReceipt === currentUserEmpCode)?"blue":"red";
	userColumnLink.style.color = color;
	
	userColumnLink.dataset.toggle = "modal";
	//userColumnLink.dataset.target = "#onlineStatusModal";
	userColumnLink.innerHTML = currentUserEmpCode;
	column.appendChild(userColumnLink);
	fetchEmpDetails(currentUserEmpCode, function(empDetails) {
		if (empDetails) {
			userColumnLink.innerHTML = empDetails.user_firstname + " "
					+ empDetails.user_lastname;
		}
	});

	return column;

}

function createRequesterColumn(requesters) {

	var column = document.createElement("td");
	var requesterNode = document.createTextNode("");
	column.appendChild(requesterNode);
	
	requesters.forEach(function(requesterId) {

		fetchEmpDetails(requesterId, function(empDetails) {
			console.log(empDetails.user_firstname);
			if (empDetails) {
				var comma = (requesterNode.nodeValue) ? ", " : "";
				requesterNode.nodeValue += comma + empDetails.user_firstname + " "
						+ empDetails.user_lastname;
			}
		});
	});
	return column;

}

function createActionColumn(deviceId, currentUserDetails, loggedInUserEid,
		requesters, callback) {
	
	var currentUserEid = currentUserDetails.currentUser;
	var ackReceipt = currentUserDetails.ackReceipt;
	
	var actionOnClick;
	var column = document.createElement("td");
	column.className = "actionColumn";
	var buttonTag = document.createElement("button");
	if (currentUserEid === loggedInUserEid && ackReceipt !== "" && ackReceipt !== currentUserEid){
		buttonTag.innerHTML = "RECEIVE";
		actionOnClick = acknowledgeReceipt(deviceId, currentUserEid, callback);
	}else if (currentUserEid === loggedInUserEid) {
		buttonTag.innerHTML = "SUBMIT";
		if (currentUserEid !== "0000-00000" && requesters.indexOf("0000-00000") === -1) {
			requesters.push("0000-00000");
		}		
		
		if (requesters.length === 1) {			
			actionOnClick = submitDevice(deviceId,requesters[0], callback);
		} else if(requesters.length > 1) {
			actionOnClick = function(){ return chooseRequesters(deviceId, requesters, callback)};
		}else{
			actionOnClick = function(){ return alert("No Reqesters");};
		}
	} else if (requesters.indexOf(loggedInUserEid) !== -1) {
		buttonTag.innerHTML = "REQUESTED";
		actionOnClick = requestDevice(deviceId, loggedInUserEid, callback);
	} else if (ackReceipt === loggedInUserEid ){
		buttonTag.innerHTML = "SUBMITTED";
		buttonTag.style.color = "red";
		actionOnClick = requestAcknowledgement(deviceId, currentUserEid, callback);
	}else {
		buttonTag.innerHTML = "REQUEST";
		actionOnClick = requestDevice(deviceId, loggedInUserEid, callback);
	}

	buttonTag.addEventListener("click", actionOnClick);
	column.appendChild(buttonTag);
	return column;

}

function createTextColumn(columnText) {

	var column = document.createElement("td");
	var textNode = document.createTextNode(columnText);
	column.appendChild(textNode);
	return column;
}

function populateRow(row, rowColumns, loggedInUserId, deviceId) {

	for (var index = 0; index < rowColumns.length; index++) {
		var column;
		switch (index) {
		case 0:
			column = createOnlineStatusColumn(deviceId);
			break;
		case 1:
		case 2:
		case 3:
		case 4:
			column = createTextColumn(rowColumns[index]);
			break;
		case 5:
			column = createCurrentUserColumn(rowColumns[index]);
			break;
		case 6:
			column = createRequesterColumn(rowColumns[index]);
			break;
		case 7:
			column = createActionColumn(deviceId, rowColumns[5],
					loggedInUserId, rowColumns[6], function(updatedRow) {	
				           console.log(JSON.stringify(updatedRow));
				            if(updatedRow){
				            	var status = updatedRow.device_isBusy ? "BUSY" : "FREE";
				            	table.removeChild(row);
				            	row = document.createElement("tr");
				            	populateRow(row,[ null, updatedRow.device_model,
				           						updatedRow.device_os, updatedRow.device_osversion, status,
				        						updatedRow.device_user, updatedRow.device_requester, null ],
				        						loggedInUserId, deviceId);
				            	table.appendChild(row);
				            }else{
				            	alert("Something went wrong!");
				            }				       
					});
			break;
		}
		if (column) {
			row.appendChild(column);
		}
	}
	return row;
}
