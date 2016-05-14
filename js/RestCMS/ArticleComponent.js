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