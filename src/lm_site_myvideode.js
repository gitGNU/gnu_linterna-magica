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
// @source http://linternamagica.org

// END OF LICENSE HEADER

// This seems to be the only way to extract a link for
// myvideo.de;
// We found an object with video_id and then extracted
// the <link> element for the thumbnail and
// modify it for the flv. If <link> attrinbute is found 
LinternaMagica.prototype.create_myvideode_link = function(create_from_text)
{
    var link = null;

    // Front page via this.request_video_link_parse_response()
    if (create_from_text)
    {
	link = create_from_text;
    }
    // The dedicated video
    else
    {
	var links = document.getElementsByTagName("link");

	for (var lnk=0; lnk <links.length; lnk++)
	{
	    var raw_link = links[lnk];

	    if (raw_link.hasAttribute("rel")
		&& /image_src/i.test(raw_link.getAttribute("rel")))
	    {
		link = raw_link.getAttribute("href");
		break;
	    }
	}
    }

    if (link)
    {
	link = link.replace(/thumbs\/|_\d+/g,"").replace(/\.jpg/,".flv");
    }

    return link;
}

LinternaMagica.prototype.sites["myvideo.de"] = new Object();

// // Reference
LinternaMagica.prototype.sites["www.myvideo.de"] = "myvideo.de";

// Function reference
LinternaMagica.prototype.sites["myvideo.de"].flash_plugin_installed = "theonion.com";

LinternaMagica.prototype.sites["myvideo.de"].skip_xhr_if_video_id =
function(object_data)
{
    // See the comments for this function. There is no way to access
    // the video URL via XHR, but there is a pattern to create the
    // video link
    object_data.link = this.create_myvideode_link();

    // Now that we have a link remove the video_id
    // so it is not processed
    if (object_data.link)
    {
	object_data.video_id = null;
    }

    return object_data ;
}

LinternaMagica.prototype.sites["myvideo.de"].prepare_xhr =
function(object_data)
{
    var result = new Object();

    result.address = "/watch/"+object_data.video_id+"/";

    return result;
}

LinternaMagica.prototype.sites["myvideo.de"].process_xhr_response =
function(args)
{
    var object_data = args.object_data;
    var client = args.client;

    try
    {
	var thumb_url = client.responseText.split(/image_src/)[1];
	thumb_url = thumb_url.split(/\/\>/)[0].split(/\'/)[2];

	object_data.link = this.create_myvideode_link(thumb_url);
    }
    catch(e)
    {
	return null;
    }

    return object_data;
}
