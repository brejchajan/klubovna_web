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
