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
// @source http://linterna-magica.nongnu.org

// END OF LICENSE HEADER

// Support for The Onion dot com

// Extracts data for the flash object in The Onion dot com from a script
LinternaMagica.prototype.extract_object_from_script_theonion = function()
{
    var player_container = document.getElementById("player_container");

    if (!player_container)
    {
	return null;
    }

    var data = this.script_data;
    var video_id_re = new RegExp (
	"var\\\s*afns_video_id\\\s*="+
	    "\\\s*(\\\"|\\\')([0-9]+)(\\\"|\\\')");

    var video_id = data.match(video_id_re);

    if (!video_id)
    {
	return null;
    }

    video_id = video_id[video_id.length-2];

    var width = player_container.clientWidth;
    var height = player_container.clientHeight;
    
    if (!width || !height)
    {
	return null;
    }

    var flash_object = document.getElementById("player_container_api");

    var object_data = new Object();

    object_data.video_id = video_id;
    object_data.width = width;
    object_data.height = height;
    object_data.parent = player_container;

    if (flash_object)
    {
	object_data.linterna_magica_id = 
	    this.mark_flash_object(flash_object);
    }
    else
    {
	object_data.linterna_magica_id = 
	    this.mark_flash_object("extracted-from-script");
    }

    return object_data;
}

// Add custom click event listeners to the buttons that change the
// clips. This is active only on the front page.
LinternaMagica.prototype.capture_theonion_clip_change = function(object_data)
{
    var list = document.getElementById("onn_recent");

    if (!list || !/HTMLUListElement/i.test(list))
    {
	return null;
    }

    var self = this;
    var click_function = function(ev)
    {
	var el = this;
	var od = object_data;

	self.theonion_clip_change_click_function.apply(self,[ev,el,od]);
    };

    var buttons = list.getElementsByTagName("li");

    for (var i=0,l=buttons.length; i<l; i++)
    {
	var li = buttons[i];
	li.addEventListener("click", click_function, true);
    }
}

// Event listener for click on <li> elements, that change the iframe
// src.
LinternaMagica.prototype.theonion_clip_change_click_function =
function(event,element,object_data)
{
    var p = element.getElementsByTagName("p");

    for (var i=0, l=p.length; i<l; i++)
    {
	if (p[i].hasAttribute("rel") &&
	    p[i].hasAttribute("class") &&
	    /title/i.test(p[i].getAttribute("class")))
	{
	    object_data.video_id = p[i].getAttribute("rel");
	    this.request_video_link(object_data);

	    var lm = this.get_video_object(object_data.linterna_magica_id);
	    // The whole LM wrapper
	    lm = lm.parentNode;

	    // Remove the object, because the XHR will call
	    // create_video_object and will make new one.
	    object_data.parent.removeChild(lm);
	    
	    break;
	}
    }
}

LinternaMagica.prototype.sites["theonion.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.theonion.com"] = "theonion.com";

LinternaMagica.prototype.sites["theonion.com"].flash_plugin_installed =
function()
{
    // Call the default when no plugin is installed. Examine scripts.
    this.log("LinternaMagica.sites.flash_plugin_installed:\n",
	     "Calling default function to extract scripts");
    return this.sites.__no_flash_plugin_installed.apply(this, [arguments]);
}

