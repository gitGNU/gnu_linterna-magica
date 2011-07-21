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

//  Makes a JSONP request that fetches the clip data in Blip.tv
LinternaMagica.prototype.request_bliptv_jsonp_data =
function (object_data)
{
    var jsonp_request_data = new Object();

    jsonp_request_data.frame_id = "bliptv_jsonp_data_fetcher";
    jsonp_request_data.parser_timeout = this.bliptv_jsonp_timeout;
    jsonp_request_data.parser_timeout_counter = 
	this.bliptv_jsonp_timeout_counter;
    jsonp_request_data.jsonp_script_link = 
	"http://blip.tv/players/episode/"+object_data.video_id+
	"?skin=json&callback=bliptv_video_data&version=2";
    jsonp_request_data.jsonp_function = "bliptv_video_data";
    jsonp_request_data.parser_function = this.parse_bliptv_jsonp_data;
    jsonp_request_data.user_data = object_data;

    this.log("LinternaMagica.request_bliptv_jsonp_data:\n"+
	     "Requesting (JSONP) Blip.tv video link via video_id "+
	     object_data.video_id,1);

    this.create_checker_frame(jsonp_request_data);
}

// Parses the JSONP data and creates the video object in Blip.tv
LinternaMagica.prototype.parse_bliptv_jsonp_data = function(data, object_data)
{
    // The useful object
    data = data[0].Post;
    object_data.link = data.mediaUrl;

    var hd_links = new Array();

    // Sort the HD links by width so they are ordered in the HD link
    // list bottom to top , low to high.
    var sort_fun = function(a, b)
    {
	return ((parseInt(a.media_width) > parseInt(b.media_width)) ? -1 : 
		(parseInt(a.media_width) < parseInt(b.media_width)) ? 1 :0);
    };

    data.additionalMedia.sort(sort_fun);

    for (var i=0, l=data.additionalMedia.length; i<l; i++)
    {
	var link_data = data.additionalMedia[i];
	var link = new Object();
	link.url = link_data.url;
	link.label = link_data.role+
	    " ("+link_data.media_width+"x"+link_data.media_height+" "+
	    " "+link_data.description+" "+
	    link_data.video_codec.toUpperCase()+", "+
	    link_data.audio_codec.toUpperCase()+")";


	hd_links.push(link);
    }

    object_data.hd_links = hd_links;
    this.create_video_object(object_data);
}

LinternaMagica.prototype.sites["blip.tv"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.blip.tv"] = "blip.tv";

LinternaMagica.prototype.sites["blip.tv"].set_video_id_regex = function()
{
    var result = new Object();

    result.video_id_re = new RegExp(
	"blip\\\.tv\\\/(play|rss\\\/flash)\\\/([0-9A-Za-z_%-]+)&*",
	"i");

    // Captured video_id position from left to right. Will be
    // subtracted from the matched arrays's lenght;
    result.videoid_position = 1;

    return result;
}

LinternaMagica.prototype.sites["blip.tv"].plugin_install_warning_loop =
function(node)
{
    // FIXME Temporary fix for Blip.tv. Will replace the HTML5
    // player, otherwise two are visible.  14.06.2011 With the
    // changes in Blip.tv design and logic, I am unable to find
    // how to turn HTML5 and test this. I always get the flash
    // player.
    if (node.parentNode)
    {
        node.parentNode.removeChild(node);
    }

    return null;
}

