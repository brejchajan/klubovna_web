



/*
 This is a part of project named RestCMS. It is lightweight, extensible and easy to use
 content management system that stands on the idea that server should serve the
 content and clients should give the form to that content.
 
 Copyright (C) 2014  Jan Brejcha
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
	The class to hold the file info to show and to upload on server.
 */

var File = function(name, position, formData, uploadingComponentName, uploadErrorCallback){
	this._name = name;
	this._position = position;
	this._formData = formData;
	this._uploadErrorCallback = uploadErrorCallback;
	this._uploadingComponentName = uploadingComponentName;
	this._boxUI = null;
	this._progressBar = null;
	this._progress = null;
	this._link = null;
	this._img = null;
	this._fileResource = this.createFileResource(name);
};

File.prototype.getBoxUI = function(){
	return this.buildBoxUI();
};

File.prototype.setProgress = function(value){
	this._progressBar.setAttribute("aria-valuenow", '"' + value + '"');
	this._progressBar.innerHTML = value + "%";
	this._progressBar.style.width = value + "%";
};

/**
 Builds the UI showing the actual file. It shows progress bar when uploading
 the file to the server. After the upload is finished, this UI is clickable to 
 show or download the file.
 */
File.prototype.buildBoxUI = function(){
	//progress bar
	var progress = document.createElement("div");
	this._progress = progress;
	progress.className = "progress";
	progress.style.width = "100px";
	var progressBar = document.createElement("div");
	progressBar.className = "progress-bar";
	progressBar.setAttribute("role", "progressbar");
	progressBar.setAttribute("aria-valuenow", "0");
	progressBar.setAttribute("aria-valuemin", "0");
	progressBar.setAttribute("aria-valuemax", "100");
	progressBar.style.width = "0%";
	progressBar.innerHTML = "0%";
	this._progressBar = progressBar;
	progress.appendChild(progressBar);
	
	//start asynchronous upload
	this._fileResource.addResourceWithProgress(this._formData, this, this.uploadDone.bind(this));

	if (this.isImage(this._name)){
		this._img = new Image();
		this._img.appendChild(progress);
		return this._img;
	}
	else{
		var envelope = document.createElement("div");
		var button = document.createElement("div");
		envelope.setAttribute("draggable", "true");
		var icon = document.createElement("span");
		icon.className = "glyphicon glyphicon-file";
		button.appendChild(icon);
		var a = document.createElement("a");
		a.appendChild(document.createTextNode(this._name));
		this._link = a;
		button.appendChild(a);
		envelope.appendChild(button);
		//append progress bar
		button.appendChild(progress);
		this._boxUI = envelope;
		return envelope;
	}
};

File.prototype.uploadDone = function(address){
	if (this.isImage(this._name)){
		this._img.src = address;
	}
	else{
		this._link.href = address;
	}
	this._progress.style.display = "none";
	this._boxUI.addEventListener("dragend", this.deleteFile.bind(this), false);
}

File.prototype.isImage = function(filename){
	var arr = filename.split(".");
	if (arr[1] == "jpg" || arr[1] == "jpeg" || arr[1] == "png" || arr[1] == "gif" || arr[1] == "bmp"){
		return true;
	}
	return false;
};

File.prototype.deleteFile = function(e){
	if (e.dataTransfer.dropEffect == 'none'){
		//delete file
		//alert("delete file");
	}
}

File.prototype.createFileResource = function(fileName){
	/// Success handler of the resource
	var successHandler = function(){
		//No need to inform about success, only errors are treated.
	}
	/// Error handler of the resource.
	var errorHandler = function(e){
		alert("The file could not be uploaded. Try again later.");
		if (this._boxUI.parentNode != null){
			this._boxUI.parentNode.removeChild(this._boxUI);
			this._uploadErrorCallback();
		}
	}
	//the resource
	var resource = new Resource(errorHandler.bind(this), successHandler, "fileUpload", "fileUpload", "sampleurl", ["file"]);
	//template url builder
	this._templateUrlBuilder = new TemplateUrlBuilder(window.templateVendor, window.templateName);
	//component url builder
	this._componentUrlBuilder = new ComponentUrlBuilder(this._templateUrlBuilder, this._uploadingComponentName);
	//article url builder
	this._fileUrlBuilder = new FileUrlBuilder(this._componentUrlBuilder, fileName);
	resource.setUrlBuilder(this._fileUrlBuilder);
	return resource;

};


/* 
 This is a part of project named RestCMS. It is lightweight, extensible and easy to use
 content management system that stands on the idea that server should serve the
 content and clients should give the form to that content.
 
 Copyright (C) 2014  Jan Brejcha
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or 
 any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/**
 UrlBuilder is an object that must conform to following informal interface:
 interface UrlBuilder{
	String post()	- method returning post address of the resource
	String get()	- method returning get address of the resource
	String put		- method returning put address of the resource
 }
 UrlBuilder should be defined for each resource used in the application. 
 The resource's UrlBuilder is used to obtain correct address of the resource.
 It is used to be able to provide parametric addresses (with ids, names of components,
 etc. on various locations of the urls).
 */

/**
 UrlBuilder for template resource
 */
var TemplateUrlBuilder = function(vendor, name){
	this.vendor = vendor;
	this.name = name;
}
/**
 Generates post address for the resource.
 @return	String the address of post request.
 */
TemplateUrlBuilder.prototype.post = function(){
	return "restcms.php/template";
}

/**
 Generates get address for the resource.
 @return	String the address of get request.
 */
TemplateUrlBuilder.prototype.get = function(){
	return "restcms.php/template/" + this.vendor + "/" + this.name;
}

/**
 Generates put address for the resource.
 @return	String the address of put request.
 */
TemplateUrlBuilder.prototype.put = function(){
	return "restcms.php/template/" + this.vendor + "/" + this.name;
}

/**
 UrlBuilder for component resource
 */
var ComponentUrlBuilder = function(template, name){
	this.template = template;
	this.name = name;
}
/**
 Generates post address for the resource.
 @return	String the address of post request.
 */
ComponentUrlBuilder.prototype.post = function(){
	return "restcms.php/template/" + this.template.vendor + "/" + this.template.name + "/component";
}
/**
 Generates get address for the resource.
 @return	String the address of get request.
 */
ComponentUrlBuilder.prototype.get = function(){
	return "restcms.php/template/" + this.template.vendor + "/" + this.template.name + "/component" + "/" + this.name;
}
/**
 Generates put address for the resource.
 @return	String the address of put request.
 */
ComponentUrlBuilder.prototype.put = function(){
	return "restcms.php/template/" + this.template.vendor + "/" + this.template.name + "/component" + "/" + this.name;
}

/**
 UrlBuilder for article resource
 */
var ArticleUrlBuilder = function(component){
    this.component = component;
};
/**
 Generates post address for the resource.
 @return	String the address of post request.
 */
ArticleUrlBuilder.prototype.post = function(){
	return "restcms.php/template/" + this.component.template.vendor + "/" + this.component.template.name + "/component" + "/" + this.component.name + "/article";
}
/**
 Generates get address for the resource.
 @return	String the address of get request.
 */
ArticleUrlBuilder.prototype.get = function(){
	return "restcms.php/template/" + this.component.template.vendor + "/" + this.component.template.name + "/component" + "/" + this.component.name + "/article";
}
/**
 Generates put address for the resource.
 @return	String the address of put request.
 */
