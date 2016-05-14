/**
	Created by Jan Brejcha 14. 5. 2013.
	this program is licenced under GNU-GPL licence,
	free to use and redistribute
*/
/**
	RestCMS system constructor.
	Registers onLoad event listener to start the RestCMS system
	@param callback - user callback function that initializes components on the page
*/
var RestCMS = function(callback, templateVendor, templateName, defaultLanguage){
	window.templateName = templateName;
	window.templateVendor = templateVendor;
	addEventListener("load", callback, false);
	addEventListener("load", RestCMS.initPage.bind(this), false);
	RestCMS.initLanguages();
	RestCMS.setDefaultLanguage(defaultLanguage);
	window.permission = null;
	window.state = null;
	RestCMS._mainComponent = null;
	RestCMS._templateInstalled = true;

	//create template resource
	RestCMS._resource = new Resource(RestCMS.resourceError, RestCMS.resourceSuccess, "template", "template", "sampleurl", ["name", "vendor", "installed", "id"]);
	RestCMS._templateUrlBuilder = new TemplateUrlBuilder(templateVendor, templateName);
	RestCMS._resource.setUrlBuilder(RestCMS._templateUrlBuilder);
	//check if this template is installed
	RestCMS._resource.getAllResources(function(res){}, true);

};

RestCMS.resourceError = function(e){
	if (e.status == 424){
		//template not installed
		alert(_("This template is not installed. Please login with google account that has ADMIN rights and this template will be installed automatically."));
		RestCMS._templateInstalled = false;
	}
}

RestCMS.resourceSuccess = function(){
	
}

RestCMS.initPage = function(){
	$('#gDisconnect').click(RestCMS.logout.bind(this));
	$('#gDisconnect').hide();
}

/**
	proxy for translate method
*/
_ = function(text){
	return RestCMS.translate(text);
};
/**
	Translates from english to default language
	@param text - text to be translated.
*/
RestCMS.translate = function(text){
	for (i = 0; i < this._translations.length; i++){
		if (this._translations[i][0] == text){
			return this._translations[i][this._defaultLanguage];
		}
	}
	//if nothing was found return original text
	return text;
};

/**
	sets default language
	@param language - abbreviation of the desired language
*/
RestCMS.setDefaultLanguage = function(language){
	//set default language to english if the desired language is not found
	this._defaultLanguage = 0;
	//set default language according to the language parameter
	var langSet = false;
	for(i = 0; i < this._languages.length; i++){
		if (this._languages[i] == language){
			this._defaultLanguage = i;
			langSet = true;
		}
	}
	if (!langSet){
		alert("The chosen language is not available. Due to this problem english was chosen.");
	}
};

RestCMS.initLanguages = function(){
	this._languages = ["en", "cz"];
	this._translations = [];
	new Translation();
};

RestCMS.addTranslation = function(translationArray){
	if (translationArray.length != this._languages.length){
		alert("ERROR: translation for word " + translationArray[0] + " contains different number of languages than is available.");
		return;
	}
	this._translations[this._translations.length] = translationArray;
};

RestCMS.onSignInCallback = function(authResult){
	if (authResult['access_token']) {
        // The user is signed in
        this._authResult = authResult;
        RestCMS.connectServer();
	} else if (authResult['error']) {
        // There was an error, which means the user is not signed in.
        // As an example, you can troubleshoot by writing to the console:
        console.log('There was an error: ' + authResult['error']);
        $('#authResult').append('Logged out');
        $('#authOps').hide('slow');
        $('#gConnect').show();
	}
}

RestCMS.connectServer = function(){
	$.ajax({
		   type: 'GET',
		   url: 'http://' + window.location.host + '/restcms.php/connect',
		   contentType: 'application/octet-stream; charset=utf-8',
		   success: (function(result) {
				var res = JSON.parse(result);
				$.ajax({
					  type: 'POST',
					  url: 'http://' + window.location.host + '/restcms.php/connect?state='+res.state,
					  contentType: 'application/octet-stream; charset=utf-8',
					  success: function(result) {
							var res = JSON.parse(result);
							RestCMS.doLogin(res);
					  },
					   error: function(jq,status,message) {
						alert('A jQuery error has occurred. Status: ' + status + ' - Message: ' + message);
					   },
					  processData: false,
					  data: this._authResult.code
				});
		   }).bind(this)
	});
}

RestCMS.doLogin = function(response){
	window.state = response.state;
	//install template if needed
	if(!RestCMS._templateInstalled){
		var data = {vendor: window.templateVendor, name: window.templateName};
		RestCMS._resource.addResource(data, (function(){
			window.location.reload();
		}).bind(this), true);
	}
	else{
		RestCMS.callOnloginCallback(response);
	}
	
	
}

RestCMS.callOnloginCallback = function(response){
	//call onlogin callback
	RestCMS._mainComponent.onLogin(response);
	$('#gConnect').hide('slow');
	$('#gDisconnect').show('slow');
	document.getElementById('userEmail').innerHTML = response.email;
	var role = "";
	if (response.permission == "ADMIN")
		role = _("Administrator");
	else role = _("Normal user");
	document.getElementById('userRole').innerHTML = role;
}

RestCMS.doLogout = function(){
	$('#gConnect').show('slow');
	$('#gDisconnect').hide('slow');
	
	RestCMS._mainComponent.onLogout();
}

RestCMS.logout = function(e){
	e.preventDefault();
	$.ajax({
		   type: 'DELETE',
		   url: 'http://' + window.location.host + '/restcms.php/connect?state='+window.state,
		   contentType: 'application/octet-stream; charset=utf-8',
		   async: true,
		   success: function(result) {
				RestCMS.doLogout();
		   }
	});
}

/**
 Registers main component to handle login/logout or other system events
 */
RestCMS.setMainComponent = function(mainComponent){
	RestCMS._mainComponent = mainComponent;
	if (RestCMS.dipatchHashEvents == true){
		RestCMS.mainComponent.registerHashEventListeners();
	}
}

RestCMS.dispatchRegisterHashEventListeners = function(){
	if (RestCMS._mainComponent != null){
		RestCMS._mainComponent.registerHashEventListeners();
	}
	else RestCMS.dipatchHashEvents = true;
}