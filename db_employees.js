var responseSetter = require("./responses");

function searchByMatch(model, match, response, callback) {

	model.findOne(match, function(error, document) {

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
				responseSetter.resNotFound(response);
			} else if (callback) {
				callback(null);
			}
		}
	});

}

/** Find User By Id */
exports.findEid = function(model, eid, callback) {
	searchByMatch(model, {
		emp_Id : eid
	},null, callback);
};
