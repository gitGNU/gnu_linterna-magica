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

LinternaMagica.prototype.sites["vimeo.com"] = new Object();

// Reference 
LinternaMagica.prototype.sites["www.vimeo.com"] = "vimeo.com";

// Detect vimeo browser upgrade warning (no flash & h264) .This is
// called withing setInterval. It is needed because when the elements
// with the warning are inserted all our data that has been added
// before that is removed.
LinternaMagica.prototype.detect_vimeo_browser_upgrade = function(object_data)
{
    var detected = 0 ;

    // Keep track of the time
    this.vimeo_browser_upgrade_counter ++;

    // With default timeout 500mS this will be 3 sec. Stop checking
    // it must be WebKit, where no script will be found and plugin is
    // not installed. 

    // 26.02.2011 The warning missing HTML5/Flash is not showing. We
    // must force as detected otherwise will not work in Firefox.
    if (this.vimeo_browser_upgrade_counter >= 6)
    {
	// Will be cleared in if (detected)
	// clearInterval(this.vimeo_browser_upgrade_timeout);
	detected=1;
	// Remove the HTML5 player in Epiphany/Midory
	object_data.parent.removeChild(object_data.parent.lastChild);
    }

    var scripts = object_data.parent.getElementsByTagName("script");

    for(s=0, l=scripts.length; s<l; s++)
    {
	if (scripts[s].textContent &&
	    /Please\s*upgrade/i.test(scripts[s].textContent))
	    {
		detected = 1;
		break;
	    }
    }

    if (detected)
    {
	clearInterval(this.vimeo_browser_upgrade_timeout);

	this.log("LinternaMagica.detect_vimeo_browser_upgrade:\n"+
		 "Removing plugin install warning.",2);

	this.remove_plugin_install_warning(object_data.parent);

	this.log("LinternaMagica.detect_vimeo_browser_upgrade:\n"+
		 "Creating video object.",2);

	this.create_video_object(object_data);
    }
}

// Extract object data in Vimeo. This makes Firefox and forks to work
// without plugin and without HTML5 (missing H264)
LinternaMagica.prototype.sites["vimeo.com"].extract_object_from_script = function()
{
    var player_element_re = new RegExp(
	"player[0-9]+_[0-9]+_element\\\s*=\\\s*"+
	    "document.getElementById\\\(\\\'([a-zA-Z0-9_]+)\\\'\\\)",
	"im");

    var data = this.script_data;
    var player_element = data.match(player_element_re);

    if (!player_element)
    {
	return null;
    }

    var el = document.getElementById(player_element[1]);

    // No parent element
    if (!el)
    {
	return null;
    }

    var video_id = data.match(/\"id\":([0-9]+),/);

    if (video_id)
    {
	video_id = video_id[1];
    }

    // It is possible to extract width and height from JavaScript but
    // they make the object HUGE and out of place

    var width = el.clientWidth || el.offsetWidth || 
	el.parentNode.clientWidth || el.parentNode.offsetWidth;

    var height = el.clientHeight || el.offsetHeight || 
	el.parentNode.clientHeight || el.parentNode.offsetHeight;

    if (video_id && width && height)
    {
	var object_data = new Object();
	object_data.width = width;
	object_data.height = height;
	object_data.video_id = video_id;
	object_data.parent = el;

	this.log("LinternaMagica.extract_object_from_script_vimeo:\n"+
		 "Object data extracted from script ",1);

	object_data.linterna_magica_id =
	    this.mark_flash_object("extracted-from-script");

	return object_data;
    }

    return null;
}

LinternaMagica.prototype.sites["vimeo.com"].prepare_xhr =
function(object_data)
{
    var result = new Object();

    result.address = "/moogaloop/load/clip:"+object_data.video_id;
    
    // Remove cookies and fetch page again. See "A note on
    // cookies".
    // this.extract_cookies();
    // this.expire_cookies();

    return result;
}

LinternaMagica.prototype.sites["vimeo.com"].process_xhr_response =
function(args)
{
    var object_data = args.object_data;
    var client = args.client;
    var xml = client.responseXML;

    var rq_sig = xml.getElementsByTagName("request_signature");

    rq_sig = rq_sig[0].textContent;

    var rq_exp = xml.getElementsByTagName(
	"request_signature_expires")[0].textContent;
    var id = xml.getElementsByTagName("video")[0];
    id= id.getElementsByTagName("nodeId")[0].textContent;

    object_data.link = "http://www.vimeo.com/moogaloop/play/clip:"+
	id+"/"+rq_sig+"/"+rq_exp+"/?q=sd";

    // Check if there is HD clip
    var is_hd = xml.getElementsByTagName("isHD");
    if (is_hd && is_hd[0] && is_hd[0].textContent)
    {
	try
	{
	    is_hd=parseInt(is_hd[0].textContent);
	}
	catch(e)
	{
	    is_hd=0;
	}
    }

    // HD links support only for clips that have it
    if (is_hd)
    {
	object_data.hd_links = new Array();
	var hd_link = new Object();

	// Translate?
	hd_link.label = "Low quality";
	hd_link.url = object_data.link;
	object_data.hd_links.unshift(hd_link);

	hd_link = new Object();
	// Translate?
	hd_link.label = "High quality";
	hd_link.url = object_data.link.replace(/q=sd/, "q=hd");
	object_data.hd_links.unshift(hd_link);
    }

    // Vimeo web server sends the clips as
    // video/mp4. totemNarrowSpace plugin (plays video/mp4)
    // sends custom UA. This prevents the video to load. Must
    // use video/flv, so totemCone plugin could start and send
    // UA of the browser.  totemNarrowSpace/QuickTime plugin
    // have other issues as well. Could be forced to
    // video/flv, but there is a better fix in
    // create_video_object();
    object_data.mime = "video/mp4";

    return object_data;
}
