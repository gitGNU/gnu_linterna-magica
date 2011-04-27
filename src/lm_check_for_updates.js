//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011  Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Check for updates
LinternaMagica.prototype.check_for_updates = function()
{
    // Configured to not update
    // or the build is from SVN
    if (this.updates == -1 || 
	/svn/i.test(this.version))
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

    if (!this.updates_timeout)
    {
	this.updates_timeout_counter = 0;
	var self = this;

	// Polling. The data will be retrieved in the main window =>
	// the LinternaMagica object.
	this.updates_timeout = 
	    setInterval(function()
			{
			    self.parse_updated_version_data.apply(self);
			}, 10);
    }

    // The script is wrapped inside a data URI scheme. This way the
    // page where the user was (referrer) is not sent. Cross-domain
    // frame communcication with hashed messages
    // (original-link#message=) is used to access the data.
    var checker_frame = document.createElement("object");
    checker_frame.setAttribute("id", "linterna-magica-updates-checker");

    var frame_script = function()
    {
	window.linterna_magica_latest_version = function (data)
	{
	    var hash = /#/i.test(receiver_location) ? "" : "#";

	    window.parent.location = decodeURI(receiver_location)+hash+
		encodeURI("&linterna_magica&lm_version="+data.version+
			  "&lm_date="+data.date+"&linterna_magica");
	};
    };

    var frame_data = 
	"<html><head>"+
	"<script async='async' defer='defer' type='text/javascript'>"+
	"var receiver_location='"+
	encodeURI(window.location)+"';("+frame_script.toString()+")();"+
	"</script>"+
	"<script async='async' defer='defer' type='text/javascript' src='"+
	this.updates_page+"'>"+
	"</script>"+
	"</head><body></body></html>";

    checker_frame.setAttribute("data",
			       "data:text/html;charset=UTF-8;base64,"+
			       btoa(frame_data));

    checker_frame.setAttribute("width","1px");
    checker_frame.setAttribute("height", "1px");

    document.getElementsByTagName("body")[0].appendChild(checker_frame);
}

// Get the new version data at window.location#<data> set by the child
// "frame" (object)
LinternaMagica.prototype.parse_updated_version_data = function()
{
    this.updates_timeout_counter++;

    // With default timeout 10mS this will be 10 sec. Stop
    // checking. Something must be wrong.
    if (this.updates_timeout_counter >= 10000)
    {
	clearInterval(this.updates_timeout);
    }

    if (/linterna_magica/i.test(window.location))
    {
	clearInterval(this.updates_timeout);
	var data  = window.location.toString().split("&linterna_magica");

	// Clear our data from the address field
	window.location = data[0]+data[data.length-1];
	
	// Cleanup the checker object/frame
	var o = document.getElementById("linterna-magica-updates-checker");
	if (o)
	{
	    o.parentNode.removeChild(o);
	}

	
	var version = data[1].split("lm_version=")[1].split("&")[0];

	if ( version != this.version)
	{

	    var date = data[1].split("lm_date=")[1];

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
	    this.updates_data.version = version;
	    this.updates_data.format_date = format_date;


	    var self = this;
	    // Add notifier in the headers of all video objects 
	    for (var n=0; n< this.dirty_objects.length; n++)
	    {
		// header
		var h = document.getElementById("linterna-magica-header-"+n);

		// container 
		var lm = document.getElementById("linterna-magica-"+n);

		if (h && lm)
		{

		    var notifier = this.create_update_notifier_link(n);
		    var update_info = this.create_update_info_box(n);

		    var notifier_click_function = function(ev)
		    {
			var el = this;
			self.show_or_hide_update_info.apply(self, [ev, el]);
		    };

		    notifier.addEventListener("click",
					      notifier_click_function,
					      false);

		    h.appendChild(notifier);
		    lm.appendChild(update_info);
		}
	    }
	}
    }
}

// Create a notifier for the user in the header
LinternaMagica.prototype.create_update_notifier_link = function(id)
{
    var date = this.updates_data.date;
    var version = this.updates_data.version;
    var format_date =  this.updates_data.format_date;

    var title = 
	this._("New version")+
	": "+version+". "+this._("Date")+": "+this._(format_date[2]) + " "+
	this._(format_date[1]) + " " + this._(format_date[3]);
    
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
LinternaMagica.prototype.create_update_info_box = function(id)
{
    var date = this.updates_data.date;
    var version = this.updates_data.version;
    var format_date =  this.updates_data.format_date;

    var div = document.createElement("div");
    div.style.setProperty("display", "none", "important");
    div.setAttribute("class", "linterna-magica-update-info-box");
    div.setAttribute("id", "linterna-magica-update-info-box-"+id);

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
    event.preventDefault();

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

    var local_log = 
	document.getElementById("linterna-magica-web-log-clone-"+id);

    if (updates)
    {
	// Ensure that the about box is hidden.
	if (about && !about.style.display)
	{
	    about.style.setProperty("display","none", "important");
	}

	// Ensure that the web log  box is hidden/removed.
	if (local_log)
	{
	    obj.parentNode.removeChild(local_log);
	}

	if (updates.style.display)
	{
	    updates.style.removeProperty("display");
	    obj.style.setProperty("display","none", "important");
	}
	else
	{
	    updates.style.setProperty("display","none", "important");
	    obj.style.removeProperty("display");
	}
    }
}
