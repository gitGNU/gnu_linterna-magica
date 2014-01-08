//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
//  Copyright (C) 2013, 2014 Ivaylo Valkov <ivaylo@e-valkov.org>
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
// @source http://linternamagica.org

// END OF LICENSE HEADER

// Linterna Mágica constructor
function LinternaMagica(params)
{
    // FIXME: This might be used in a frame and after the object is
    // replaced, everithing else to be removed leaving only the
    // video. This way it might be possible to play videos from remote
    // sites in Epiphany (no GM_ API and xmlHttpReqeust is restricted to
    // the same origin).
        
    if (window.top != window.self)
    {
	this.log("LinternaMagica.constructor:\n"+
		 "Skipping (i)frame with address: "+
		 window.location,1);
	return null;
    }

    // The code above should be executed before the web logger
    // element. Otherwise it is created and visible in iframes and
    // objects that are used to embed clips in remote sites.

    this.set_locale(params.locale);

    // Could be a string, but we need integer.
    this.debug_level = parseInt(params.debug);

    this.set_web_log_expand(params.web_log_expand);

    if (this.debug_level && params.log_to == "web")
    {
	var logger = this.create_web_logger();
	this.log_to = "web";

	if (!logger)
	{
	    this.log_to = "console";
	}

	var body = document.getElementsByTagName("body")[0];
	if (!body)
	{
	    this.log_to = "console";
	}
	else
	{
	    body.appendChild(logger);
	}
    }
    else
    {
	this.log_to = "console";
    }

    var self = this;
    var val = this.call_site_function_at_position.apply(self,[
	"before_options_init",
	window.location.hostname]);
    if (!val)
    {
	return null;
    }

    // Do not change order
    this.check_flash_plugin();
    this.set_priority(params.priority);
    this.set_autostart(params.autostart);
    this.set_controls(params.controls);
    this.set_cookies(params.cookies);
    this.set_wait_xhr(params.wait_xhr);
    this.set_check_updates(params.updates);
    this.set_hd_link_quality(params.quality);
    this.set_format(params.format);

    // check_for_updates() MUST be called only if there is video object
    // found. The only place where the user can be informed is in the
    // interface. It is not a good idea to fetch the updates.js script
    // (with JSONP data) on every page. check_for_updates() is called
    // in create_video_object().

    // Examine the option for updates and check if necessary.
    this.updates_data = null;
    this.check_for_updates();

    // Add the style sheet to the head of the document.
    this.create_stylesheet();

    // Video flash objects counter. Counting starts from zero for the
    // first found object with the first increment.
    this.found_flash_video_objects = -1;

    // Object holding data for curently processed video ids with
    // XMLHttpRequest. Keys video_id+host , values 1/0.
    // Prevent creation of two video objects in YouTube 
    this.requested_ids =new Object();

    if (this.controls)
    {
	// setInterval ids for the video time position counter function
	this.player_timers = new Array();

	// setTimout ids that hide the volume sliders
	this.volume_slider_timers = new Array();
    }
 
    var position_function = null ;
    if (this.plugin_is_installed)
    {
	position_function = "flash_plugin_installed";
    }
    else
    {
	position_function = "no_flash_plugin_installed";
    }

    var self = this;
    var val = this.call_site_function_at_position.apply(self,[
	position_function,
	window.location.hostname]);
    
    if (!val)
    {
	return null;
    }

    this.log("LinternaMagica.constructor:\n"+
	     "Adding DOM event listener for inserted node.",1);

    // Work-around for FlashBlock && Installed plugin (some sites remove
    // the scripts while insrting the object, so we cannot extract the
    // information.
    var self = this;

    var body = document.getElementsByTagName("body")[0];

    // Exit if the body is not found (Sometimes an error occurrs while
   //  adding the event listener)
   //  ** Message: console message: undefined @161: TypeError: Result of
   // expression 'body' [undefined] is not an object.**
    if (!body)
	return;

    // This way it can be removed somewhere if needed. Currentlu not
    // used;
    this.inserted_node_listener =  function(ev)
			  {
			      var el = this;
			      self.if_node_is_inserted.
				  apply(self, [ev, el]);
			  };

    body.addEventListener("DOMNodeInserted",  
			  this.inserted_node_listener, true);

    this.log("LinternaMagica.constructor:\n"+
	     "Checking DOM for objects",1);

    this.extract_objects_from_dom(document);
}