ArticleUrlBuilder.prototype.put = function(){
	return "/article";
}


/**
 UrlBuilder for file upload resource
 */
var FileUrlBuilder = function(component, fileName){
    this.component = component;
	this._fileName = fileName;
};
/**
 Generates post address for the resource.
 @return	String the address of post request.
 */
FileUrlBuilder.prototype.post = function(){
	return "restcms.php/template/" + this.component.template.vendor + "/" + this.component.template.name + "/component" + "/" + this.component.name + "/file";
}
/**
 Generates get address for the resource.
 @return	String the address of get request.
 */
FileUrlBuilder.prototype.get = function(){
	return "restcms.php/template/" + this.component.template.vendor + "/" + this.component.template.name + "/component" + "/" + this.component.name + "/file" + this._fileName;
}



/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var Resource = function(_errorHandler, _successHandler, _resourceName, _elementID, _baseURL, _dataHeading){
    this.errorHandler = _errorHandler;
    this.successHandler = _successHandler;
    this.resourceName = _resourceName;
    this.elementID = _elementID;
    this.url = _baseURL;
    this.dataHeading = _dataHeading;
    this.filter = null;
    this.order = null;
    this.currentPage = 0;
    this.itemsOnPage = null;
    this.urlBuilder = null;
    this.displayColName = null;
    this.itemIdName = null;
    this.binding = {};
};

Resource.prototype.addFilter = function(filter){
    if (this.filter === null){
        this.filter = {};
    }
    for(var key in filter){
        this.filter[key] = filter[key];
    }
};


Resource.prototype.setDisplayColName = function(name)
{
    this.displayColName = name;
};

Resource.prototype.setItemIdName = function(id){
    this.itemIdName = id;
};


Resource.prototype.setOrder = function(order){
    this.order = order;
    this.listAllResources();
};

Resource.prototype.setCurrentPage = function(currentPage){
    this.currentPage = currentPage;
};

Resource.prototype.setItemsOnPage = function(itemsOnPage){
    this.itemsOnPage = itemsOnPage;
};

Resource.prototype.defaultErrorHandler = function(err){
    alert(err);
};

Resource.prototype.buildXFilter = function(){
    if (this.filter !== null){
        var filter = "";
        var i = 0;
        var count = 0;
        for (key in this.filter){
            count++;
        }
        for (key in this.filter){
            filter += key + "=" + this.filter[key];
            if (i < count - 1){
                filter += ",";
            }
            i++;
        }
        return filter;
    }
    return null;
};


Resource.prototype.getAllResources = function(callback, asynchronous){
    if (asynchronous !== false){
        asynchronous = true;
    }
    if (this.urlBuilder !== null){
        this.url = this.urlBuilder.get();
    }
    jQuery.ajax({
				url: this.url,
				type: "GET",
				accept: "application/json; charset=utf-8",
				async: asynchronous,
				beforeSend: (function (XMLHttpRequest) {
							 //Specifying this header ensures that the results will be returned as JSON.
							 var filter = this.buildXFilter();
							 if (filter !== null){
							 XMLHttpRequest.setRequestHeader("X-Filter", filter);
							 }
							 }).bind(this),
				success: (function(res, status, req){
						  this.updateState(req);
						  callback(this.removeLineBreaks(res));
						  }).bind(this),
				error: (function(XMLHttpRequest, textStatus, errorThrown) {
						this.errorHandler(XMLHttpRequest);
						}).bind(this)
				});
};

Resource.prototype.isBound = function(name){
    for (var item in this.binding){
        if (item === name){
            return true;
        }
    }
    return false;
};

Resource.prototype.getResource = function(url, callback, asynchronous){
    if (asynchronous !== false){
        asynchronous = true;
    }

    jQuery.ajax({
				url: url,
				type: "GET",
				accept: "application/json; charset=utf-8",
				async: asynchronous,
				beforeSend: (function (XMLHttpRequest) {
							 //Specifying this header ensures that the results will be returned as JSON.
							 var filter = this.buildXFilter();
							 if (filter !== null){
							 XMLHttpRequest.setRequestHeader("X-Filter", filter);
							 }
							 }).bind(this),
				success: (function(res, status, req){
						  this.updateState(req);
						  callback(res);
						  }).bind(this),
				error: (function(XMLHttpRequest, textStatus, errorThrown) {
						this.errorHandler(XMLHttpRequest);
						}).bind(this)
				});
};

Resource.prototype.isBound = function(name){
    for (var item in this.binding){
        if (item === name){
            return true;
        }
    }
    return false;
};


Resource.prototype.updateResource = function(data, url, prevText, cancelHandler){
    var jsonString = JSON.stringify(data);
    jQuery.ajax({
				url: url,
				type: "PUT",
				contentType: "application/json; charset=utf-8",
				data: jsonString,
				success: (function(res, status, req){
						  this.updateState(req);
						  this.successHandler();
						  }).bind(this),
				error: (function(XMLHttpRequest, textStatus, errorThrown) {
						cancelHandler(cell, prevText);
						this.errorHandler(XMLHttpRequest);
						}).bind(this)
				});
};

Resource.prototype.setUrlBuilder = function(urlBuilder){
    this.urlBuilder = urlBuilder;
};

Resource.prototype.addResource = function(data, callback, asynchronous){
	if (asynchronous !== false){
        asynchronous = true;
    }
    var jsonRequest = JSON.stringify(data);
    if (this.urlBuilder !== null){
        this.url = this.urlBuilder.post();
    }
    jQuery.ajax({
				url: this.url,
				type: "POST",
				contentType: "application/json; charset=utf-8",
				async: asynchronous,
				data: jsonRequest,
				success: (function(res, status, req){
						  this.updateState(req);
						  if (callback != null)
							callback(this.removeLineBreaks(res));
						  }).bind(this),
				error: (function(XMLHttpRequest, textStatus, errorThrown) {
						this.errorHandler(XMLHttpRequest);
						}).bind(this)
				});
};

/**
 Adds resource with status bar updates
 @param data	the data to be sent to server
 @param status	the status bar object that conforms the status bar informal protocol.
 @callback		the callback function to be called after the uplad is done.
 */
Resource.prototype.addResourceWithProgress = function(data, status, callback){
	var url = this.urlBuilder.post();
    var jqXHR=$.ajax({
					 xhr: function() {
					 var xhrobj = $.ajaxSettings.xhr();
					 if (xhrobj.upload) {
					 xhrobj.upload.addEventListener('progress', function(event) {
													var percent = 0;
													var position = event.loaded || event.position;
													var total = event.total;
													if (event.lengthComputable) {
													percent = Math.ceil(position / total * 100);
													}
													//Set progress
													status.setProgress(percent);
													}, false);
					 }
					 return xhrobj;
					 },
					 url: url,
					 type: "POST",
					 contentType:false,
					 processData: false,
					 cache: false,
					 data: data,
					 success: (function(data){
						status.setProgress(100);
						if (callback != null){
							callback(this.removeLineBreaks(data));
						}
					 }).bind(this),
					 error: (function(XMLHttpRequest, textStatus, errorThrown) {
							 this.errorHandler(XMLHttpRequest);
							 }).bind(this)
					 });
	
    
}

Resource.prototype.updateState = function(res){
	var state = res.getResponseHeader('XState');
	if (state != null){
		window.state = state;
	}
}

