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