LinternaMagica.prototype = new Object ();
LinternaMagica.constructor = LinternaMagica;

LinternaMagica.prototype.version = "@VERSION@";
LinternaMagica.prototype.name =  "Linterna M\u00e1gica";

// Release date string in POISIX time format (date +"%s")
// FIXME: Add real string
LinternaMagica.prototype.release_date = "1299248757";

// The URL with information about the latest version. Must
// return JSONP data:
// linterna_magica_latest_version({
//    date: <release date>, // string in POISIX time format (date +"%s")>
//    version: <version>,  // string 
//});
LinternaMagica.prototype.updates_page =
    "http://linternamagica.org/downloads/updates.js";
//    "http://localhost/lm/downloads/updates.js";

// When this is a function the internal _() function could be used.
LinternaMagica.prototype.description = function()
{
    return (
	this._("Watch video on the web ")+
	    this._("in a brand new way: ")+
	    this._("You don't need a glint, ")+
	    this._("the magic lantern is ignited!")
    );
}

// When this is a function the internal _() function could be used.
LinternaMagica.prototype.license = function()
{
    return (
	this._("This program is free software; ")+
	    this._("you can redistribute it and/or ")+
	    this._("modify it under the terms of the ")+
	    this._("GNU  General Public License (GNU GPL)")+
	    this._(" version 3 (or later). ")+
	    this._("A copy of the license can be downloaded from ")
    );
}

// Two control bars (2x24)
// One HD links buttom (1x24)
// One logo button (1x116)
// One close button after the logo (1x24) 
LinternaMagica.prototype.absolute_min_height = 212;


LinternaMagica.prototype.absolute_min_width = 300;
LinternaMagica.prototype.min_width = 400;

// One close button (1x24)
// One logo button (1x146)
// 1px border
LinternaMagica.prototype.min_remote_object_height = 169;

LinternaMagica.prototype.license_link =
    "https://www.gnu.org/licenses/gpl.html";

LinternaMagica.prototype.homepage = 
    "http://linternamagica.org";
// "http://localhost/lm";

LinternaMagica.prototype.savannah_page =
    "https://savannah.nongnu.org/projects/linterna-magica";

LinternaMagica.prototype.bug_report_link = 
    "https://sv.nongnu.org/bugs/?func=additem&amp;group=linterna-magica";

LinternaMagica.prototype.microblog_link =
    "https://identi.ca/valkov";
   // Identi.ca does not support groups as of pump.io migration.
   // "https://identi.ca/group/linternamagica";

LinternaMagica.prototype.chat_rooms = function()
{
    var rooms = new Array();

    var room = new Object();
    room.type = "IRC";
    room.room = "#linternamagica";
    room.url = "ircs://irc.freenode.net:6697/linternamagica";
    room.server = "freenode.net";
    rooms.push(room);

    var room = new Object();
    room.type = "Jabber/XMPP";
    room.room = "linternamagica@conference.jabber.org";
    room.url = "xmpp:linternamagica@conference.jabber.org?join";
    room.server = "jabber.org";
    rooms.push(room);

    return rooms;
};


// This is filled during build from the Makefile
LinternaMagica.prototype.copyrights = new Array();
LinternaMagica.prototype.copyrights.push("Copyright (C) 2010, 2011, 2012 "+
					 " Ivaylo Valkov <ivaylo@e-valkov.org>");
LinternaMagica.prototype.copyrights.push("Copyright (C) 2013, 2014 "+
					 "Ivaylo Valkov <ivaylo@e-valkov.org>");

LinternaMagica.prototype.copyrights.push("Copyright (C) 2010, 2011, 2012,"+
					 " 2013 Anton Katsarov <anton@katsarov.org>");

// This object holds all the functions to control
// the playback via web controls
LinternaMagica.prototype.player = new Object();