Resource.prototype.removeResource = function(url){
	if (url == null){
		if (this.urlBuilder !== null){
			this.url = this.urlBuilder.post();
		}
	}
	else this.url = url;
    jQuery.ajax({
				url: this.url,
				type: "DELETE",
				contentType: "application/json; charset=utf-8",
				success: (function(res, status, req){
						  this.updateState(req);
						  this.successHandler(this.resourceName + " deleted successfully.");
						  }).bind(this),
				error: (function(XMLHttpRequest, textStatus, errorThrown) {
						this.errorHandler(XMLHttpRequest);
						}).bind(this)
				});
};

/**
 * Adds new resource binding for nested objects
 * @param {string} name       name of the column in the table
 * @param {Resource} resource   Resource object to be bound with the specified column
 */
Resource.prototype.addBinding = function(name, resource)
{
    this.binding[name] = resource;
    //this.airport.addBinding(name, resource);
};


Resource.prototype.dateStringToDate = function(dateString){
    var a = dateString.split("");
    a[10] = 'T';
    dateString = a.join("");
    return new Date(dateString);
};

/**
 Removes linebreaks and leading and trailing whitespaces.
 */
Resource.prototype.removeLineBreaks = function(str){
	var res = str.replace(/(\r\n|\n|\r)/gm,"");
	res = $.trim(res);
	return res;
}
var Translation = function(){
	RestCMS.addTranslation(["Add article", "Přidat článek"]);
	RestCMS.addTranslation(["Done", "Hotovo"]);
	RestCMS.addTranslation(["Edit", "Upravit"]);
	RestCMS.addTranslation(["Delete", "Smazat"]);
	RestCMS.addTranslation(["Bold", "Tučně"]);
	RestCMS.addTranslation(["Italic", "Kurzíva"]);
	RestCMS.addTranslation(["Underline", "Podtrženě"]);
	RestCMS.addTranslation(["paragraph", "odstavec"]);
	RestCMS.addTranslation(["heading 1", "nadpis 1"]);
	RestCMS.addTranslation(["heading 2", "nadpis 2"]);
	RestCMS.addTranslation(["heading 3", "nadpis 3"]);
	RestCMS.addTranslation(["heading 4", "nadpis 4"]);
	RestCMS.addTranslation(["heading 5", "nadpis 5"]);
	RestCMS.addTranslation(["heading 6", "nadpis 6"]);
	RestCMS.addTranslation(["Drag this article to a new position between articles.", "Táhněte článek na novou pozici mezi ostatními články."]);
	RestCMS.addTranslation(["This template is not installed. Please login with google account that has ADMIN rights and this template will be installed automatically.", "Tento template není nainstalován. Prosím, přihlašte se s google účtem, který má práva ADMIN a tento template bude nainstalován automaticky."]);
	RestCMS.addTranslation(["Administrator", "Administrátor"]);
	RestCMS.addTranslation(["Normal user", "Běžný uživatel"]);
	RestCMS.addTranslation(["Link", "Odkaz"]);
	RestCMS.addTranslation(["Type name of template to be used with this link", "Zadejte název template, který bude použit pro tento odkaz"]);
	RestCMS.addTranslation(["Step", "Krok"]);
};
/**
	Created by Jan Brejcha 14. 5. 2013.
	this program is licenced under GNU-GPL licence,
	free to use and redistribute
*/

/**
	Generic component constructor
	param tagName - name of the tag this component is assigned to
*/
var Component = function(){};
/**
	Abstract method.
	Component builder function.
*/
Component.prototype.buildComponent = function(){
	alert("ERROR: trying to build abstract component.");
};

/**
	Attaches this component to the tag in html DOM structure.
	Every component must be attached to some html element to be visible.
	@param tagName - name of the tag to attach this component to.
*/
Component.prototype.attachToTag = function(tagName){
	this._parent = document.querySelector(tagName);
	//this.buildComponent();
};

/** 
	Attaches this component to the class name in html DOM structure.
	@param className - name of the class to be this component attached to.
*/
Component.prototype.attachToClass = function(className){
	this._parent = document.querySelector("." + className);
	//this.buildComponent();
};

/**
 Attaches this component to the data-component atribute in html DOM structure.
 @param dataComponent - data-component attribute to attach this component to.
 */
Component.prototype.attachToDataComponent = function(dataComponent){
	this._parent = document.querySelector("[data-component=" + dataComponent + "]");
	//this.buildComponent();
};

Component.prototype.reattachToClass = function(){
	var tempParent = document.querySelector("." + this._parent.className);
	if (tempParent != null){
		this._parent = tempParent;
		this.buildComponent();
	}
};




/**
	Attaches this component to the DOM element.
	@param element - javascript DOM element
*/
Component.prototype.attachToElement = function(element){
	this._parent = element;
	this.buildComponent();
};

Component.prototype.makeUnselectable = function(element){
	$(element).attr('unselectable','on')
	.css({'-moz-user-select':'-moz-none',
		 '-moz-user-select':'none',
		 '-o-user-select':'none',
		 '-khtml-user-select':'none', /* you could also put this in a class */
		 '-webkit-user-select':'none',/* and add the CSS class here instead */
		 '-ms-user-select':'none',
		 'user-select':'none'
		 }).bind('selectstart', function(){ return false; });
}

Component.prototype.getMouseXY = function(e) {
    /*if (IE) { // grab the x-y pos.s if browser is IE
		tempX = event.clientX + document.body.scrollLeft;
		tempY = event.clientY + document.body.scrollTop;
    }
    else {  // grab the x-y pos.s if browser is NS*/
	var parentOffset = $(this._parent).offset();
		tempX = e.pageX - parentOffset.left;
		tempY = e.pageY - parentOffset.top;
    //}
	
    if (tempX < 0){tempX = 0;}
    if (tempY < 0){tempY = 0;}
	
    var pos = {};
	pos.x = tempX;
	pos.y = tempY;
	
    return pos;
}

/*
 This is a part of project named RestCMS. It is lightweight, extensible and easy to use
 content management system that stands on the idea that server should serve the
 content and clients should give the form to that content.
 
 Copyright (C) 2014  Jan Brejcha
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


/**
 Main component is component that joins all components together to obtain whole
 system. Its responsibility is to serve the content according to the current
 #hash part of the address. #Hash part of the url is the name of section that
 will be rendered. The data-use-template attribute of the <a> element defines
 which template will be used to render this section. This implies that tere can
 be section with one name but it can have more templates and it is up to the
 link to define which template to use. By the template is meant part of the
 html source code that defines the section form. Templates are defined in index 
 html file after element with id=main, which means the main panel on that will
 be each section rendered.
 
 The main component manages also calling other broadcast callbacks to all (or
 to some) components that are bound with the main component. Right now onLogin()
 and onLogout callbacks are implemented, but some more may follow.
 */
var MainComponent = function(){
	///name of the component
	this._componentName = "main";
	///pages templates
	this._pages = [];
	///id of the page that is being rendered
	this._currentPageId = null;
	///local components registered to the main component and that will be visible
	///on some (or all) sections.
	this._pageComponents = [];
	///login preferences to define permissions
	this._loginPrefs = null;
	/**
	 * Links (<a> elements) that are registered as hash links. If any link contains
	 * relative address starting with # (hash), it is registered as hash link in
	 * registerHashEventListeners(). This makes possible to render appropriate
	 * section (and hide the rest) when such link is clicked.
	 */
	this._registeredHashEventListeners = [];
	
	//register all hash event listeners.
	this.registerHashEventListeners();
	//set main component as global variable to be accessible globally.
	window.mainComponent = this;
};

