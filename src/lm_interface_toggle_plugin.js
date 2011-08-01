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

// Create the link/button to switch between flash plugin or HTML5
// player and Linterna Mágica
LinternaMagica.prototype.create_toggle_plugin_link =
function(not_in_header,id,switch_type)
{
    var toggle_plugin = document.createElement("a");
    var self = this;
    var wrapper = null;

    toggle_plugin.setAttribute("href", "#");

    if (not_in_header)
    {
	toggle_plugin.setAttribute("class", "linterna-magica-toggle-plugin");
    }

    var toggle_plugin_click_function = function(ev)
    {
	var el = this;
	self.toggle_plugin.apply(self, [ev, el]);
    };
    				   
    toggle_plugin.addEventListener("click",
				   toggle_plugin_click_function, false);

    if (not_in_header)
    {

	toggle_plugin.textContent = "Linterna Mágica >>";
	toggle_plugin.setAttribute("id", 
				   "linterna-magica-toggle-plugin-"+id);
	// Fix link displacement after an object (vbox7 and others)
	wrapper = document.createElement("p");
	wrapper.appendChild(toggle_plugin);
	wrapper.style.setProperty("position", "relative", "important");
    }
    else
    {
	if (/html5/i.test(switch_type))
	{
	    toggle_plugin.textContent = this._("HTML5");
	}
	else
	{
	    toggle_plugin.textContent = this._("Plugin");
	}

	toggle_plugin.setAttribute("class", 
				   "linterna-magica-toggle-plugin-header");
	toggle_plugin.setAttribute("id", 
				   "linterna-magica-toggle-plugin-header-"+id);
    }

    if (/html5/i.test(switch_type))
    {
	toggle_plugin.setAttribute("title",
				   this._("Switch between site's HTML5 "+
					  "player and Linterna Mágica"));
    }
    else
    {
	toggle_plugin.setAttribute("title",
				   this._("Switch between flash plugin"+
					  " and Linterna Mágica"));
    }

    return wrapper ? wrapper : toggle_plugin;
}

// Event listener function that switches between flash plugin or HTML5
// player and Linterna Mágica
LinternaMagica.prototype.toggle_plugin = function(event,element)
{
    event.preventDefault();

    // for the header link
    // element->header->container_div->object
    // for the external link
    // element->p->div_with_object->object

    var linterna_magica_id = element.getAttribute("id");
    linterna_magica_id = linterna_magica_id.split("-");
    linterna_magica_id = linterna_magica_id[linterna_magica_id.length-1];

    var video_object =
	document.getElementById("linterna-magica-video-object-"+
				linterna_magica_id);

    if (!video_object)
    {
	return null;
    }

    var html5_parent = null;

    var site_player = 
	this.get_flash_video_object(linterna_magica_id,
				    // The parent of the div holding
				    // Linterna Mágica
				    video_object.parentNode.parentNode);
    if (!site_player)
    {
	html5_parent = video_object.parentNode.parentNode;
	site_player = 
	    this.find_site_html5_player_wrapper(html5_parent);

	if (!site_player)
	{
	    return null;
	}
    }

    // Visible flash, hidden video object. Display has value (none)
    // when the object is hidden.
    if (!site_player.style.getPropertyValue("display") &&
	video_object.parentNode.style.getPropertyValue("display"))
    {
	this.log("LinternaMagica.toggle_plugin:\n"+
		 "Replacing/hiding swf object (id:"+
		 linterna_magica_id+
		 ") with video object.", 4);

	if (!html5_parent)
	{
	    this.hide_flash_video_object(linterna_magica_id, 
					 site_player.parentNode);
	}
	else
	{
	    this.pause_site_html5_player(html5_parent);
	    this.hide_site_html5_player(html5_parent);
	}

	this.show_lm_video(linterna_magica_id);

	// Init the web controls
	if (this.controls)
	{
	    this.player.init.apply(this,[linterna_magica_id]);
	}
	
	// Hide the external toggle plugin link
	var ext_toggle_wrapper = video_object.parentNode.nextSibling;
	ext_toggle_wrapper.style.setProperty("display", "none", "important");
    }
    // Hidden flash, visible video object. Display has value (none)
    // when the object is hidden.
    else if (!video_object.parentNode.style.getPropertyValue("display") &&
	     site_player.style.getPropertyValue("display"))
    {
	this.log("LinternaMagica.toggle_plugin:\n"+
		 "Replacing/hiding video object (id:"+
		 linterna_magica_id+
		 ") with swf object.", 4);

	if (!html5_parent)
	{
	    this.show_flash_video_object(linterna_magica_id, 
					 site_player.parentNode);

	}
	else
	{
	    this.show_site_html5_player(html5_parent);
	}

	this.hide_lm_video(linterna_magica_id);
	
	// External toggle plugin link
	var ext_toggle_wrapper = video_object.parentNode.nextSibling;
	ext_toggle_wrapper.style.removeProperty("display");
    }
}
