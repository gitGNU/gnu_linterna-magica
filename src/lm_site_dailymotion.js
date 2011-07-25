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
		"");

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
    this.request_video_link({video_id: window.location.pathname});
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

    return result;
}
