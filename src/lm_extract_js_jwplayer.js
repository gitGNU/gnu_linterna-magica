//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Extracts object data for flash objects created with flowplayer
// flash player/library.
LinternaMagica.prototype.extract_object_from_script_jwplayer = function()
{
    var constructor_re = new RegExp(
	".*jwplayer\\\((\\\"|\\\')(\\\w+)(\\\"|\\\')\\\)\\\.setup",
	"im");

    var data = this.script_data;

    var constructor = data.match(constructor_re);
    var el, width, height;
    var object_data = new Object();
    
    if (!constructor)
    {
	return null;
    }

    el = constructor[2];
    el = document.getElementById(el);

    if (!el)
    {
	this.log("LinternaMagica.extract_object_from_script_jwplayer:\n"+
		 "No player holder element found with id "+el,4);

	return null;
    }

    width = data.match(/width:\s*([0-9]+),/);
    height = data.match(/height:\s*([0-9]+),/);

    if (width)
    {
	width = width[1];
    }
    else
    {
	width = el.clientWidth ? el.clientWidth: el.offsetWidth;
    }

    if (height)
    {
	height = height[1];
    }
    else
    {
	height = el.clientHeight ? el.clientHeight: el.offsetHeight;
    }
    

    if (! width || ! height)
    {
	return null;
    }

    object_data.parent = el;
    object_data.width = width;
    object_data.height = height;

    var hd = this.extract_jwplayer_hd_links(data);

    object_data.hd_links = (hd && hd.length) ? hd : null;
    object_data.link = (hd && hd.length) ? hd[hd.length-1].url : null;

    if (object_data.link)
    {
	object_data.linterna_magica_id = 
	    this.mark_flash_object("extracted-from-script");

	return object_data;
    }

    return null;
}

LinternaMagica.prototype.extract_jwplayer_hd_links = function(data)
{
    var hd_links_re = new RegExp (
	"levels(\\\"|\\\')*\\\s*:\\\s*\\\[.*",
	"img");

    var links_data = data.match(hd_links_re);

    if (!links_data || !links_data.length)
    {
	return null;
    }

    links_data = links_data[0];

    hd_links_re = new RegExp (
	"\\\{[^\\\}]+",
	"img");

    var count = 0;
    var hd_links = new Array();

    var link_data = null;

    while (link_data = hd_links_re.exec(links_data))
    {
	count++;

	var link = new Object();

	this.extract_link_data = link_data[0];
	link.url = this.extract_link();

	var label = link_data[0].match(/width(\"|\')*\s*:\s*([0-9]+),/);

	if (!label)
	{
	    // Translators: This is a label for HD link. It is
	    // followed by a number.
	    label = this._("Link") + " " + count;
	}
	else
	{
	    label = label[label.length-1] +"p";
	}

	link.label = label;
	hd_links.push(link);
    }

    return hd_links;
}
