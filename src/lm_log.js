//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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
// @source http://linterna-magica.nongnu.org

// END OF LICENSE HEADER

// Log information to the console or the web logger. For debugging
// purposes.
LinternaMagica.prototype.log = function(message, level)
{
    // No debug set by the user
    if (!this.debug_level || this.disabled_log)
    {
	return;
    }

    if (!level)
    {
	level = 1;
    }

    if (this.debug_level >= level)
    {
	// Simple log/debug
	// console.log(window.location.hostname+": "+message);

	// Extra debug with time (useful when the script bloats the
	// browser)
	var date = new Date();
	var str =  [date.getHours(), date.getMinutes(),
		    date.getSeconds(), date.getMilliseconds()].join(":");
	var host_get = window.self;
	var host = host_get.location.hostname;

	var indent = "";

	if (this.log_to != "web")
	{
	    for (var i=0, l=level; i<l; i++)
	    {
		indent += "\t";
	    }
	}

	var log_string = message + " at "+host + " time: "+str;
	var level_string =  " ("+level+") ";

	log_string = log_string.replace(/^/g, indent+level_string).
	    replace(/\n/g, "\n"+indent+level_string);

	try
	{
 	    if (this.log_to == "web")
 	    {
 		var row = document.createElement('p');
 		row.setAttribute("class", 
				 "linterna-magica-log-to-web-message");

		var lines = log_string.split(/\n/);
 		var t = document.createTextNode(lines[0]);
 		row.appendChild(t);

		for (var i=1,l=lines.length; i<l; i++)
		{
		    var span = document.createElement("span");
		    var t = document.createTextNode(lines[i]);
		    span.appendChild(t);
		    row.appendChild(span);
		}

		row.style.setProperty("margin-left", 
				      parseInt(3.5*level)+"px", "important");

		//  The start color is #888888 rgb (136,136, 136).
		//  Every next log level is two shades ( -32) darker
		var bg_color = parseInt(136 - 32*level);

		row.style.setProperty("background-color", 
				      "rgb("+bg_color+","+bg_color+","+
				      bg_color+")", "important");

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
		console.log(log_string);
	    }
	    catch(e)
	    {
		this.disabled_log = true;
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
    
    if (!logger)
    {
	this.log("LinternaMagica.create_web_logger:\n"+
		 "Unable to create web log. Will log to console.",1);
	return null;
    }

    var debug_button = document.createElement("p");
    debug_button.setAttribute('class', 'linterna-magica-web-log-debug-button-wrap');
    debug_button.setAttribute('id', 'linterna-magica-web-log-debug-button-wrap');

    var logo = this.create_web_log_link();
    logo.textContent = '';
    logo.setAttribute('class',
		      'linterna-magica-web-log-debug-button');
    
    debug_button.appendChild(logo);

    logo.addEventListener('click', this.show_or_hide_web_log, true);

    var bug = document.createElement('span');
    bug.setAttribute('class', 'linterna-magica-web-log-debug-button-bug');

    logo.appendChild(bug);

    var close = this.create_web_log_close_link();
    close.setAttribute('class',
		       'linterna-magica-web-log-debug-button-close');

    debug_button.appendChild(close);

    close.addEventListener('click', this.remove_web_log, true);

    document.body.appendChild(debug_button);

    var header = document.createElement("div");
    header.setAttribute("class",
			"linterna-magica-web-log-header");
    header.setAttribute('title', this._('Double-click to change the size'));

    var p = document.createElement("p");

    var bug_header = this.create_web_log_link();

    bug_header.setAttribute("class", 
			  "linterna-magica-web-log-link "+
			   " linterna-magica-web-log-left-buttons");
    bug_header.setAttribute('title', this._('Click to change the size'));

    bug_header.addEventListener('click',this.change_web_log_height, false);

    p.appendChild(bug_header);

    var txt = document.createTextNode(this._(
	"Linterna Mágica error and debug messages"));

    p.appendChild(txt);
    header.appendChild(p);

    var close = this.create_web_log_close_link();
   
    p.appendChild(close);
    
    close.addEventListener("click", this.remove_web_log, false);

    var collapse_log = document.createElement("a");
    collapse_log.textContent="-";
    collapse_log.setAttribute("href", "#");
    collapse_log.setAttribute("title", this._("Hide debug messages"));
    collapse_log.setAttribute("class", "linterna-magica-web-log-collapse "+
			      " linterna-magica-web-log-right-buttons");
    p.appendChild(collapse_log);
    
    collapse_log.addEventListener("click",
				   this.show_or_hide_web_log, false);

    header.addEventListener('dblclick',this.change_web_log_height, false);
    
    logger.appendChild(header);

    var body  = document.createElement("div");
    body.setAttribute("id", "linterna-magica-web-log-messages");
    body.setAttribute("class", "linterna-magica-web-log-messages");
    body.setAttribute('title',
		      this._("Ctrl+double-click to select all messages"));

    var self = this;
    var body_click_function = function(ev)
    {
	var el = this;
	self.select_all_text_in_element.apply(self, [ev, el]);
    };

    body.addEventListener('dblclick',body_click_function, true);

    logger.appendChild(body);

    // We want direct access to the elemtn holding the messages inside
    // LinternaMagica
    this.logger = body;
    this.logger_with_header = logger;

    if (this.web_log_expand)
    {
	debug_button.style.setProperty("display", "none", "important");
	logger.style.removeProperty("display");
    }
    else
    {
	logger.style.setProperty("display", "none", "important");
	debug_button.style.removeProperty("display");
    }

    return logger;
}

// The button/link in the header making the web log element visible
LinternaMagica.prototype.create_web_log_link = function()
{
    var log_link = document.createElement("a");

    log_link.setAttribute("title",
			  this._("Linterna Mágica error and debug messages"));
    log_link.setAttribute("href", "#");
    log_link.textContent = this._("Debug messages");

    return log_link;
}

LinternaMagica.prototype.create_web_log_close_link = function()
{
    var close = document.createElement("a");
    close.textContent="x";
    close.setAttribute("href", "#");
    close.setAttribute("class", "linterna-magica-web-log-close "+
		       " linterna-magica-web-log-right-buttons");
    close.setAttribute("title", this._("Remove log"));

    return close;
}

// Show or hide the web log
LinternaMagica.prototype.show_or_hide_web_log = function(event, element)
{
    event.preventDefault();

    var logger = document.getElementById('linterna-magica-web-log');
    var debug_button = document.
	getElementById('linterna-magica-web-log-debug-button-wrap');

    if (!logger || !debug_button)
    {
	return null;
    }

    var visible_logger = logger.style.getPropertyValue('display');
    
    if (visible_logger)
    {
	debug_button.style.setProperty("display", "none", "important");
	logger.style.removeProperty("display");
    }
    else
    {
	logger.style.setProperty("display", "none", "important");
	debug_button.style.removeProperty("display");
    }
}

// Remove the web log from the page
LinternaMagica.prototype.remove_web_log = function(event, element)
{
    var logger = document.getElementById('linterna-magica-web-log');
    var debug_button = document.
	getElementById('linterna-magica-web-log-debug-button-wrap');

    if (!logger || !debug_button)
    {
	return null;
    }

    debug_button.parentNode.removeChild(debug_button);
    logger.parentNode.removeChild(logger);

    var log_buttons = document.querySelectorAll('.linterna-magica-web-log-link');

    for(var i=0, l=log_buttons.length; i<l; i++)
    {
	var link = log_buttons[i];
	link.parentNode.removeChild(link);
    }
}

LinternaMagica.prototype.change_web_log_height = function(event, element)
{
    var logger = document.getElementById('linterna-magica-web-log');
    var body = document.getElementById('linterna-magica-web-log-messages');
    if(!logger || !body)
    {
	return null;
    }

    var is_max = logger.style.getPropertyValue('height');

    if (is_max)
    {
	logger.style.removeProperty('height');
	body.style.removeProperty('height');

    }
    else
    {
	logger.style.setProperty('height', '95%', 'important');
	body.style.setProperty('height', '95%', 'important');
    }
}

LinternaMagica.prototype.select_all_text_in_element =
function(event, element)
{
    if (!window.getSelection)
    {
	this.tripple_click = 0;
	return null;
    }

    if (event.ctrlKey)
    {
	var range = document.createRange();
	range.selectNode(element);
	window.getSelection().addRange(range);
    }
}
