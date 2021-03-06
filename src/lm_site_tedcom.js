//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012  Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Combines the relative link with the hostname to create the video link
// for ted.com
LinternaMagica.prototype.create_tedcom_link = function(relative_link)
{
    if (relative_link)
    {
	// Clean the junk
	relative_link = relative_link.replace(/ms|hs|ls/,"").
	    replace(/\"/g,"").replace("mp4:","").replace(":","").
	    replace("=","").replace(",","");

	var link = "http://video.ted.com/"+relative_link;

	return link;
    }

    return null;
}

LinternaMagica.prototype.extract_tedcom_hd_links = function(data)
{
    var links_re = new RegExp (
	"(?:\\\&)*\\\w{2}(\\\=|\\\:)*\\\s*(\\\"|\\\')*"+
	    "(.*\\\.(flv|mp4))(\\\&|\\\",$)",
	"img");

    var links = unescape(data).match(links_re);

    if (!links)
    {
	return false;
    }

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
	var label = link.url.match(/-(\w+)\.(flv|mp4)/);

	// Make some labels just in case the match does not work
	if (!label)
	{
	    // Translators: This is a label for HD link. It is
	    // followed by a number.
	    label = this._("Link")+" "+lnk+1;
	}
	else
	{
	    // Capitalize the first letter because it is all lowercase
	    // (Low/Hight/Medium)
	    label = label[label.length-2];
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

LinternaMagica.prototype.sites["ted.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.ted.com"] = "ted.com";

LinternaMagica.prototype.sites["ted.com"].before_options_init = function()
{
     // Skip ted.com at the front page. With Gnash installed the flash
    // object is created. The flashvars attrubute value is 24 KB
    // (kilo*bytes*) and Firefox and forks block 
    if(!/[A-Za-z0-9]+/i.test(window.location.pathname))
    {	
    	   this.log("LinternaMagica.sites.before_options_init:\n"+
    		    "Skipping TED front page!"+
    		    " Blocks Firefox and forks.");

    	return false;
    }

    return true;
}

LinternaMagica.prototype.sites["ted.com"].extract_hd_links_from_dom_if_link =
function(data)
{
    this.log("LinternaMagica.sites.extract_hd_links_from_dom_if_link:\n"+
	     "Trying to extract ted.com HQ links ",1);
    return this.extract_tedcom_hd_links(data);
}

LinternaMagica.prototype.sites["ted.com"].extract_hd_links_from_script_if_link =
function()
{
    var data = this.extract_link_data;

    this.log("LinternaMagica.sites.extract_hd_links_from_script_if_link:\n"+
	     "Trying to extract ted.com HQ links ",1);
    return this.extract_tedcom_hd_links(data);
}

LinternaMagica.prototype.sites["ted.com"].skip_script_processing =
function()
{
    if (this.script_data.length >= 15000)
    {
	this.log("LinternaMagca.sites.skip_script_processing:\n"+
		 "Skipping script processing, because it is too big.");
	// Skip the script is too big and will bloat Firefox
	return false;
    }

    return true;
}

LinternaMagica.prototype.sites["ted.com"].process_extracted_link =
function(link)
{
    link = this.create_tedcom_link(link);
    return link;
}
