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