/**
 Extends component object
 */
MainComponent.prototype = Object.create(Component.prototype);

/**
 Goes through all links that satisfy a[href^='#'] CSS3 selector.
 If the link is not currently registered, it will register onclick event
 on the hashLinkClicked() function.
 */
MainComponent.prototype.registerHashEventListeners = function(){
	var links = document.querySelectorAll("a[href^='#']");
	for (var i = 0; i < links.length; i++){
		var link = links[i];
		if (!this.isLinkRegistered(link)){
			link.addEventListener('click', this.hashLinkClicked.bind(this), false);
			this._registeredHashEventListeners.push(link);
		}
	}
}

/**
 Tests the link object if it is registered to hashLonkClicked() function.
 @param link	the link element to be tested.
 @return	true if the link element is registered,
			false otherwise.
 */
MainComponent.prototype.isLinkRegistered = function(link){
	for (var key in this._registeredHashEventListeners){
		var rlink = this._registeredHashEventListeners[key];
		if (link == rlink){
			return true;
		}
	}
	return false;
}

/**
 
 */
MainComponent.prototype.hashLinkClicked = function(e){
	var pageId = e.target.getAttribute('data-use-template');
	if (pageId != null){
		e.preventDefault();
		window.location = e.target.href;
		this.setCurrentPage(pageId);
	}
}

/**
 Adds page to the main component
 @param pageId	the ID of the element that contains the page HTML
 */
MainComponent.prototype.addPage = function(pageId){
	var pageElement = document.getElementById(pageId);
	this._pages[pageId] = {parent: pageElement.parentNode, page:pageElement};
};

/**
 Sets the page that will be displayed after loading the site, or after page reload.
 @param		templatePageId	id of the template to be used with the hash location
 @param		pageHref		the name of the section to be used in address after #
							symbol.
 */
MainComponent.prototype.setIndexPage = function(templatePageId, pageHref){
	window.location.href = (window.location.href.split("#"))[0] + "#" + pageHref;
	this._currentPageId = templatePageId;
	this.buildComponent();
}

/**
 Changes the current page to the section with the desired pageId. Should be called
 after the window.location is set to proper address of the section to be displayed.
 @param pageId		the pageId to be loaded.
 */
MainComponent.prototype.setCurrentPage = function(pageId){
	this._currentPageId = pageId;
	this.buildComponent();
};

/**
 Registers component that will load specific data on each page separately
 @param component	component to be registered. (It must be child of Component).
 */
MainComponent.prototype.registerPageComponent = function(component){
	this._pageComponents.push(component);
}

/**
 Builds the main component. This means that the section that was set as index page or was
 set as current page will be shown, all other sections will be removed from DOM.
 All registered components are called to reattach (this will cause that the 
 components will be added to the newly shown elements of the section in the DOM
 if aplicable and rebuilt. This will cause that the components will load its 
 content.
 */
MainComponent.prototype.buildComponent = function(){
	var prefix = (window.location.hash.split("#"))[1];
	if (prefix == null || prefix == undefined){
		window.location.href = window.location.href + "#" + this._currentPageId;
	}
	/*if (prefix != this._currentPageId){
		this.setCurrentPage(prefix);
		return;
	}*/
	//remove contents the components
	for (var key in this._pageComponents){
		var component = this._pageComponents[key];
		component.removeAllArticles();
	}
	//find the current page
	//hide all other pages
	for (var key in this._pages){
		var page = this._pages[key].page;
		var parent = this._pages[key].parent;
		if (page.id == this._currentPageId){
			//append the page to the DOM
			parent.appendChild(page);
		}
		else{
			//remove the page from DOM
			if ($(parent).children("#" + page.id).length > 0){
				parent.removeChild(page);
			}
		}
	}
	//reattach components
	for (var key in this._pageComponents){
		var component = this._pageComponents[key];
		component.componentNamePrefix = prefix;
		//FIXME attachment could be not only to class
		component.reattachToClass();
	}
	
};

/**
 OnLoginCallback is called when the user logs in. It is called by RestCMS system
 class. This callback is propagated to all registered page components.
 */
MainComponent.prototype.onLogin = function(loginPrefs){
	this._loginPrefs = loginPrefs;
	for (var key in this._pageComponents){
		var component = this._pageComponents[key];
		component.onLogin(loginPrefs);
	}
}

/**
 OnLogoutCallback is called when the user logs in. It is called by RestCMS system
 class. This callback is propagated to all registered page components.
 */
MainComponent.prototype.onLogout = function(){
	this._loginPrefs = null;
	for (var key in this._pageComponents){
		var component = this._pageComponents[key];
		component.onLogout();
	}
}
/**
	Creates new TextInputComponent
	@param 	resource	the resource object to persist the data
*/
var TextInputComponent = function(resource, resourceUrl, articleData){
	this._inputUIVisible = false;
	this._resource = resource;
	this._resourceUrl = resourceUrl;
	this._articleData = articleData;
	this._files = [];
	this._draggingObject = null;
};

TextInputComponent.prototype = new Component();

TextInputComponent.prototype.buildComponent = function(){
	this.buildBold();
	this.buildItalic();
	this.buildUnderline();
	this.buildAddLink();
	this.buildHeadings();
	this.buildTextarea();
	this.buildDoneButton();


	this._parent.addEventListener("dblclick", this.showInputUI.bind(this), false);
	
	//if brand new article is created (using button), show UI
	//else the article is created from database and the UI should not be present.
	if (this._articleData === null || this._articleData === undefined){
		this.showInputUI();
	}
};

TextInputComponent.prototype.onDragEnter = function(e){
	e.preventDefault();
	this._textarea.style.backgroundColor = "#99FF66";
}

TextInputComponent.prototype.onDragLeave = function(e){
	e.preventDefault();
	this._textarea.style.backgroundColor = "";
}

TextInputComponent.prototype.onDragEnd = function(e){
	e.preventDefault();
	if (this._draggingObject != null && e.dataTransfer.dropEffect == 'none'){
		this.trashDraggable(e);
	}
}

TextInputComponent.prototype.trashDraggable = function(e){
	if (e.target.id != "RestCMSTextEditor"){
		var parent = e.target.parentNode;
		if (parent != null){
			parent.removeChild(e.target);
		}
		this.updateParent();
	}
}

TextInputComponent.prototype.onDrop = function(e){
	e.preventDefault();
	this._textarea.style.backgroundColor = "";
	var fileList = e.dataTransfer.files;
	if (fileList.length > 0){
		for (var i = 0; i < fileList.length; i++){
			var file = fileList[i];
			var uibox;
			var formData = new FormData();
			formData.append("file", file);
			var uifile = new File(file.name, -1, formData, this._resource.urlBuilder.component.name, this.updateParent.bind(this));
			this._files.push(uifile);
			uibox = uifile.getBoxUI();

			uibox.addEventListener("dragstart", this.bootstrapDraggables.bind(this));
			this._textarea.appendChild(uibox);
		}
	}
	/*else{
		this._textarea.appendChild(this._draggingObject);
		this._draggingObject = null;
	}*/
	this.updateParent();
}

