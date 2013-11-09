//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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
LinternaMagica.prototype.sites["videolectures.net"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.videolectures.net"] = "videolectures.net";


LinternaMagica.prototype.sites["videolectures.net"].do_not_force_iframe_detection =
function()
{
    return false;
}

LinternaMagica.prototype.sites["videolectures.net"].skip_script_processing = function()
{
    return false;
}

LinternaMagica.prototype.sites["videolectures.net"].skip_link_extraction = function()
{
    return false;
}

LinternaMagica.prototype.sites["videolectures.net"].
    skip_video_id_extraction = function()
{
    return null;
}


LinternaMagica.prototype.sites["videolectures.net"].flash_plugin_installed = function()
{
    return this.sites["videolectures.net"].
        no_flash_plugin_installed.apply(this,[arguments]);
}

LinternaMagica.prototype.sites["videolectures.net"].no_flash_plugin_installed = function()
{
    var el = document.getElementById('video_player');

    if (!el)
    {
	return null;
    }


    var video_id = window.location.href.replace('#','')+"video/1/smil.xml";
    var width = null;
    var height = null;

    var left_box = document.querySelectorAll('.lec_lbox');

    if (left_box && left_box[0]) {
	var t = left_box[0];
	width = t.clientWidth || t.offsetWidth ||
	    t.parentNode.clientWidth || t.parentNode.offsetWidth;

	height = 320;
    }

    if (!width || !height)
    {
	width = 502;
	height = 400;
    }

    if (!(width && height))
    {
	return null;
    }

    var cleanup = document.getElementById('video_border');

    if (cleanup)
    {
	cleanup.parentNode.removeChild(cleanup);
    }

    object_data = new Object();

    object_data.linterna_magica_id = 0;
    object_data.width = width;
    object_data.height = height;
    object_data.video_id = video_id;
    object_data.parent = el;
    object_data.mime = "video/mp4";

    if (this.wait_xhr)
    {
	this.log("LinternaMagica.sites.videolectures.net:\n"+
		 "Waiting "+this.wait_xhr+
		 " ms ("+(this.wait_xhr/1000)+
		 " s) before requesting video link via"+
		 " video_id "+data.video_id+" ",1);

	var self = this;
	setTimeout(function() {
	    self.request_video_link.apply(self,[object_data]);
	}, this.wait_xhr);
    }
    else
    {
	this.request_video_link(object_data);
    }
}

LinternaMagica.prototype.sites["videolectures.net"].prepare_xhr = function(object_data)
{
    object_data.address = object_data.video_id;

    return object_data;
}


LinternaMagica.prototype.sites["videolectures.net"].process_xhr_response =
function(args)
{
    var client = args.client;
    var object_data = args.object_data;

    var xml = client.responseXML;

    if (!xml)
    {
	return null;
    }

    var videos = xml.getElementsByTagName("video");

    if (!videos)
    {
	return null;
    }

    var hd_links = new Array();

    for (var i=0,l=videos.length; i<l; i++)
    {
	var video = videos[i];
	var link = new Object();
	var proto = video.getAttribute('proto');
	var ext = video.getAttribute('ext');
	link.url = video.getAttribute('src');
	link.mime = video.getAttribute('type');
	link.video_width = video.getAttribute('width');

	if (proto == 'rtmp' || proto == 'm3u8')
	{
	    continue;
	}

	link.label = video.getAttribute('height') +'p ' + ext + " "+ proto;
	hd_links.push(link);
    }

    // Sort the array by video width, so the links show properly in
    // the HD links list with the highest quality at the top.
    var sort_fun = function (a, b)
    {
	if (parseInt(a.video_width) > parseInt(b.video_width))
	{
	    return -1;
	}
	else if (parseInt(a.video_width) < parseInt(b.video_width))
	{
	    return 1;
	}
	else
	{
	    return 0;
	}
    }

    hd_links.sort(sort_fun);


    object_data.hd_links = hd_links;

    object_data.link = hd_links ? hd_links[hd_links.length-1].url : null;

    if (!object_data.link)
    {
	return null;
    }

    return object_data;
}

LinternaMagica.prototype.sites["videolectures.net"].css_fixess = function(object_data)
{

    this.pause_site_html5_player(object_data.parent);

    var video = object_data.parent.getElementsByTagName('video');

    if (video && video[0])
    {
	video[0].parentNode.removeChild(video[0]);
    }

    var controls = document.querySelectorAll('.controls');

    if (controls && controls)
    {
	var parent = controls[0].parentNode;
	parent.removeChild(controls[0]);
    }
}
