//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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
// @source http://linternamagica.org

// END OF LICENSE HEADER

// Check for updates
LinternaMagica.prototype.check_for_updates = function()
{
    // Configured to not update
    // or the build is from Git
    if (this.updates == -1 || 
	/git/i.test(this.version))
    {
    	return  null;
    }
  
    if (this.check_for_updates_once)
    {
	return null;
    }

    // Prevent several video objects to call this and make a
    // mess. Only the first one will execute the code.
    this.check_for_updates_once = true;

    

    var updates_mul;
    var in_seconds ;

    if (/d$/i.test(this.updates))
    {
	updates_mul = parseInt(this.updates.split('d')[0]);
	in_seconds = 60*60*24;
    }
    else if (/w$/i.test(this.updates))
    {
	updates_mul = parseInt(this.updates.split('w')[0]);
	in_seconds = 60*60*24*7;
    }
    else if (/m$/i.test(this.updates))
    {
	updates_mul = parseInt(this.updates.split('m')[0]);

	// FIXME ? Not every moth have 31 days. Does it matter?
	in_seconds = 60*60*24*7*31;
    }
    else if (/y$/i.test(this.updates))
    {
	updates_mul = parseInt(this.updates.split('y')[0]);
	in_seconds = 60*60*24*365;
    }

    var update_date = 
	new Date(parseInt(this.release_date)*1000);

    // Check plus one and two days after the exact match. Someone
    // might not use it for a day and miss the update.
    var plus_day = 60*60*24;
    var plus_two_days = 2*plus_day;
    var update_date_d1 = 
	new Date((parseInt(this.release_date)+plus_day)*1000);
    var update_date_d2 = 
    new Date((parseInt(this.release_date)+plus_two_days)*1000);

    var now = new Date();
    var date_diff =  now - update_date;

    // Check plus one and two days after the exact match. Someone
    // might not use it for a day and miss the update.
    var d1_diff = now - update_date_d1;
    var d2_diff = now  - update_date_d2;

    // If there is remainder, it is not time to check for updates
    if ((Math.floor(date_diff/1000/(in_seconds)) % updates_mul) &&
	(Math.floor(d1_diff/1000/(in_seconds)) % updates_mul) && 
	(Math.floor(d2_diff/1000/(in_seconds)) % updates_mul))
    {
	return null;
    }
  
    var script = document.createElement("script");
    script.setAttribute("defer", "defer");
    script.setAttribute("async", "async");
    script.setAttribute("src", this.updates_page);

    document.getElementsByTagName("head")[0].appendChild(script);
    script.parentNode.removeChild(script);

    var self = this;

    this.updates_counter = 0;
    this.updates_timer_id = setInterval(
	function()
	{
	    // 250 mS * 80 = 20 sec
	    if (self.updates_counter > 80)
	    {
		clearInterval(self.updates_timer_id);
	    }

	    if (window.LinternaMagica)
	    {
		var updates = window.LinternaMagica.updates;
		delete window.LinternaMagica;
		clearInterval(self.updates_timer_id);
		self.parse_updated_version_data.apply(self,[updates]);
	    }
	    self.updates_counter ++;
	}, 250);
}

// Get the new version data at window.location#<data> set by the child
// "frame" (object)
LinternaMagica.prototype.parse_updated_version_data = function(data)
{
    var new_release_date = new Date(data.date * 1000);
    var current_release_date  = new Date(this.release_date*1000);

    if ( new_release_date > current_release_date )
    {

	var date = data.date;

	// *** JavaScript demands mS! ***
	date = new Date (parseInt(date)*1000);

	var format_date = date.toString().replace(/[0-9]+:[0-9]+.*/,"");
	
	// 0 - day name ; 1 - Month ; 2 - day of month; 3 - year
	// 0 - Mon, Tue, Wed, Thu, Fri, Sun, Sat
	// 1 - Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct,
	// Noe, Dec
	format_date = format_date.split(" ");

	// To be used by other functions
	this.updates_data = new Object();
	this.updates_data.date = date;
	this.updates_data.version = data.version;
	this.updates_data.format_date = format_date;

	// Show the notifier in the controls
	var notifier_buttons = 
	    document.querySelectorAll('.linterna-magica-update-'+
				      'notifier-link');

	for(var i=0, l=notifier_buttons.length; i<l; i++)
	{
	    var button = notifier_buttons[i];
	    button.style.removeProperty("display");
	    button.setAttribute("title",
				this._("New version")+
				": "+data.version+". "+this._("Date")+": "+
				this._(format_date[2]) + " "+
				this._(format_date[1]) + " " +
				this._(format_date[3]));
	    var id = button.getAttribute("id").split(/-/);
	    id = id[id.length-1];

	    var video_object = this.get_video_object(id);
	    var heigh = this.extract_object_height(video_object);
	    var info_box = 
		document.getElementById("linterna-magica-"+
					"update-info-box-"-id);

	    if (!info_box)
	    {
		var info_box = this.create_update_info_box(id,video_object);
		var lm = document.getElementById("linterna-magica-"+id);
		if (lm)
		{
		    lm.appendChild(info_box);
		}
	    }
	}

	var side_button = this.create_side_update_notifier_button();
    }
}