// Find which video plugin is in use and
// set some variables and texts
// (player_name, volume)
LinternaMagica.prototype.player.init = function(id)
{
    this.player.set_player_name.apply(this,[id]);
    var self = this;

    var started_clip = this.find_started_clip();

    // Start the clip, if no other clip is playing or the started
    // clip is this one.
    if (this.autostart &&
	(started_clip == null || started_clip == id))
    {
	// Sometimes it skips seconds if the
	// interval is 1sec
	this.player_timers[id] = 
	    setInterval(function()
			{
			    self.ticker.apply(self,[id]);
			}, 500);
    }
    
    var volume_interval_function =    function()
    {
	var knob =
	    document.getElementById("linterna-magica-controls-"+
				    "volume-slider-knob-"+id);

	if (!knob)
	{
	    return null;
	}

	var slider = knob.parentNode;
	var vol = null;

	var video_object = self.get_video_object(id);

	var player_name = video_object.getAttribute("player_name");

	if (/gecko/i.test(player_name)
	    || /quicktime plug-in/i.test(player_name))
	{
	    try
	    {
		vol = video_object.GetVolume();

		if (/quicktime/i.test(player_name))
		{
		    // totemNarrowspace uses 255 as max
		    // calculate as 100 %
		    vol = parseInt(vol * 100/255);
		}
	    }
	    catch(e)
	    {
	    }
	}
	else if (/vlc/i.test(player_name))
	{
	    if (video_object.audio)
	    {
		vol =
		    video_object.audio.
		    volume;
	    }
	}

	if (vol)
	{
	    var pos = 
		parseInt((slider.clientWidth*vol/100) -
			 knob.clientWidth-knob.clientWidth/2);

	    knob.style.setProperty("left", pos+"px", "important");

	    clearInterval(volume_interval);
	}
    }

    var volume_interval =
	setInterval(volume_interval_function, 800);
}

// Localization languages object
LinternaMagica.prototype.languages = new Object();

// No translation.
LinternaMagica.prototype.languages["C"] = 
    {
	__direction: "ltr",
	__translators: null,
    };

// Translatable strings extracted from variables, objects or pages
// that have to be present for intltool-update. This function is
// remove at runtime (or build time) to free memory. These strings are
// never used and accessed by calling this function. 
LinternaMagica.prototype.static_strings = function()
{
    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "01/28/2012" +"%b". It is part of a
    // release date. For example: 28 Jan 2012.
    this.N_("Jan");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "02/28/2012" +"%b". It is part of a
    // release date. For example: 28 Feb 2012.
    this.N_("Feb");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "03/28/2012" +"%b". It is part of a
    // release date. For example: 28 Mar 2012.
    this.N_("Mar");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "04/28/2012" +"%b". It is part of a
    // release date. For example: 28 Apr 2012.
    this.N_("Apr");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "05/28/2012" +"%b". It is part of a
    // release date. For example: 28 May 2012.
    this.N_("May");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "06/28/2012" +"%b". It is part of a
    // release date. For example: 28 Jun 2012.
    this.N_("Jun");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "07/28/2012" +"%b". It is part of a
    // release date. For example: 28 Jul 2012.
    this.N_("Jul");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "08/28/2012" +"%b". It is part of a
    // release date. For example: 28 Aug 2012.
    this.N_("Aug");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "09/28/2012" +"%b". It is part of a
    // release date. For example: 28 Sep 2012.
    this.N_("Sep");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "10/28/2012" +"%b". It is part of a
    // release date. For example: 28 Oct 2012.
    this.N_("Oct");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "11/28/2012" +"%b". It is part of a
    // release date. For example: 28 Noe 2012.
    this.N_("Noe");

    // TRANSLATORS: This is abbreviated month name. The same as
    // the output of date --date "12/28/2012" +"%b". It is part of a
    // release date. For example: 28 Dec 2012.
    this.N_("Dec");

    // TRANSLATORS: Add your name here and it will be visible in
    // the about box. One person per line.
    this.N_("__translators");

    // TRANSLATORS: This is the direction of the language you are
    // translating. It should be translated as "ltr" for left-to-right
    // languages and "rtl" for right-to-left languages. If you don't know
    // it is probably "ltr".
    this.N_("__direction");
};
