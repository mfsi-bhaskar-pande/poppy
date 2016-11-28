function chooseRequesters(requestedDeviceId, requesters, callback) {

	var modal = document.querySelector("#chooseRequesterModal_body");

	var proceed = document.querySelector("#submitNextUser");
	var cancel = document.querySelector("#cancelDialog");
	var oldContainer = document
			.querySelector("#chooseRequesterModal_bodyContainer");

	console.log(oldContainer);
	if (oldContainer) {
		modal.removeChild(oldContainer);
	}

	var containerDiv = document.createElement("div");
	containerDiv.id = "chooseRequesterModal_bodyContainer";

	requesters.forEach(function(requesterId) {

		var radio = document.createElement("input");

		var label = document.createElement("p");
		var textnode = document.createTextNode("");

		radio.type = "radio";
		radio.name = "requester";
		radio.value = requesterId;

		label.appendChild(radio);
		label.appendChild(textnode);

		containerDiv.appendChild(label);

		fetchEmpDetails(requesterId, function(empDetails) {

			if (empDetails) {
				textnode.nodeValue = empDetails.user_firstname + " "
						+ empDetails.user_lastname;
			}
		});
	});

	modal.appendChild(containerDiv);

	$("#chooseRequesterModal").modal();
	
	proceed.addEventListener("click", function(){
		
		var radios = document.querySelectorAll("[name=requester]");
		var userChosen = null;
		for (var i = 0; i < radios.length; i++) {
			if (radios[i].checked) {
				userChosen = radios[i].value;
				break;
			}
		}
		submitDevice(requestedDeviceId, userChosen, function(result) {
			$("#chooseRequesterModal").modal("hide");
			callback(result);
		})();
		
	});

	cancel.addEventListener("click", function() {
		$("#chooseRequesterModal").modal("hide");
	});

}
