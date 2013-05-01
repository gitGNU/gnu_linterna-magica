//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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
LinternaMagica.prototype.sites["xhamster.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.xhamster.com"] = "xhamster.com";

// Reference YT's function - will scan scripts instead of DOM
LinternaMagica.prototype.sites["xhamster.com"].flash_plugin_installed = "youtube.com";

// Do not extract links from DOM
LinternaMagica.prototype.sites["xhamster.com"].skip_link_extraction = function()
{
    return false;
}

LinternaMagica.prototype.sites["xhamster.com"].extract_object_from_script =
function()
{
    var data = this.script_data;

    if (!data.match(/flashvars\s*=\s*{/))
    {
 	return null;
    }
       
    var srv = data.match(/'srv'\s*:\s*'(.*)'/);

    if (!srv || !srv[srv.length-1])
    {
	return null;
    }

    srv = srv[srv.length-1];
    
    var file = data.match(/'file'\s*:\s*'(.*\.flv)'/);

    if (!file || !file[file.length-1])
    {
	return null;
    }

    file = file[file.length-1];

    var embed_re = new RegExp(
	"swfobject\\\.embedSWF\\\('(.*)',"+
	    "\\\s*'(.*)',\\\s*'([0-9]+)',\\\s*'([0-9]+)'");

    var embed = data.match(embed_re);

    if (!embed || !embed[embed.length-1] || !embed[embed.length-2] ||
	!embed[embed.length-3])
    {
	return null;
    }

    var width = embed[embed.length-2];
    var height = embed[embed.length-1];
    var el_id = embed[embed.length-3];
    var parent = document.getElementById(el_id);

    var linterna_magica_id =
	this.mark_flash_object("extracted-from-script");

    if (this.plugin_is_installed)
    {
	linterna_magica_id =
	    this.mark_flash_object(parent);
    
	parent = parent.parentNode;
    }

    if (!parent)
    {
	return null;
    }

    var object_data = new Object();

    object_data.linterna_magica_id = linterna_magica_id;
    object_data.link =  srv+'/key='+file;
    object_data.width = width;
    object_data.height = height;
    object_data.parent = parent;

    return object_data;
}
