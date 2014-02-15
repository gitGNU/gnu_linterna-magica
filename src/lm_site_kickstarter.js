//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2012, 2014 Ivaylo Valkov <ivaylo@e-valkov.org>
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

LinternaMagica.prototype.sites["kickstarter.com"] = new Object();

// Reference 
LinternaMagica.prototype.sites["www.kickstarter.com"] = "kickstarter.com";

LinternaMagica.prototype.sites["kickstarter.com"].flash_plugin_installed =
function()
{
    return this.sites["kickstarter.com"].
	no_flash_plugin_installed.apply(this, [arguments]);
}

// Kickstarter does not have scripts that could be processed. This
// function is an example for website support that works by combining
// Linterna Magica functions and doesn not depend on most of the
// framework.
LinternaMagica.prototype.sites["kickstarter.com"].no_flash_plugin_installed =
function()
{
    var player = document.getElementById("video-section");

    var object_data = null;
    var links = null;
    var width = null;
    var height = null;
    var hd_links = null;

    if (!player)
    {
	return null;
    }

    var links = player.getElementsByTagName("source");

    if (!links || !links.length)
    {
	return null;
    }

    hd_links = new Array();

    for (var i=0, l=links.length; i<l; i++)
    {
	var link = new Object();
	var s =links[i];
	link.url = s.getAttribute("src");
	link.mime_type = s.getAttribute("type");
	link.label = link.url.match(/.*video-[^-]+([^\.]+)/);
	link.label = link.label[link.label.length-1].
	    replace('-','').replace('_',' ');

	if (!link.url || !link.label)
	{
	    continue;
	}

	hd_links.push(link);
    }

    if (!hd_links || !hd_links.length)
    {
	return null;
    }

    height = player ? player.clientHeight : null;
    width  = player ? player.clientWidth : null;

    if (!width || !height)
    {
	height = ( player && player.parentNode ) ?
	    player.parentNode.clientHeight : null;
	width  = ( player && player.parentNode ) ?
	    player.parentNode.parentNode.clientWidth : null;
    }

    if (!width || !height)
    {
	var cs = window.getComputedStyle(player);
	width = parseInt(cs.getPropertyValue("width"));
	height = parseInt(cs.getPropertyValue("height"));
    }

    if (!width || !height)
    {
	this.log("LinternaMagica.sites[kickstarter.com]."+
		 "no_flash_plugin_installed:\n"+
		 "Missing object data "+
		 "\n H: "+height+
		 "\n W: "+width, 3);

	return null;
    }


    var object_data = new Object();
    object_data.link = hd_links[0];
    object_data.hd_links = hd_links;
    object_data.width = width;
    object_data.height = height;
    object_data.parent = player;
    object_data.linterna_magica_id =
	this.mark_flash_object("extracted-by-code");

    // Cleanup flash warnings. Will remove the thumbnail image as
    // well and we will not have to manually delete it. The image
    // displaces the Linterna Magica replacement object.
    this.remove_plugin_install_warning(object_data.parent);
    this.create_video_object(object_data);

    return true;
}
