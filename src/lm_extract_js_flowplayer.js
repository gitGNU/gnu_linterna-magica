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
// @source http://linternamagica.org

// END OF LICENSE HEADER

// Extracts object data for flash objects created with flowplayer
// flash player/library.
LinternaMagica.prototype.extract_object_from_script_flowplayer = function()
{
    var constructor_re = new RegExp(
	".*(flowplayer|$f)\\\s*\\\(([^,]+)\\\s*,\\\s*.*",
	"im");

    var data = this.script_data;

    var constructor = data.match(constructor_re);
    var el;
    var object_data = new Object();
    
    if (!constructor)
    {
	return null;
    }

    el = constructor[2].replace(/\'|\"/g, "");
    el = document.getElementById(el);

    if (!el)
    {
	this.log("LinternaMagica.extract_object_from_script_flowplayer:\n"+
		 "No player holder element found with id "+el,4);

	return null;
    }

    object_data.parent = el;
    object_data.width = el.clientWidth ? el.clientWidth: el.offsetWidth;
    object_data.height = el.clientHeight ? el.clientHeight: el.offsetHeight;

    this.extract_link_data = data;
    object_data.link = this.extract_link();

    if (object_data.link)
    {
	object_data.linterna_magica_id = 
	    this.mark_flash_object("extracted-from-script");

	return object_data;
    }

    return null;
}

// Fixes relative links used in some sites with flowplayer.
LinternaMagica.prototype.fix_flowplayer_links = function(link)
{
    if (!link)
    {
	return null;
    }

    if (!/^http/i.test(link))
    {
	var data = this.extract_link_data;
	var base_url_re = new RegExp(
	    "(\\\"|\\\')*baseUrl(\\\'|\\\")*\\\s*:\\\s*(\\\'|\\\")"+
		"([^\\\'\\\"\\\,]+)(\\\'|\\\")",
	    "im");

	var base_url = data.match(base_url_re);

	if (base_url)
	{
	    link = base_url[base_url.length-2]+"/"+link;
	}

	// Relative link in the form ../../link/address/with_clip.flv
	if (/^\.\.\//i.test(link))
	{
	    var href = window.location.href.split("/");
	    var base_url = href.slice(0,(href.lenght-1)).join("/");
	    link = base_url +"/" +link;
	}
    }

    return link;
}
