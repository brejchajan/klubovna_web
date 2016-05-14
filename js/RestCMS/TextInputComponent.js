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