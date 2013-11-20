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
// @source http://linternamagica.org

// END OF LICENSE HEADER

LinternaMagica.prototype.sites["video.repubblica.it"] = new Object();

LinternaMagica.prototype.sites["video.repubblica.it"].extract_object_from_script =
function()
{
    var data = this.script_data;

    var player_re = new RegExp(
	"generatePlayer\\(");

    if (!data.match(player_re))
    {
	return null;
    }

    var el = document.getElementById("player");

    if (!el)
    {
	return null;
    }

    var width_re = new RegExp(
	"addParam\\\((\\\"|\\\')param(\\\"|\\\'),"+
	    "\\\s*(\\\"|\\\')width(\\\"|\\\'),"+
	    "\\\s*(\\\"|\\\')([0-9]+)(\\\"|\\\')");

    var width = data.match(width_re);

    var height_re = new RegExp(
	"addParam\\\((\\\"|\\\')param(\\\"|\\\'),"+
	    "\\s*(\\\"|\\\')height(\\\"|\\\'),"+
	    "\\s*(\\\"|\\\')([0-9]+)(\\\"|\\\')");

    var height = data.match(height_re);


    var link_re = new RegExp(
	"addParam\\\((\\\"|\\\')format(\\\"|\\\'),"+
	    "\\s*(\\\"|\\\')mp4(\\\"|\\\'),"+
	    "\\s*(\\\"|\\\')([^\\\"\\\']+)(\\\"|\\\')");

    var link = data.match(link_re);

    if (!width || !width[width.length-2] ||
	!height || !height[height.length-2] ||
	!link || !link[link.length-2])
    {
	return null;
    }

    var object_data = new Object();
    object_data.parent = el;
    object_data.linterna_magica_id =
	this.mark_flash_object("extracted-from-script");

    object_data.width= width[width.length-2];
    object_data.height= height[height.length-2];
    object_data.link = link[link.length-2];
    
    return object_data;
}

LinternaMagica.prototype.sites["video.repubblica.it"].do_not_force_iframe_detection =
function()
{
    return false;
}


LinternaMagica.prototype.sites["video.repubblica.it"].skip_video_id_extraction =
function()
{
    if (this.plugin_is_installed)
    {
	return true;
    }

    return false;
}

LinternaMagica.prototype.sites["video.repubblica.it"].skip_link_extraction =
function()
{
    if (this.plugin_is_installed)
    {
	return true;
    }

    return false;
}

LinternaMagica.prototype.sites["video.repubblica.it"].css_fixes =
function(object_data)
{
    var id = object_data.linterna_magica_id;
    var lm = document.getElementById("linterna-magica-"+id);

    if (lm)
    {
	var flash_warning = lm.parentNode.nextSibling;
	this.remove_plugin_install_warning(flash_warning);
    }
}
