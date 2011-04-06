//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011  Ivaylo Valkov <ivaylo@e-valkov.org>
//  Copyright (C) 2010  Anton Katsarov <anton@katsarov.org>
//
//  The JavaScript code in this page (or file) is free software: you
//  can redistribute it and/or modify it under the terms of the GNU
//  General Public License (GNU GPL) as published by the Free Software
//  Foundation, either version 3 of the License, or (at your option)
//  any later version.  The code is distributed WITHOUT ANY WARRANTY
//  without even the implied warranty of MERCHANTABILITY or FITNESS
//  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
//
//  As additional permission under GNU GPL version 3 section 7, you
//  may distribute non-source (e.g., minimized or compacted) forms of
//  that code without the copy of the GNU GPL normally required by
//  section 4, provided you include this license notice and a URL
//  through which recipients can access the Corresponding Source.
//
//  @licend The above is the entire license notice for the JavaScript
//  code in this page (or file).
//
// @source http://e-valkov.org/linterna-magica

// END OF LICENSE HEADER

// Log information to the console or the web logger. For debugging
// purposes.
LinternaMagica.prototype.log = function(message, level)
{
    // No debug set by the user
    if (!this.debug_level)
    {
	return;
    }

    if (!level)
    {
	level = 1;
    }

    if (this.debug_level >= level)
    {
	var w = null;
	try
	{
	    // Firefox and Greasemonkey
	    w = usafeWindow;
	}
	catch(e)
	{
	    // Epiphany and Midori
	    w = window;
	}

	// Simple log/debug
	// console.log(window.location.hostname+": "+message);

	// Extra debug with time (useful when the script bloats the
	// browser)
	var date = new Date();
	var str =  [date.getHours(), date.getMinutes(),
		    date.getSeconds(), date.getMilliseconds()].join(":");
	var host_get = w.self;
	var host = host_get.location.hostname;
	var log_string = message + " at "+host + " time: "+str;

	try
	{
 	    if (this.log_to == "web")
 	    {
 		var row = document.createElement('p');
 		row.setAttribute("class", 
				 "linterna-magica-log-to-web-message");
 		var t = document.createTextNode(log_string);

 		row.appendChild(t);
 		this.logger.appendChild(row);
 	    }
 	    else
 	    {
 		throw "Log to web not selected.";
 	    }
	}
	catch(e)
	{
 	    try
 	    {
		// Greasemonkey 0.8.2 does not print to fireBug
		// console with console.log
		try
		{
		    unsafeWindow.console.log(log_string);
		}
		catch(e)
		{
		    // Epiphany
		    console.log(log_string);
		}	
 	    }
	    catch(e)
	    {
		// The only option left is alert(), but is useless;
	    }
	}
    }
}


// Create the structure for the web log
LinternaMagica.prototype.create_web_logger = function()
{
    var logger = document.createElement("div");
    logger.setAttribute("id", "linterna-magica-web-log");
    logger.setAttribute("class", "linterna-magica-web-log");
    // Make it always visible. Hide it when vide object is created.
    // This way the web log will be visible even when o objects are
    // found. This will be usefull to report not working sites. In
    // other words keep tis commented.
    // logger.style.setProperty("display","none", "important");
    
    if (!logger)
    {
	this.log("LinternaMagica.create_web_logger:\n"+
		 "Unable to create web log. Will log to console.",1);
	return null;
    }

    var header = document.createElement("div");
    header.setAttribute("class",
			"linterna-magica-web-log-header");

    var p = document.createElement("p");

    var txt = document.createTextNode(this._(
	"Linterna Mágica error and debug messages"));

    p.appendChild(txt);
    header.appendChild(p);

    var close = document.createElement("a");
    close.textContent="x";
    close.setAttribute("href", "#");
    close.setAttribute("title", this._("Remove log"));
    p.appendChild(close);
    
    close.addEventListener("click", function(ev)
    			   {
    			       ev.preventDefault();
    			       // The entire web log
    			       var log = this.parentNode.
				   parentNode.parentNode;
    			       log.parentNode.removeChild(log);
    			   }, false);

    var show_hide_log = document.createElement("a");
    show_hide_log.textContent="-";
    show_hide_log.setAttribute("href", "#");
    show_hide_log.setAttribute("title", this._("Show/hide debug messages"));
    show_hide_log.setAttribute("class", "linterna-magica-web-log-show-hide-body");
    p.appendChild(show_hide_log);
    
    show_hide_log.addEventListener("click", function(ev)
    			   {
    			       ev.preventDefault();
    			       // The body of the log
    			       var b = this.parentNode.
				   parentNode.nextSibling;
			       var p = b.parentNode;
			       var t = 
				   parseInt(p.style.getPropertyValue("top"));

    			       	if(b.style.display)
			       {
				   b.style.removeProperty("display");
				   p.style.setProperty("height",
						       "250px", "important");
				   p.style.setProperty("top", (t-226)+"px",
						       "important");
				   b.style.setProperty("overflow", "auto",
						       "important");
				   p.style.setProperty("overflow", "visible",
				   		       "important");
			       }
			       else
			       {
				   b.style.setProperty(
				       "display","none", "important");
				   // Only the header is visible
				   p.style.setProperty("height",
						       "24px", "important");
				   p.style.setProperty("overflow", "hidden",
						       "important");
				   p.style.setProperty("top", (t+226)+"px",
						       "important");
			       }
    			   }, false);
    
    
    logger.appendChild(header);

    var body  = document.createElement("div");
    body.setAttribute("id", "linterna-magica-web-log-messages");
    body.setAttribute("class", "linterna-magica-web-log-messages");
    body.style.setProperty("display", "none", "important");

    logger.style.setProperty("height","24px", "important");
    logger.style.setProperty("overflow","hidden", "important");

    logger.appendChild(body);

    // We want direct access to the elemtn holding the messages inside
    // LinternaMagica
    this.logger = body;

    return logger;
}