TextInputComponent.prototype.buildBold = function(){
	this._bold = document.createElement("a");
	this._bold.href = "";
	this._bold.title = _("Bold");
	this._bold.className = "deselected";
	this._bold.innerHTML = _("B");
	this._bold.addEventListener("click", this.bold.bind(this), false);
};

TextInputComponent.prototype.buildItalic = function(){
	this._italic = document.createElement("a");
	this._italic.href = "";
	this._italic.title = _("Italic");
	this._italic.className = "deselected";
	this._italic.innerHTML = _("I");
	this._italic.addEventListener("click", this.italic.bind(this), false);
};

TextInputComponent.prototype.buildUnderline = function(){
	this._underline = document.createElement("a");
	this._underline.href = "";
	this._underline.title = _("Underline");
	this._underline.className = "deselected";
	this._underline.innerHTML = _("U");
	this._underline.addEventListener("click", this.underline.bind(this), false);
};

TextInputComponent.prototype.buildAddLink = function(){
	this._addLink = document.createElement("a");
	this._addLink.href = "";
	this._addLink.title = _("Link");
	this._addLink.className = "deselected";
	this._addLink.innerHTML = _("Link");
	this._addLink.addEventListener("click", this.addLink.bind(this), false);
};


TextInputComponent.prototype.buildHeadings = function(){
	this._headings = document.createElement("select");
	this._headings.name = "headings";
	this._headings.addEventListener("change", this.headings.bind(this), false);

	var normalOption = document.createElement("option");
	normalOption.value = "P";
	normalOption.innerHTML = _("paragraph");
	this._headings.appendChild(normalOption);

	for (var i = 0; i < 6; i++){
		var hOption = document.createElement("option");
		hOption.value = "H" + (i + 1);
		hOption.innerHTML = _("heading " + (i + 1));
		this._headings.appendChild(hOption);
	}
};

TextInputComponent.prototype.buildTextarea = function(){
	this._textarea = document.createElement("div");
	this._textarea.contentEditable = "true";
	this._textarea.id = "RestCMSTextEditor";
	this._textarea.addEventListener("keyup", this.updateParent.bind(this), false);
	this._textarea.addEventListener("click", this.checkToggleButtons.bind(this), false);
	this._textarea.addEventListener("keyup", this.checkToggleButtons.bind(this), false);
	//fill textarea if data present
	if (this._articleData != null && this._articleData != undefined){
		this._textarea.innerHTML = this._articleData.text;
		this.updateParent();
	}
	this._textarea.addEventListener("dragenter", this.onDragEnter.bind(this), false);
	this._textarea.addEventListener("dragleave", this.onDragLeave.bind(this), false);
	this._textarea.addEventListener("dragend", this.onDragEnd.bind(this), false);
	this._textarea.addEventListener("drop", this.onDrop.bind(this), false);
};

TextInputComponent.prototype.buildDoneButton = function(){
	this._doneButton = document.createElement("input");
	this._doneButton.type = "button";
	this._doneButton.value = _("Done");
	this._doneButton.addEventListener("click", this.doneBtnClicked.bind(this), false);
};

TextInputComponent.prototype.doneBtnClicked = function(){
	this.updateParent();
	this.updateResource(null, true);
	//manage UI
	this.hideInputUI();
}

TextInputComponent.prototype.deleteResource = function(){
	this._resource.removeResource(this._resourceUrl);
}

TextInputComponent.prototype.updateResource = function(seq, dirty){
	//update resource
	var prevSeq = this.getSeq();
	if (prevSeq != seq || dirty){
		//need to update
		var data = {};
		data.text = this._textarea.innerHTML;
		if (seq == null || seq == undefined || seq == -1){
			data.seq = "AUTO";
		}
		else data.seq = seq;
		this._articleData.seq = data.seq;
		this._resource.updateResource(data, this._resourceUrl, null, null);
	}
}

TextInputComponent.prototype.getSeq = function(){
	if (this._articleData == null){
		//need to download
		this._resource.getResource(this._resourceUrl, (function(res){
			this._articleData = (JSON.parse(res))[0];
		}).bind(this), false);
	}
	else if (this._articleData.seq == "AUTO"){
		this._resource.getResource(this._resourceUrl, (function(res){
			this._articleData = (JSON.parse(res))[0];
		}).bind(this), false);
	}
	return this._articleData.seq;
}

TextInputComponent.prototype.hideInputUI = function(){
	if (this._inputUIVisible){
		this._parent.parentNode.removeChild(this._doneButton);
		this._parent.parentNode.removeChild(this._textarea);
		this._parent.parentNode.removeChild(this._headings);
		this._parent.parentNode.removeChild(this._addLink);
		this._parent.parentNode.removeChild(this._underline);
		this._parent.parentNode.removeChild(this._italic);
		this._parent.parentNode.removeChild(this._bold);
		this._inputUIVisible = false;
		
		//fix draggables
		var draggables = this._textarea.querySelectorAll("[draggable=true]");
		for (var i = 0; i < draggables.length; i++){
			var draggable = draggables[i];
			draggable.removeEventListener("dragstart", this.bootstrapDraggables.bind(this));
		}
	}
};

TextInputComponent.prototype.showInputUI = function(){
	if (!this._inputUIVisible){
		this._parent.parentNode.insertBefore(this._textarea, this._parent.nextSibling);
		this._parent.parentNode.insertBefore(this._doneButton, this._parent.nextSibling.nextSibling);
		this._parent.parentNode.insertBefore(this._headings, this._parent.nextSibling);
		this._parent.parentNode.insertBefore(this._addLink, this._parent.nextSibling);
		this._parent.parentNode.insertBefore(this._underline, this._parent.nextSibling);
		this._parent.parentNode.insertBefore(this._italic, this._parent.nextSibling);
		this._parent.parentNode.insertBefore(this._bold, this._parent.nextSibling);
		this._inputUIVisible = true;
		
		//fix draggables
		var draggables = this._textarea.querySelectorAll("[draggable=true]");
		for (var i = 0; i < draggables.length; i++){
			var draggable = draggables[i];
			draggable.addEventListener("dragstart", this.bootstrapDraggables.bind(this));
		}
	}

};

TextInputComponent.prototype.bootstrapDraggables = function(e){
	this._draggingObject = e.target;
	e.dataTransfer.setData("text/plain", null);
};

TextInputComponent.prototype.showInputUIEventProxy = function(e){
	e.preventDefault();
	this.showInputUI();
};

TextInputComponent.prototype.hideInputUIEventProxy = function(e){
	e.preventDefault();
	this.hideInputUI();
};

TextInputComponent.prototype.updateParent = function(e){
	this._parent.innerHTML = this._textarea.innerHTML;
};

/**
	text formatting events 
*/


TextInputComponent.prototype.bold = function(e){
	e.preventDefault();
	this.setToggle(this._bold);
	this._textarea.designMode = "On";
	this._textarea.focus();
	document.execCommand("bold", false, null);
	this._textarea.designMode = "Off";
	this.updateParent();
};

TextInputComponent.prototype.italic = function(e){
	e.preventDefault();
	this.setToggle(this._italic);
	this._textarea.designMode = "On";
	this._textarea.focus();
	document.execCommand("italic", false, null);
	this._textarea.designMode = "Off";
	this.updateParent();
};

