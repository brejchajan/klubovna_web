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


