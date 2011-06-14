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
// @source http://linterna-magica.nongnu.org

// END OF LICENSE HEADER

// Support for The Onion dot com

// Extracts data for the flash object in The Onion dot com from a script
LinternaMagica.prototype.extract_object_from_script_theonion = function()
{
    var player_container = document.getElementById("player_container");

    if (!player_container)
    {
	return null;
    }

    var data = this.script_data;
    var video_id_re = new RegExp (
	"var\\\s*afns_video_id\\\s*="+
	    "\\\s*(\\\"|\\\')([0-9]+)(\\\"|\\\')");

    var video_id = data.match(video_id_re);

    if (!video_id)
    {
	return null;
    }

    video_id = video_id[video_id.length-2];

    var width = player_container.clientWidth;
    var height = player_container.clientHeight;
    
    if (!width || !height)
    {
	return null;
    }

    var flash_object = document.getElementById("player_container_api");

    var object_data = new Object();

    object_data.video_id = video_id;
    object_data.width = width;
    object_data.height = height;
    object_data.parent = player_container;

    if (flash_object)
    {
	this.dirty_objects.push(flash_object);
    }
    else
    {
	// Ugly && dirty hack.
	// This way we have linterna_magica_id
	this.dirty_objects.push(null);
    }

    object_data.linterna_magica_id = this.dirty_objects.length-1;

    return object_data;
}
