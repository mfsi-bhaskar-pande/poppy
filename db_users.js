var responseSetter = require("./responses");

function saveDocument(userAccount, response, callback) {

	if (userAccount) {
		userAccount.save(function(error, document) {
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

function isValueValid(value) {
	return value && value !== "";
}

function searchByMatch(justOne, model, match, response, callback, selection) {

	var searchFunctionName = justOne ? "findOne" : "find";
	model[searchFunctionName](match,selection, function(error, document) {

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
				var noSuchUserError = new Error("No employee with Eid:"+match.user_eid+" Present");
				callback(noSuchUserError);
			}
		}
	});

}

function updateDocInstance(document, accountupdate) {

	if (isValueValid(accountupdate.user_name)) {
		document.user_name = accountupdate.user_name;
	}
	if (isValueValid(accountupdate.user_eid)) {
		document.user_eid = accountupdate.user_eid;
	}
	if (isValueValid(accountupdate.user_role)) {
		document.user_role = accountupdate.user_role;
	}
	if (isValueValid(accountupdate.user_emailId)) {
		document.user_emailId = accountupdate.user_emailId;
	}
	if (isValueValid(accountupdate.user_primaryPhoneNumber)) {
		document.user_primaryPhoneNumber = accountupdate.user_primaryPhoneNumber;
	}

}

/** Inserts the User Account passed In as Argument */
exports.insertUserAccount = function(userAccount, response, callback) {
	saveDocument(userAccount, response, callback);
};

/** Update the fetched User Account with new account info */
exports.updateUserAccount = function(model, eid, accountUpdate, response) {

	function onDocumentFetched(error, document) {
		if (!error && accountUpdate && document) {
			updateDocInstance(document, accountUpdate);
			saveDocument(document, response);
		} else {
			if (!document && !error) {
				responseSetter.resNotFound(response);
			} else {
				responseSetter.internalServerError(response, error);
			}
		}
	}
	searchByMatch(true, model, {
		user_eid : eid
	}, null, onDocumentFetched);

};

/** Remove the account with the given eid */
exports.deleteAccount = function(model, eid, response) {

	function onDocumentFetched(error, document) {
		if (!error && document) {
			document.remove(function(error) {
				responseSetter.internalServerError(response, error);
			});
		} else if (!document && !error) {
			responseSetter.resNotFound(response);
		} else {
			responseSetter.internalServerError(response, error);
		}
	}
	searchByMatch(true, model, {
		user_eid : eid
	}, null, onDocumentFetched);

};

/** Find All Users */
exports.fetchAllAccounts = function(model, response) {
	searchByMatch(false, model, {}, response, null);
};

exports.fetchAccountDetails = function(eid, model, callback, reqColumns) {
	searchByMatch(true, model, {user_eid : eid},null, callback, reqColumns);
};

/** Find User By Id */
exports.findUserByEid = function(model, eid, response) {
	searchByMatch(true, model, {
		user_eid : eid
	}, response, null);
};

exports.verifyCredentials = function(model, eid, password,callback) {
	searchByMatch(true, model, {
		user_eid : eid,
		user_password: password
	}, null, callback);
};
