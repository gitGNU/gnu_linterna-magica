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
// @source http://linternamagica.org

// END OF LICENSE HEADER

LinternaMagica.prototype.sites["livestream.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.livestream.com"] = "livestream.com";

LinternaMagica.prototype.sites["livestream.com"].set_video_id_regex =
function()
{
    var result = new Object();

    // Special regular expression is needed to catch live streams and
    // recorded ones. The keys are different.
    result.video_id_re = new RegExp(
	"(clip|\\\&t)=(pla[_-a-zA-Z0-9]+|[0-9]+)",
	"i");

    result.video_id_position = 1;

    return result;
}

//  Makes a JSONP request that fetches the clip data in Livestream.com
LinternaMagica.prototype.request_livestreamcom_jsonp_data =
function (object_data)
{
    var flash_object =
	this.get_flash_video_object(object_data.linterna_magica_id);

    if (!flash_object)
    {
	return null;
    }

    var attrib = null;
    var channel_re = null;

    if (flash_object.localName.toLowerCase() == "embed" || 
	flash_object.localName.toLowerCase() == "iframe")
    {
	attrib = "src";
    }
    else if (flash_object.localName.toLowerCase() == "object")
    {
	attrib = "data";
    }

    if (flash_object.localName.toLowerCase() == "object" || 
	flash_object.localName.toLowerCase() == "embed")
    {
	channel_re = new RegExp (
	    "channel=(.*)&",
	    "i");
    }
    else if (flash_object.localName.toLowerCase() == "iframe")
    {
	channel_re = new RegExp ("\\\/embed\\\/(.*)\\\?");
    }

    var data = flash_object.getAttribute(attrib);

    if (!data)
    {
	return null;
    }

    var channel = data.match(channel_re);

    if (!channel || (channel && !channel[channel.length-1]))
    {
	return null;
    }

    channel = channel[channel.length-1];

    var jsonp_key =
	/pla[_A-Za-z0-9\-]+/i.test(object_data.video_id) ? "id" : "t";

    var jsonp_request_data = new Object();

    jsonp_request_data.frame_id = "livestreamcom_jsonp_data_fetcher";
    jsonp_request_data.parser_timeout = this.livestreamcom_jsonp_timeout;
    jsonp_request_data.parser_timeout_counter = 
	this.livestream_jsonp_timeout_counter;
    jsonp_request_data.jsonp_script_link = "http://x"+channel+
	"x.api.channel.livestream.com/3.0/getstream.json?"+jsonp_key+"="+
	object_data.video_id+"&callback=livestreamcom_video_data";

	"http://blip.tv/players/episode/"+object_data.video_id+
	"?skin=json&callback=bliptv_video_data&version=2";
    jsonp_request_data.jsonp_function = "livestreamcom_video_data";
    jsonp_request_data.parser_function =
	this.parse_livestreamcom_jsonp_data;
    jsonp_request_data.user_data = object_data;

    this.log("LinternaMagica.request_bliptv_jsonp_data:\n"+
	     "Requesting (JSONP) Livestream.com video link via video_id "+
	     object_data.video_id,1);

    this.create_checker_frame(jsonp_request_data);
}

LinternaMagica.prototype.parse_livestreamcom_jsonp_data =
function(data,object_data)
{
    object_data.link = data.progressiveUrl ? 
	data.progressiveUrl : data.rtspUrl;

    if (data.progressiveUrl && data.rtspUrl)
    {
	object_data.hd_links = new Array();

	var hd_link = new Object();
	hd_link.label = this._("RTSP link");
	hd_link.url = data.rtspUrl;
	object_data.hd_links.push(hd_link);

	hd_link = new Object();
	hd_link.label = this._("Progressive link");
	hd_link.url = data.progressiveUrl;
	object_data.hd_links.push(hd_link);
    }

    this.create_video_object(object_data);
}

LinternaMagica.prototype.sites["livestream.com"].css_fixes =
function(object_data)
{
    var featured = document.getElementById("featured");
    if (featured)
    {
	// A h2 element on front page and pages with categories of
	// channel listings overlap the controls. It is a
	// nextSibling.nextSibling of the featured element. Better
	// use the third parent of the linterna magica object.
	var lm = 
	    document.getElementById("linterna-magica-"+
				    object_data.linterna_magica_id);
	if (lm)
	{
	    lm.parentNode.parentNode.parentNode.style.
		setProperty("bottom", "60px", "important");
	}
    }

    // Objects in dedicated channel pages are displaced 3px left.
    var lm_object =
	document.getElementById("linterna-magica-video-object-"+
				object_data.linterna_magica_id);
    if (lm_object)
    {
	lm_object.style.setProperty("left", "0px", "important");
    }
}
