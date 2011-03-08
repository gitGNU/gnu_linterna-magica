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

// Extracts hd links form Blip.tv
LinternaMagica.prototype.extract_bliptv_hd_links = function()
{
    var holder = document.getElementById("SelectFormat");

    if (!holder)
	return null;


    // We have only one link
    if (holder.options.length == 2)
	return null;

    var hd_links = new Array();

    // option zero is just a message, no link there
    for (var op=1; op<holder.options.length; op++)
    {
	var link_data = holder.options[op];
	var link = new Object();
	link.label = link_data.text;
	var raw_url = link_data.value.split(/=/);
	link.url = "http://blip.tv/file/get/"+raw_url[raw_url.length-1]+
	    "?referrer=blip.tv&source=1&use_direct=1&use_documents=1";

	hd_links.push(link);
    }

    return hd_links;
}