// The button/link in the header making the web log element visible
LinternaMagica.prototype.create_web_log_link = function(id)
{
    var log_link = document.createElement("a");

    log_link.setAttribute("title",
			  this._("Linterna Mágica error and debug messages"));
    log_link.setAttribute("href", "#");
    log_link.setAttribute("class", "linterna-magica-web-log-link");
    log_link.setAttribute("id",  "linterna-magica-web-log-link-"+id);
    log_link.textContent = this._("Debug messages");

    return log_link;
}

// Show or hide the web log
LinternaMagica.prototype.show_or_hide_web_log = function(event, element)
{
    event.preventDefault();

    // Get the element by Id. Finding the object by tag name is not
    // good idea when there are other objects in the header or in the
    // linterna-magica-<id> container.
    var id = element.getAttribute("id");
    // linterna-magica-logo-<integer>
    id = id.split("-");
    id = id[id.length-1];

    var log = document.getElementById("linterna-magica-web-log");

    // We have one log object for the entire LinternaMagica object.
    // On click event from the interface it is cloned/copied and
    // inserted in the linterna-magica-<id> container. Instead of
    // hiding it is removed. On next click it is copied again. This
    // way new messages from the log object will be visible.
    var local_log = log.cloneNode(true);

    var obj =  document.getElementById("linterna-magica-video-object-"+id);

    local_log.setAttribute("id","linterna-magica-web-log-clone-"+id);

    // The entire log 
    local_log.setAttribute("class", "linterna-magica-web-log-clone");
    // The header
    local_log.firstChild.
	setAttribute("class","linterna-magica-web-log-clone-header");
    // Body 
    local_log.lastChild.style.removeProperty("display");
    local_log.lastChild.setAttribute("class", "linterna-magica-web-"+
				     "log-clone-messages");

    local_log.style.setProperty("width", 
				obj.style.getPropertyValue("width"),
				"important");
    local_log.style.setProperty("height", 
				obj.style.getPropertyValue("height"),
				"important");

    local_log.style.setProperty("overflow", "auto", "important");

    var about = document.getElementById("linterna-magica-about-box-"+id);
    
    var updates = document.
	getElementById("linterna-magica-update-info-box-"+id);

    if (local_log)
    {
	// Ensure that the updates box is hidden.
	if (updates && !updates.style.display)
	{
	    updates.style.setProperty("display","none", "important");
	}

	// Ensure that the about box is hidden.
	if (about && !about.style.display)
	{
	    about.style.setProperty("display","none", "important");
	}

	if(local_log.style.display &&
	   !document.getElementById("linterna-magica-web-log-clone-"+id))
	{
	    obj.parentNode.appendChild(local_log);
	    obj.style.setProperty("display","none", "important");
	    local_log.style.removeProperty("display");
	}
	else
	{
	    var log = 
		document.getElementById("linterna-magica-web-log-clone-"+id);
	    log.parentNode.removeChild(log);
	    obj.style.removeProperty("display");
	}
    }
}
