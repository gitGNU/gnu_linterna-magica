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
// @source http://linterna-magica.nongnu.org

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
	"sdurl"+
	    "(\\\"|\\\')*\\\s*(\\\=|\\\:|\\\,)\\\s*(\\\"|\\\')*"+
	    "(.*(\\\?auth\\\=[A-Za-z0-9\\\-\\\.]+)"+
	    "(\\\&|\\\"|\\\'){1})\\\,{1}",
	"i");

    var links = unescape(data).match(links_re);

    if (links && links[0])
    {
	// There is not data after the last comma, it is end-of-match.
	links =  links[0].replace(/,$/, "").split(/,/);

	var hd_links = new Array();

	for (var lnk=0; lnk<links.length; lnk++)
	{
	    var link = new Object();
	    var link_data = links[lnk];

	    link.label = link_data.match(/\w+-\d+x\d+/i);
	    link.url =  link_data.replace(/\\\//g, "/").replace(
		    /(\"\s*:\s*\")|(\"\s*|,\s*\")|hdurl|hqurl|sdurl|\}/ig,
		"").replace(/hd720url|hd1080url/ig,"");

	    this.log("LinternaMagica.extract_dailymotion_links:\n"+
		     "Extracted link  : "+link.url,4);

	    // We want highest res on top
	    // but we parse the links from lowest to highest
	    hd_links.unshift(link)
	}
	return hd_links;
    }

    return null;
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

LinternaMagica.prototype.sites["dailymotion.com"].flash_plugin_installed =
function()
{
    var site_html5_player = this.find_site_html5_player_wrapper(document);

    // If there is html5 player and flash plugin is installed no SWF
    // object will be created. We must examine scripts.
    if (site_html5_player)
    {
	return this.sites["dailymotion.com"].
	    no_flash_plugin_installed.apply(this, [arguments]);
    }

    return true;
}

LinternaMagica.prototype.sites["dailymotion.com"].process_cookies =
function()
{
    // Dailymotion is processed twice. Once with .dailymotion.com. The
    // second time with www.dailymotion.com. They set cookies very
    // strange.  Also they use host= which is not documented anywhere
    // (DOM 0,1...).
    return "; domain=.dailymotion.com; path=/; host="+window.location.hostname+"; ";
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

LinternaMagica.prototype.sites["dailymotion.com"].skip_video_id_extraction =
function ()
{
    // Can't extract video_id from script when flash is not
    // isntalled. The video id is always the pathname.
    var extracted_data = new Object();
    extracted_data.video_id = window.location.pathname;
    return  extracted_data;
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

    this.extract_cookies();
    this.expire_cookies();

    // For some strange reason the cookie that activates the HTML5
    // player could not be expired. It must be forced to non-relevant
    // for the site value. If it is present, the XHR does not get a
    // flash player version of the page and no data could be
    // extracted.
    if (/html5_switch=1/i.test(document.cookie))
    {
	document.cookie = "html5_switch=0;";
    }

    return result;
}

LinternaMagica.prototype.sites["dailymotion.com"].process_xhr_response =
function(args)
{
    var client = args.client;
    var object_data = args.object_data;
    
    // !this.plugin_is_installed is removed so it could work when
    //  plugin is installed and HTML5 is active.
    if (!object_data.linterna_magica_id && 
	!object_data.parent)
    {
	// In Dailymotion the script that creates the flash
	// object replaces itself. The work around here is to
	// request the page and process it. 

	// Dailymotion uses pseudo-random ids for some DOM
	// elements of interest. We replace the body HTML with
	// the one returned by the XHR. Then scripts are
	// processed. The script extraction code matches the
	// correct ID for the parentNode in DOM, that will
	// hold the video object. The original body is
	// restored, because some data is missing in the body
	// data from XHR. After all data is collected, the
	// parentNode (object_data.parent), where the video
	// object will be inserted is replaced with the one in
	// the original body.  Custom function to match the
	// parent by CSS class is used, because getElementById
	// does not support regular expressions.

	var body_data = 
	    client.responseText.split("<body")[1].
	    replace(/>{1}/,"__SPLIT__").
	    split("__SPLIT__")[1];

	var body = document.getElementsByTagName("body")[0];
	var original_body_data = body.innerHTML;

	body.innerHTML = body_data;

	this.script_data = client.responseText;
	object_data = this.extract_object_from_script_swfobject();

	body.innerHTML = original_body_data;

	if (!object_data)
	{
	    return null;
	}

	object_data.parent = 
	    this.get_first_element_by_class("dmpi_video_playerv[0-9]+");

	if (!object_data.parent)
	{
	    return null;
	}
    }

    var hd_links = this.extract_dailymotion_links(client.responseText);
    object_data.link = hd_links ? hd_links[hd_links.length-1].url : null;
    object_data.hd_links = hd_links.length ? hd_links : null;

    // See "A note on cookies"
    if (/restore/i.test(this.process_cookies))
    {
	this.restore_cookies();
    }

    // For some strange reason the cookie that activates the HTML5
    // player could not be expired. It was forced to non-relevant for
    // the site value. If it is present, the XHR does not get a flash
    // player version of the page and no data could be extracted.  It
    // must be restored.
    if (/html5_switch=0/i.test(document.cookie))
    {
	document.cookie = "html5_switch=1;";
    }


    return object_data;
}

LinternaMagica.prototype.sites["dailymotion.com"].insert_object_after_xhr =
function(object_data)
{
    // Skip the remove_plugin_install_waring in the default object
    // creation code after XHR. This keeps the HTML5 error screen.
    if (/html5_switch=1/i.test(document.cookie))
    {
	this.log("LinternaMagica.request_video_link_parse response:\n"+
		 "Creating video object with url: "+object_data.link,1);
	this.create_video_object(object_data);
	return false;
    }

    // Just exit and leave object insertion to the XHR function.
    return true;
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

	// Hide / show on toggle_plugin clicks 
	var toggle_header =
	    document.getElementById("linterna-magica-toggle-plugin-header-"+
				    object_data.linterna_magica_id);
	var toggle_after =
	    document.getElementById("linterna-magica-toggle-plugin-"+
				    object_data.linterna_magica_id);

	var header_fn = function(ev)
	{
	    var err_screen  = document.querySelector(".error_screen");

	    if (!err_screen)
	    {
		return;
	    }

	    if (err_screen.style.display)
	    {
		err_screen.style.removeProperty("display");
	    }
	    else
	    {
		err_screen.style.setProperty("display", 
					     "none", "important");
	    }
	};

	if (toggle_header)
	{
	    toggle_header.addEventListener("click",header_fn,false);
	}

	if (toggle_after)
	{
	    toggle_after.addEventListener("click",header_fn,false);
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
