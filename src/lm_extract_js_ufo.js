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
// @source http://e-valkov.org/linterna-magica

// END OF LICENSE HEADER

// Extracts object data for flash objects created with UFO flash library
LinternaMagica.prototype.extract_object_from_script_ufo = function()
{
    var constructor_re = new RegExp(
	"UFO\\\.create\\\(\\\s*([a-zA-Z0-9]+)\\\s*,\\\s*"+
	    "(\\\"|\\\')([a-zA-Z0-9-_]+)(\\\"|\\\')",
	"im");
    var data = this.script_data;
    var constructor = data.match(constructor_re);

    if (!constructor)
    {
	return null;
    }

    // No parent element found
    if (!document.getElementById(constructor[3]))
    {
	return null;
    }

    var object_data = new Object();
    object_data.parent = document.getElementById(constructor[3]);

    var ufo_variable_re ="var\\\s*"+constructor[1]+"\\\s*=\\\s*\\\{.*";
    var w_h_re = "\\\s*(\\\"|\\\')*(\\\d+)(\\\'|\\\")*";

    var width_re = new RegExp(
	ufo_variable_re+"width:"+w_h_re,
	"im");

    var height_re = new RegExp(
	ufo_variable_re+"height:"+w_h_re,
	"im");

    object_data.width = data.match(width_re);
    object_data.height = data.match(height_re);

    if (object_data.width)
    {
	object_data.width = object_data.width[object_data.width.length-2];
    }
    else
    {
	return null;
    }

    if (object_data.height)
    {
	object_data.height = object_data.height[object_data.height.length-2];
    }
    else
    {
	return null;
    }

    this.extract_link_data = data;
    object_data.link = this.extract_link();

    if (!object_data.link)
    {
	this.extract_video_id_data = data;
	object_data.video_id = this.extract_video_id();
    }

    if (object_data.link || object_data.video_id)
    {
	this.log("LinternaMagica.extract_object_from_script_ufo:\n"+
		 "SWF object extracted from script ",1);

	// Ugly && dirty hack.
	// This way we have linterna_magica_id
	this.dirty_objects.push(null);
	object_data.linterna_magica_id = this.dirty_objects.length-1;
	return object_data;
    }

    return null;
}
