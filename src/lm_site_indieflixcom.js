//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011, 2012, 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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

LinternaMagica.prototype.sites["indieflix.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.indieflix.com"] = "indieflix.com";

LinternaMagica.prototype.sites["indieflix.com"].custom_html5_player_finder =
function(parent)
{
    var html5_player_element = null;

    html5_player_element = 
	document.getElementById("player_displayarea");

    return html5_player_element;
}

LinternaMagica.prototype.sites["indieflix.com"].do_not_force_iframe_detection =
function()
{
    return false;
}

LinternaMagica.prototype.sites["indieflix.com"].css_fixes =
function(object_data)
{
    var id = object_data.linterna_magica_id;

    // Fix hidden HD links menu
    var lm = document.getElementById("linterna-magica-"+id);
    var central_player = lm.parentNode.parentNode;

    if (central_player)
    {
	central_player.style.setProperty("overflow", "visible",
					 "important");
    }

    // Page element overlaps the LM elements. Fix it.
    lm.style.setProperty("z-index", "99999999", "important");

    return false;
}

// An attempt to support Midori 0.4.0. The JWPlayer script loads
// slowly than LM and replaces it. Most of the time Midori 0.4.0 hangs
// or crashes here. 
LinternaMagica.prototype.sites["indieflix.com"].
replace_extracted_object_from_script =
function(object_data)
{
    if (!this.indieflix_html5_element_timeout)
    {
	this.log("LinternaMagica.sites.replace_extracted_"+
		 "object_from_script:\n"+
		 "Delaying video object creation in Indieflix.",3);
	this.indieflix_html5_element_counter = 0;
	var data = object_data;
	var self = this;

	this.indieflix_html5_element_timeout =
	    setInterval(function() {
	    	self.detect_indieflix_html5_element.
	    	    apply(self,[data]);
	    }, 2000);
    }
    return false;
}

LinternaMagica.prototype.detect_indieflix_html5_element =
function(object_data)
{
    this.indieflix_html5_element_counter++;

    var html5_element = 
	this.find_site_html5_player_wrapper(object_data.parent);
    var insert_object = null;

    // 2 seconds at once
    if (this.indieflix_html5_element_counter >= 1 || html5_element)
    {
	clearInterval(this.indieflix_html5_element_timeout);

	this.log("LinternaMagica.detect_indieflix_html5_element:\n"+
		 "Removing plugin install warning.",2);

	this.remove_plugin_install_warning(object_data.parent);

	this.log("LinternaMagica.detect_indieflix_html5_element:\n"+
		 "Creating video object.",2);

	this.create_video_object(object_data);
    }
}
