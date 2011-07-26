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

LinternaMagica.prototype.sites["metacafe.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.metacafe.com"] = "metacafe.com";

LinternaMagica.prototype.sites["metacafe.com"].process_extracted_link =
function(link)
{
    // It is set in the extract_link() function.
    var data = this.extract_link_data;

    if (/flv/i.test(link))
    {
	link = link.replace(/&gdaKey/i, "?__gda__");
    }
    else
    {
	var key_re = new RegExp(
	    link.slice(link.length-15).replace(/\\\./g,"\\\\\\.")+
		"\\\"\\\,\\\"key\\\"\\\:\\\"([0-9A-Za-z\\\_]+)\\\"",
	    "i");
	var key = unescape(data).match(key_re);

	// Set the key
	link = link+"?__gda__="+key[key.length-1];
    }

    // Escape. We cannot use escape()
    // because it will break the link and we have to
    // fix manualy characters like = : ?
    link = link.replace("[", "%5B").
	replace(" ", "%20").replace("]", "%5D");

    return link;
}
