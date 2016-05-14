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