TextInputComponent.prototype.underline = function(e){
	e.preventDefault();
	this.setToggle(this._underline);
	this._textarea.designMode = "On";
	this._textarea.focus();
	document.execCommand("underline", false, null);
	this._textarea.designMode = "Off";
	this.updateParent();
};

TextInputComponent.prototype.addLink = function(e){
	e.preventDefault();
	this._textarea.designMode = "On";
	this._textarea.focus();
	var link = this.getSelection();
	var linkStr = link.toString();
	if (linkStr.length == 0){
		return;
	}
	if (linkStr[0] == '#'){
		//local link
		var text = link.focusNode.textContent;
		var ch = '';
		var i = 0;
		while(ch != '#'){
			ch = text[i];
			i++;
		}
		//create new selection without hashtag
		var sel = self.getSelection();
		var range = document.createRange();
		range.setStart(sel.focusNode, i);
		range.setEnd(sel.focusNode, sel.focusNode.textContent.length);
		sel.removeAllRanges();
		sel.addRange(range);
	}
	else{
		//external link
		if (linkStr.indexOf('http://') == -1){
			linkStr = 'http://' + linkStr;
		}
	}
	document.execCommand("createLink", false, linkStr);
	if (linkStr[0] == '#'){
		var a = link.focusNode.parentNode;
		//set data attribute for local link
		a.setAttribute("data-toggle", "popover");
		a.setAttribute("data-pacement", "top");
		a.setAttribute("data-html", "true");
		a.setAttribute("data-container", "body");
		a.setAttribute("data-content", "<input id='restcmstemplatename' type='text' value=''/><button id='restcmssettemplate' type='button' value='OK'>OK</button>");
		a.setAttribute("data-original-title", _("Type name of template to be used with this link"));
		//postprocess the link
		var newLink = link.focusNode.textContent.split('#');
		var part2 = newLink[1];
		if (part2 == null || part2 == undefined){
			part2 = '';
		}
		document.getSelection().focusNode.textContent = newLink[0] + part2;
		//register event listener
		$(a).popover('show');
		var button = document.getElementById("restcmssettemplate");
		button.addEventListener("click", (function(e){
			//obtain the text
			var input = document.querySelector("#restcmstemplatename");
			var template = input.value;
			a.setAttribute('data-use-template', template);
			$(a).popover('hide');
			this.turnOffDesignMode();
			this.updateParent();
		}).bind(this), true);
	}
	else{
		this.turnOffDesignMode();
		this.updateParent();
	}
	//turn design mode off
};

TextInputComponent.prototype.turnOffDesignMode = function(){
	this._textarea.designMode = "Off";
}

TextInputComponent.prototype.headings = function(e){
	e.preventDefault();
	var value = e.target.value;
	this._textarea.designMode = "On";
	this._textarea.focus();
	document.execCommand("formatBlock", false, value);
	this._textarea.designMode = "Off";
	this.updateParent();
};

TextInputComponent.prototype.setToggle = function(element){
	if (element.className == "selected"){
		element.className = "deselected";
	}
	else{
		element.className = "selected";
	}
};

TextInputComponent.prototype.checkToggleButtons = function(e){
	var selection = this.getSelection();
	//resolve bold face
	if (selection.anchorNode.parentNode.tagName == "b" || selection.anchorNode.parentNode.tagName == "B"){
		this._bold.className = "selected";
	}
	else{
		this._bold.className = "deselected";
	}

	//resolve italic face
	if (selection.anchorNode.parentNode.tagName == "i" || selection.anchorNode.parentNode.tagName == "I"){
		this._italic.className = "selected";
	}
	else{
		this._italic.className = "deselected";
	}

	//resolve undeline face
	if (selection.anchorNode.parentNode.tagName == "u" || selection.anchorNode.parentNode.tagName == "U"){
		this._underline.className = "selected";
	}
	else{
		this._underline.className = "deselected";
	}

	//resolve headings
	//resolve undeline face
	if (selection.anchorNode.parentNode.tagName[0] == "h" || selection.anchorNode.parentNode.tagName[0] == "H"){
		this._headings.options.selectedIndex = selection.anchorNode.parentNode.tagName[1];
	}
	if (selection.anchorNode.parentNode.tagName == "p" || selection.anchorNode.parentNode.tagName == "P" || selection.anchorNode.parentNode.tagName == "DIV"){
		this._headings.options.selectedIndex = 0;
	}
};

TextInputComponent.prototype.getSelection = function(){
	if (window.getSelection){
		return window.getSelection();
	}
	if (document.selection){
		return document.selection();
	}
	i = 5;
};
/*
 This is a part of project named RestCMS. It is lightweight, extensible and easy to use
 content management system that stands on the idea that server should serve the
 content and clients should give the form to that content.
 
 Copyright (C) 2014  Jan Brejcha
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 Article component. Aticle component manages the creation and sorting of
 articles. It can be (as well as other components) attached to some HTML element
 to provide the functionality.
 
 The component support following actions with articles:
	- add new article - the article is added to the DOM and appropriate POST
						request is made to the RestCMS server.
	- update the article - article is updated in DOM as well as on the server
						with appropriate PUT request.
	- remove the article - article is removed from DOM and from the server by
						issuing appropriate DELETE request.
	- sort articles -	the articles can be drag&dropped to the desired postion.
						the sort is done only in Y direction right now, no support
						for horizontaly placed components is present yet.
						The order of the articles is sorted this way, not the 
						exact XY position.
						The articles are sorted according the set position and 
						the update is persisted on the server.
 
 @param componentName	The name of the component. The name is used to persist
						the component on the server. Therefore the name must not
						contain any diacritic or spaces.
*/
var ArticleComponent = function(componentName){
	/// The name of the component to be stored in the database on the server.
	this._componentName = componentName;
	/// Component name prefix defines the current prefix for current page. This way
	/// it is possible to have one component defined once but used to serve different
	/// content in different secitons of the web.
	this.componentNamePrefix = "";
	/// The element that is being dragged
	this._dragElement = null;
	/// The elements that were moved down during animation of drag and drop.
	this._movedElements = [];
	/// The count of the articles in this component.
	/// initial value is -1 because the add is asynchronous and the count must
	/// be incremented before the add.
	this._articleCount = -1;
	/// The first article element in this component.
	this._firstArticle = null;
	/// Content of the element being dragged. While dragging the elements content
	/// is changed to the hint text what to do. After the drag is finished the
	/// original content is returned back.
	this._dragElementContent = null;
	/// The button for adding new article.
	this._addArticleButton = null;
	/// The timer that is fired after the long press to drag the component.
	this._longPressTimer = null;
	/// Login preferences that will be stored here after the user is logged in.
	this._loginPrefs = null;
};

/**
	Extends component object
*/
ArticleComponent.prototype = Object.create(Component.prototype);

/**
 The callback that creates the article elements in DOM after the data from 
 server were received.
 @param data	the data object (already parsed from JSON) containing the 
				articles data.
 */
ArticleComponent.prototype.loadArticlesCallback = function(data){
	this._articles = [];
	var articles = JSON.parse(data);
	for (var key in articles){
		var article = articles[key];
		this.createNewArticle(article);
	}
	RestCMS.dispatchRegisterHashEventListeners();
};

/**
 The method that tests if admin is logged. 
 @TODO Should be moved to the Component
 object (the parent) for better reusability of the code
 */
