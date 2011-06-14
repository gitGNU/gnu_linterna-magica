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

// Extracts object data for flash objects created with PokkariPlayer
// flash library. Used to be for Blip.tv, but the site changed. Some
// other sites might use this code.
LinternaMagica.prototype.
    extract_object_from_script_pokkariplayer =  function ()
{
    var data = this.script_data;
    var constructor_re = new RegExp (
	"(.*)\\\s*=\\\s*"+
	    "PokkariPlayer\\\.GetInstanceByMimeType\\\(\\\"(.*)\\\"\\\,",
	"im");

    var constructor = data.match(constructor_re);

    if (!constructor)
    {
	return null;
    }

    // FLV files has video/x-flv, video/flv
    // If it is not cleared the plugin will not start
    var mime_raw = constructor[constructor.length-1].split(/,/);
    var mime =  mime_raw[mime_raw.length-1];
    var player  = constructor[constructor.length-2];
    player = player.replace(/\s*var\s*/,"").replace(" ","");
    var url_re = new RegExp(player+
			    '\\\.setPrimaryMediaUrl\\\(\\\"(.*)\\\"');

    var url = data.match(url_re);
    url = url[url.length-1];

    var width = data.match(/PokkariPlayerOptions\.maxWidth\s*=\s*(\d+)\;/);
    width=width[width.length-1];

    var height = data.match(/PokkariPlayerOptions\.maxHeight\s*=\s*(\d+)\;/);
    height = height[height.length-1];

    var element = data.match(/player\.setPlayerTarget\(.*\'(.*)\'.*/);
    element = element[element.length-1];
    element = document.getElementById(element);

    // Do not know where to place the object
    if (!element)
	return null;

    var embed_object = element.getElementsByTagName("object")[0];

    if (embed_object)
    {
	this.dirty_objects.push(embed_object);
	embed_object.setAttribute("linterna_magica_id",
				  this.dirty_objects.length-1);

    }
    else
    {
	// Ugly && dirty hack.
	// This way we have linterna_magica_id
	this.dirty_objects.push(null);
    }

    var object_data = new Object();
    object_data.linterna_magica_id = this.dirty_objects.length-1;

    object_data.width = width;
    object_data.height = height;
    object_data.link = url;
    object_data.mime = mime;
    object_data.parent = element;

    return object_data;
}
