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

// Combines the relative link with the hostname to create the video link
// for ted.com
LinternaMagica.prototype.create_tedcom_link = function(relative_link)
{
    if (relative_link)
    {
	// Clean the junk
	relative_link = relative_link.replace(/ms|hs|ls/,"").
	    replace(/\"/g,"").replace(":","").replace("=","").
	    replace(",","");

	var link = "http://video.ted.com/"+
	    relative_link;
	return link;
    }

    return null;
}

LinternaMagica.prototype.extract_tedcom_hd_links = function(data)
{
    var links_re = new RegExp (
	"(?:\\\&)*\\\w{2}(\\\=|\\\:)*\\\s*(\\\"|\\\')*(.*\\\.flv)(\\\&|\\\",$)",
	"img");

    var links = unescape(data).match(links_re);

    if (!links)
	return;

    // Work-around for links extracted from <param> of a DOM object
    // There is a problem with generalized regular expression
    if (links[0].match(/&hs=/))
    {
	links = links[0].split("&vw")[0].split("&").slice(1,4);
    }
    else
    {
	links = links.slice(0,3);
    }

    if (!links)
	return;

    var hd_links = new Array();

    // low, medium, high links
    for (var lnk=0; lnk<links.length; lnk++)
    {
	var link = new Object();

	link.url = this.create_tedcom_link(links[lnk]);
	var label = link.url.match(/-(\w+)\.flv/);

	// Make some labels just in case the match does not work
	if (!label)
	{
	    label = "Link "+lnk+1;
	}
	else
	{
	    // Capitalize the first letter because it is all lowercase
	    // (Low/Hight/Medium)
	    label = label[label.length-1];
	    label = label.slice(0,1).toUpperCase() + label.slice(1);
	}

	link.label = label;
	this.log("LinternaMagica.extract_tedcom_hd_links:\n"+
		 "Extracted link  : "+link.url,1);

	hd_links.push(link);
    }

    if (hd_links.length)
	return hd_links;

    return null;
}