ArticleComponent.prototype.isAdminLogged = function(){
	if (this._loginPrefs != null && this._loginPrefs.permission == "ADMIN"){
		return true;
	}
	return false;
}

/**
 Resource factory method for article resource. All UrlBuilders are initialized
 and assigned to newly created resource.
 */
ArticleComponent.prototype.createArticleResource = function(){
	/// Success handler of the resource
	var successHandler = function(){
		//No need to inform about success, only errors are treated.
	}
	/// Error handler of the resource.
	var errorHandler = function(e){
		if (e.status == 424){
			//if the component was not found
			//install the component
			var component = {name: this.componentNamePrefix + this._componentName};
			this.resource.setUrlBuilder(this._componentUrlBuilder);
			this.resource.addResource(component, (function(){
				this.resource.setUrlBuilder(this._articleUrlBuilder);
				this.resource.getAllResources(this.loadArticlesCallback.bind(this), true);
			}).bind(this), true);
		}
	}
	//the resource
	var resource = new Resource(errorHandler.bind(this), successHandler, this.componentNamePrefix + this._componentName, this.componentNamePrefix + this._componentName, "sampleurl", ["seq", "text"]);
	//template url builder
	this._templateUrlBuilder = new TemplateUrlBuilder(window.templateVendor, window.templateName);
	//component url builder
	this._componentUrlBuilder = new ComponentUrlBuilder(this._templateUrlBuilder, this.componentNamePrefix + this._componentName);
	//article url builder
	this._articleUrlBuilder = new ArticleUrlBuilder(this._componentUrlBuilder);
	resource.setUrlBuilder(this._articleUrlBuilder);
	return resource;
};

/**
	@Override 
	Component builder function.
	Builds this component.
	- adds create article button
	- calls resource factory to create new resource
	- obtains all existing articles from server.
*/
ArticleComponent.prototype.buildComponent = function(){
	this.removeAllArticles();
	//support for dragging children
	this._parent.addEventListener("mousemove", this.drag.bind(this), false);
	
	this._addArticleButton = document.createElement("input");
	this._addArticleButton.type = "button";
	this._addArticleButton.className = "btn btn-success";
	this._addArticleButton.value = _("Add article");
	this._addArticleButton.addEventListener("click", this.createNewArticle.bind(this), false);
	if (!(this._loginPrefs != null && this._loginPrefs.permission == "ADMIN")){
		$(this._addArticleButton).hide();
	}
	this._parent.appendChild(this._addArticleButton);
	
	//create new resource
	this.resource = this.createArticleResource();
	//load articles from resource
	this.resource.getAllResources(this.loadArticlesCallback.bind(this), true);
};

/**
 Removes all content of this component from the DOM. Should be called before 
 main component builds the content to avoid the component to be shown several
 times on a single page.
 */
ArticleComponent.prototype.removeAllArticles = function(){
	if (this._addArticleButton != null){
		this._parent.removeChild(this._addArticleButton);
		this._addArticleButton = null;
	}
	var article = this._firstArticle;
	var nextArticle;
	while (article != null){
		nextArticle = article.nextSibling;
		if (this._parent.children.length > 0){
			this._parent.removeChild(article);
		}
		article = nextArticle;
	}
	this._articleCount = -1;
};

/**
 Creates new article, adds it into DOM and persist it on the server.
 @param articleData		The article data are used when they was retreived earlier.
						In this case there is no need to download them again,
						so only new article element is placed into DOM.
*/
ArticleComponent.prototype.createNewArticle = function(articleData){
	this._articleCount++;
	if (articleData.text != null){
		this.createTextInputComponent(articleData.url, articleData);
	}
	else{
		//persist new article
		var newArticle = {};
		newArticle.text = "";
		newArticle.seq = "AUTO";
		this.resource.addResource(newArticle,
		(function(resourceUrl)
		{
			this.createTextInputComponent(resourceUrl, null);
		}).bind(this), true);
	}
};

/**
 Creates the text input component to be able to add and edit the content of the
 article.
 @param resourceUrl		the url of the article to be able to persist the changes 
						of the component content.
 @articleData			The article data to assign to the content of the text
						input component to have both text input and article 
						component in sync.
 */
ArticleComponent.prototype.createTextInputComponent = function(resourceUrl, articleData){
	//create new resource for particular article
	var articleResource = this.createArticleResource();
	var childrenClassName = this._parent.getAttribute("data-children-class");
	var articleTag = document.createElement("article");
	if (childrenClassName != null && childrenClassName != undefined){
		//if admin
		if (this._loginPrefs != null && this._loginPrefs.permission == "ADMIN"){
			articleTag.setAttribute('data-class', childrenClassName);
		}
		else{
			articleTag.className = childrenClassName;
		}
	}
	articleTag.style.position = "relative";
	//make article tag draggable
	this.setDraggable(articleTag);
	
	if (this._articleCount == 0){
		this._parent.appendChild(articleTag);
		this._firstArticle = articleTag;
	}
	else{
		this._parent.insertBefore(articleTag, this._firstArticle);
		this._firstArticle = articleTag;
	}
	var articleDiv = document.createElement("div");
	articleDiv.className = "articleDiv";
	this.makeUnselectable(articleDiv);
	articleTag.appendChild(articleDiv);
	var textInput = new TextInputComponent(articleResource, resourceUrl, articleData);
	textInput.attachToElement(articleDiv);
	this._articles.push({article:textInput, tag:articleTag});
	var toolBar = this.buildArticleToolBar(textInput, articleDiv, articleTag);
	this.makeUnselectable(toolBar);
	if (!this.isAdminLogged()){
		$(toolBar).hide();
	}
	articleTag.insertBefore(toolBar, articleDiv);
};


/**
 Set the DOM element to be draggable.
 The component can be dragged if the mouse is holding it for some time (200 ms here).
 The drag is registered if the mouse is holding the element. After the mouse release
 the drag is unregistered.
 @param		article the DOM element to be made draggable.
 */
ArticleComponent.prototype.setDraggable = function(article){
	article.addEventListener("mousedown", (function(e){
										   if (e.target.className == "articleDiv"){
											   clearTimeout(this._longPressTimer);
											   this._longPressTimer = setTimeout((function(){
																					this.registerDrag(article);
																				  }).bind(this), 200);
										   }
											   }).bind(this), true);
	article.addEventListener("mouseup", this.unregisterDrag.bind(this), false);
};

/**
 Registers the DOM element to be dragged when mousemove event occurs.
 The articles can be dragged only by administrator, so the drag is registered only
 if the ADMIN is logged on.
 @param		tag		the DOM element to be registered for dragging when mousemove
					event occurs.
 */
ArticleComponent.prototype.registerDrag = function(tag){
	//only admin can drag and drop articles
	if (this._loginPrefs != null){
		if (this._loginPrefs.permission == "ADMIN"){
			//find first textinput component
			//find article text input component
			for (var key in this._articles){
				var art = this._articles[key];
				if (art.tag == this._firstArticle){
					this._firstSeq = art.article.getSeq();
				}
			}
			this._dragElement = tag
			
			var articleDiv = tag.firstChild.nextSibling;
			var text = _("Drag this article to a new position between articles.");
			if (articleDiv.innerHTML != text){
				this._dragElementContent = articleDiv.innerHTML;
				//change the drag element content to the advice what to do when dragging
				articleDiv.innerHTML = text + "<br><br><br><br>";
			}
		}
	}
};

