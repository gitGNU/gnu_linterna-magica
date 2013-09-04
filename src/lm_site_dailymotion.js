//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012, 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Extract data for dailymotion video links
LinternaMagica.prototype.extract_dailymotion_links = function(data)
{
    // Dailymotion links could be extracted via JSON call at
    // http://www.dailymotion.com/json/video/<video_id>. To get the
    // links one must use set a "fields" field for example to
    // "stream_ogg_url,stream_h264_sd_url,stream_h264_hq_url".  When
    // set and used with callback field the server returns an error
    // 500. Without the callabck function the results from JSON
    // requests are useless.

    var links_re = new RegExp (
	"video_url"+
	    "(\\\"|\\\')*\\\s*(\\\=|\\\:|\\\,)\\\s*(\\\"|\\\')*"+
	    "(.*(\\\?auth\\\=[A-Za-z0-9\\\-\\\.]+)"+
	    "(\\\&|\\\"|\\\'){1})\\\,{1}",
	"i");

    var link = unescape(data).match(links_re);

    if (!link || !link[0])
    {
	return null;
    }

    link = link[0].split(":");

    if (!link || !link[1])
    {
	return null;
    }

    link = link[1].split(",");

    if (!link || !link[0])
    {
	return null;
    }

    link = link[0].split("\"");

    if (!link || !link[1])
    {
	return null;
    }

    link = unescape(link[1]);

    this.log("LinternaMagica.create_youtube_links:\n"+
	     "Extracted link  : "+link,4);

    return link;
}

LinternaMagica.prototype.sites["dailymotion.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.dailymotion.com"] = "dailymotion.com";

LinternaMagica.prototype.sites["dailymotion.com"].no_flash_plugin_installed =
function()
{
    var data = new Object();
    data.video_id = window.location.pathname;

    if (this.wait_xhr)
    {
    	this.log("LinternaMagica.extract_objects_from_dom:\n"+
    		 "Waiting "+this.wait_xhr+
    		 " ms ("+(this.wait_xhr/1000)+
    		 " s) before requesting video link via"+
    		 " video_id "+data.video_id+" ",1);

    	var self = this;
    	setTimeout(function() {
    	    self.request_video_link.apply(self,[data]);
    	}, this.wait_xhr);
    }
    else
    {
	this.request_video_link(data);
    }

    return true;
}

LinternaMagica.prototype.sites["dailymotion.com"].do_not_force_iframe_detection =
function()
{
    // If Flashblock is installed, it will replace an iframe that has
    // something to do with Twitter. We have to replace the Flashblock
    // blocked object. Returning, false will make the logic in
    // lm_detect_flash.js not detect the iframe as swf.
    return false;
}

LinternaMagica.prototype.sites["dailymotion.com"].skip_link_extraction = 
function()
{
    return false;
}

LinternaMagica.prototype.sites["dailymotion.com"].
    libswfobject_skip_video_id_extraction =
function()
{
    this.log("LinternaMagica.sites.libswfobject_skip_video_"+
	     "id_extraction:\n"+
	     "Video id forced to "+window.location.pathname,1);

    return window.location.pathname;
}

LinternaMagica.prototype.sites["dailymotion.com"].prepare_xhr =
function(object_data)
{
    var result = new Object();

    // The video_id is forced to an address. See
    // LinternaMagica.prototype.sites["dailymotion.com"].
    // libswfobject_skip_video_id_extraction
    result.address = object_data.video_id;

    return result;
}

LinternaMagica.prototype.sites["dailymotion.com"].process_xhr_response =
function(args)
{
    var client = args.client;
    var object_data = args.object_data;

    // With flash plugin installed there might be a DOM object that
    // holds the flash player
    var dom_object = document.getElementById("video_player_main");

    if (dom_object)
    {
	object_data.linterna_magica_id =
	    this.mark_flash_object(dom_object);
    }
    else
    {
	object_data.linterna_magica_id =
	    this.mark_flash_object("extracted-from-script");

    }

    // !this.plugin_is_installed is removed so it could work when
    //  plugin is installed and HTML5 is active.
    if (!object_data.linterna_magica_id && 
	!object_data.parent)
    {
	// In Dailymotion the script that creates the flash
	// object replaces itself. The work around here is to
	// request the page and process it. 

	// Dailymotion uses pseudo-random ids for some DOM elements of
	// interest. Custom function to match the parent by CSS class
	// is used, because getElementById does not support regular
	// expressions.

	object_data.parent = 
	    this.get_first_element_by_class("dmpi_video_playerv[0-9]+");

	if (!object_data.parent)
	{
	    return null;
	}

	object_data.width = object_data.parent.clientWidth ? 
	    object_data.parent.clientWidth : object_data.offsetWidht ?
	    object_data.offsetWidht : null ;

	object_data.height = object_data.parent.clientHeight ? 
	    object_data.parent.clientHeight : object_data.offsetWidht ?
	    object_data.offsetWidht : null ;
    }

    object_data.link = this.extract_dailymotion_links(client.responseText);


    if (!object_data.width || !object_data.height || !object_data.link)
    {
	return null;
    }

    return object_data;
}

LinternaMagica.prototype.sites["dailymotion.com"].css_fixes =
function(object_data)
{
    var parent = object_data.parent;
    parent.style.setProperty("margin-bottom", "30px", "important");

    var html5_error = 
	this.get_first_element_by_class("error_screen");

    if (html5_error)
    {
	var lm = document.getElementById("linterna-magica-"+
					 object_data.linterna_magica_id);
	// Hide the error screen when the LM wrapper is visible
	if (lm && !lm.style.display)
	{
	    html5_error.style.setProperty("display", "none", "important");
	}
    }

    return null;
}

LinternaMagica.prototype.sites["dailymotion.com"].skip_flowplayer_links_fix =
function(object_data)
{
    // Must return false to skip the fix.
    return false;
}

LinternaMagica.prototype.sites["dailymotion.com"].custom_html5_player_finder =
function(parent)
{
    var html5_player_element = null;

    if (parent.hasAttribute("id"))
    {
	var token = parent.getAttribute("id").split("_");

	if (token && token[1])
	{
	    html5_player_element = 
		document.getElementById("container_player_"+token[1]);
	}
    }

    return html5_player_element;
}


LinternaMagica.prototype.sites["dailymotion.com"].flash_plugin_installed = 
function()
{
    return this.sites["dailymotion.com"].
	no_flash_plugin_installed.apply(this,[arguments]);
}