// Create a notifier for the user in the header
LinternaMagica.prototype.create_update_notifier_link = function(id)
{
    var title = 
	this._("New version");

    if (this.updates_data)
    {
	var date = this.updates_data.date;
	var version = this.updates_data.version;
	var format_date =  this.updates_data.format_date;

	title +=
	": "+version+". "+this._("Date")+": "+
	    this._(format_date[2]) + " "+
	    this._(format_date[1]) + " " +
	    this._(format_date[3]);
    }
    
    var notifier = document.createElement("a");

    notifier.setAttribute("title", title);
    notifier.setAttribute("href", "#");
    notifier.setAttribute("class", "linterna-magica-update-notifier-link ");
    notifier.setAttribute("id",  "linterna-magica-update-"+
					  "notifier-link-"+id);
    notifier.textContent = this._("Update");

    return notifier;
}

//  Information to be showed when the notifier link about updates in
//  the header is clicked
LinternaMagica.prototype.create_update_info_box = function(id, object_height)
{
    var date = this.updates_data.date;
    var version = this.updates_data.version;
    var format_date =  this.updates_data.format_date;

    var div = document.createElement("div");
    div.style.setProperty("display", "none", "important");
    div.setAttribute("class", "linterna-magica-update-info-box");
    div.setAttribute("id", "linterna-magica-update-info-box-"+id);

    div.style.setProperty("height", 
			  // The about box and the update info box
			  // have 20px top and bottom padding
			  parseInt(object_height-40)+"px",
			  "important");

    // Other 
    var p = document.createElement('p');
    var t = document.createTextNode(this._("New version is available."));
    p.appendChild(t);
    div.appendChild(p);

    p = document.createElement('p');
    t = document.createTextNode(
	"Linterna Mágica"+" "+version+
	    " "+this._("released at")+" "+this._(format_date[2]) + " "+
 	    this._(format_date[1]) + " "+this._(format_date[3]));
    p.appendChild(t);
    div.appendChild(p);

    var a = this.pack_external_link(
	this.homepage+"/#news",
	this._("Read the news section at the home page"));

    p = document.createElement('p');
    p.appendChild(a);
    div.appendChild(p);

    return div;
}

// Information for updates
LinternaMagica.prototype.show_or_hide_update_info = function(event, element)
{
    if (event)
    {
	event.preventDefault();
    }

    // Get by Id. Finding the object by tag name is not good idea when
    // there are other objects in the header.
    var id = element.getAttribute("id");
    // linterna-magica-logo-<integer>
    id = id.split("-");
    id = id[id.length-1];

    var obj =  document.getElementById("linterna-magica-video-object-"+id);

    var updates = document.
	getElementById("linterna-magica-update-info-box-"+id);

    var about = document.
	getElementById("linterna-magica-about-box-"+id);

    if (updates)
    {
	// Ensure that the about box is hidden.
	if (about && !about.style.display)
	{
	    about.style.setProperty("display","none", "important");
	}

	if (updates.style.display)
	{    
	    updates.style.removeProperty("display");
	    this.hide_lm_video_object(id);
	}
	else
	{
	    updates.style.setProperty("display","none", "important");
	    this.show_lm_video_object(id);
	}
    }
}

LinternaMagica.prototype.create_side_update_notifier_button = function()
{
    var side_button = document.createElement("p");
    side_button.setAttribute('class', 'linterna-magica-side-update-notifier-button-wrap');
    side_button.setAttribute('id', 'linterna-magica-side-update-notifier-button-wrap');

    var logo = this.create_side_update_notifier_link();
    logo.textContent = '';
    logo.setAttribute('class',
		      'linterna-magica-side-update-notifier-button');
    
    side_button.appendChild(logo);

    var update_icon = document.createElement('span');
    update_icon.setAttribute('class', 'linterna-magica-side-update-'+
			     'notifier-button-update-icon');

    logo.appendChild(update_icon);

    var close = this.create_side_update_notifier_close_link();

    side_button.appendChild(close);

    close.addEventListener("click", this.remove_side_update_notifier, false);

    document.body.appendChild(side_button);
}

// The button/link in the header making the web log element visible
LinternaMagica.prototype.create_side_update_notifier_link = function()
{
    var date = this.updates_data.date;
    var version = this.updates_data.version;
    var format_date =  this.updates_data.format_date;

    var update_info =
	this._("New version is available.")+"\n"+
	"Linterna Mágica"+" "+version+
	" "+this._("released at")+" "+this._(format_date[2]) + " "+
 	this._(format_date[1]) + " "+this._(format_date[3])+"\n"+
	this._("Read the news section at the home page");

    var link = this.pack_external_link(
	this.homepage+"/#news",
	update_info);

    link.setAttribute("title", update_info);

    return link;
}

LinternaMagica.prototype.create_side_update_notifier_close_link = function()
{
    var close = document.createElement("a");
    close.textContent="x";
    close.setAttribute("href", "#");
    close.setAttribute("class", "linterna-magica-side-update-"+
		       "notifier-button-close")
    close.setAttribute("title", this._("Remove update notifier"));

    return close;
} 

LinternaMagica.prototype.remove_side_update_notifier = function(event, element)
{
    var update_notifier = 
	document.getElementById('linterna-magica-side-update-'+
				'notifier-button-wrap');

    if (!update_notifier)
    {
	return null;
    }

    update_notifier.parentNode.removeChild(update_notifier);
}