/**
 Unregisters drag when the mouseup event above element being dragged occurs.
 Clears the timer.
 Sets proper position on the dragged element
 Updates the sequence numbers of articles (their position)
 @param tag		the event object.
 */
ArticleComponent.prototype.unregisterDrag = function(tag){
	//eventually stop long press timeout
		clearTimeout(this._longPressTimer);
		this._longPressTimer = null;
	if (this._dragElement != null){
		//finish editting DOM
		this._dragElement.style.position = "relative";
		this._dragElement.style.top = "0px";
		this._dragElement.style.left = "0px";
		this.updateComponentDOM();
		this.animateBack(0);
		
		//return the former content of the article
		var articleDiv = this._dragElement.firstChild.nextSibling;
		articleDiv.innerHTML = this._dragElementContent;
		this._dragElementContent = null;
		
		this._dragElement = null;
	}
	
	this.updateSeq();
	RestCMS.dispatchRegisterHashEventListeners();
};

ArticleComponent.prototype.updateSeq = function(){
	var article = this._firstArticle;
	var seq = 0;
	while(article != null){
		seq++;
		//update article
		article = article.nextSibling;
	}
	article = this._firstArticle;
	while(article != null){
		//find article text input component
		for (var key in this._articles){
			var art = this._articles[key];
			if (art.tag == article){
				//found, update
				art.article.updateResource(seq);
				seq--;
			}
		}
		//update article
		article = article.nextSibling;
	}
}

ArticleComponent.prototype.drag = function(e){
	//if (e.target.className == "articleDiv")
		//document.getSelection().removeAllRanges();
	if (this._dragElement != null && e.target.className == "articleDiv"){
		this._dragElement.style.position = "absolute";
		var pos = this.getMouseXY(e);
		this._dragElement.style.left = (pos.x - this._dragElement.offsetWidth / 2.0) + "px";
		//this._dragElement.style.width = this._dragElement.offsetWidth;
		this._dragElement.style.top = (pos.y  - this._dragElement.offsetHeight / 2.0) + "px";
		this.updateComponentDOM();
	}
};


ArticleComponent.prototype.updateComponentDOM = function(){
	//iterate over all children of this component, sort them according to the y position,
	//then recalculate seq for each article and persist changes on server.
	var article = this._firstArticle;
	var map = [];
	var previousMap = [];
	var i = 0;
	while(article != null){
		map[i] = article;
		previousMap[i] = article;
		//update article
		article = article.nextSibling;
		i++;
	}
	//sort according their y position
	map.sort(this.sortArticles);
	//compare if sort made some change
	var changed = false;
	for (key in map){
		if (map[key] != previousMap[key]){
			changed = true;
			break;
		}
	}
	if (changed == true){
		map.reverse();
		//update component DOM
		//remove all articles from DOM
		for (key in map){
			var art = map[key];
			this._parent.removeChild(art);
		}
		this._articleCount = 0;
		//reinsert all articles back to DOM
		for (key in map){
			var current = map[key];
			if (this._articleCount == 0){
				this._parent.appendChild(current);
			}
			else{
				this._parent.insertBefore(current, this._firstArticle);
			}
			this._firstArticle = map[key];
			this._articleCount++;
		}
		//make animations
		this.animateBack(300, (function(){
			map.reverse();
			var animate = false;
			for (key in map){
				var current = map[key];
				//animate forward
				if (animate || current == this._dragElement){
					animate = true;
					var next = current.nextSibling;
					if (next != null && next != this._dragElement){
						$(next).animate({top: "+=" + 40}, {duration:300, queue:false});
						this._movedElements.push(next);
					}
				}
			}
		}).bind(this));
	}
}

ArticleComponent.prototype.animateBack = function(time, callback){
	//animate back
	var i = 0;
	var run = false;
	if (this._movedElements.length > 0){
		while (this._movedElements.length - 1 > 0){
			var el = this._movedElements.shift();
			$(el).animate({top: "0px"}, {duration:time, queue:false});
		}
		var el = this._movedElements.shift();
		$(el).animate({top: "0px"}, {duration:time, queue:false, complete:callback});
	}
	else{
		if (callback != null && callback != undefined)
			callback();
	}
}

ArticleComponent.prototype.sortArticles = function(a1, a2){
	var a1y = $(a1).position().top;
	var a2y = $(a2).position().top;
	if (a1y < a2y)
		return -1;
	if (a1y > a2y)
		return 1;
	return 0;
}


/**
	Builds article tool bar
	used for tools like B I U, etc.
	@param textInput - textInputComponent
	@param articleDiv - element that stores the article
*/
ArticleComponent.prototype.buildArticleToolBar = function(textInput, articleDiv, articleTag){
	var toolBar = document.createElement("div");
	toolBar.className = "btn-group";
	toolBar.setAttribute("data-name", "articleToolBar");

	//var toolBarEditBox = document.createElement("span");
	//toolBarEditBox.className = "articleToolBarEditBox";
	var toolBarEditLink = document.createElement("button");
	toolBarEditLink.setAttribute("type", "button");
	toolBarEditLink.className = "btn btn-primary btn-xs";
	toolBarEditLink.innerHTML = _("Edit");
	toolBarEditLink.addEventListener("click", textInput.showInputUIEventProxy.bind(textInput), false);
	//toolBarEditBox.appendChild(toolBarEditLink);

	//var toolBarDeleteBox = document.createElement("span");
	//toolBarDeleteBox.className = "articleToolBarDeleteBox";
	var toolBarDeleteLink = document.createElement("button");
	toolBarDeleteLink.setAttribute("type", "button");
	toolBarDeleteLink.className = "btn btn-primary btn-xs";
	toolBarDeleteLink.innerHTML = _("Delete");
	toolBarDeleteLink.addEventListener("click", function(e){
		e.preventDefault();
		textInput.hideInputUI();
		textInput.deleteResource();
		articleTag.removeChild(articleDiv);
		articleTag.removeChild(toolBar);
	}.bind(this), false);
	//toolBarDeleteBox.appendChild(toolBarDeleteLink);

	toolBar.appendChild(toolBarEditLink);
	toolBar.appendChild(toolBarDeleteLink);
	return toolBar;
};

ArticleComponent.prototype.onLogin = function(loginPrefs){
	this._loginPrefs = loginPrefs;
	if (loginPrefs.permission == "ADMIN"){
		$(this._addArticleButton).show('slow');
		//show toolbars of all articles
		var article = this._firstArticle;
		while(article != null){
			var toolBar = $(article).find("[data-name=articleToolBar]");
			$(toolBar).show('slow');
			//make article list linear (remove class name of article children)
			article.setAttribute('data-class', article.className);
			article.className = "";
			//update article
			article = article.nextSibling;
		}
	}
}


ArticleComponent.prototype.onLogout = function(){
	this._loginPrefs = null;
	$(this._addArticleButton).hide('slow');
	
	//hide toolbars of all articles
	var article = this._firstArticle;
	while(article != null){
		var toolBar = $(article).find("[data-name=articleToolBar]");
		$(toolBar).hide('slow');
		//set the classname of articles back
		article.className = article.getAttribute('data-class');
		article.setAttribute('data-class', null);
		//update article
		article = article.nextSibling;
	}
}
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

