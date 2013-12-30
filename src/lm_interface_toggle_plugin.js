//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012, 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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
function(id)
{
    var toggle_plugin = document.createElement("a");
    var self = this;
    var wrapper = null;

    toggle_plugin.setAttribute("href", "#");

    toggle_plugin.setAttribute("class", "linterna-magica-toggle-plugin");

    var toggle_plugin_click_function = function(ev)
    {
	var el = this;
	self.toggle_plugin.apply(self, [ev, el]);
    };
    				   
    toggle_plugin.addEventListener("click",
				   toggle_plugin_click_function, false);

    toggle_plugin.textContent = "Linterna Mágica >>";
    toggle_plugin.setAttribute("id", 
			       "linterna-magica-toggle-plugin-"+id);

    var span = document.createElement("span");
    span.setAttribute("class", "linterna-magica-toggle-plugin-outer-frame");
    span.appendChild(toggle_plugin);

    wrapper = document.createElement("p");
    wrapper.appendChild(span);
    wrapper.setAttribute("class", "linterna-magica-toggle-plugin-wrapper");

    var title = this.
	_("Switch between site's HTML5 player and Linterna Mágica");

    toggle_plugin.setAttribute("title", title);

    return wrapper;
}

// Event listener function that switches between flash plugin or HTML5
// player and Linterna Mágica
LinternaMagica.prototype.toggle_plugin = function(event,element)
{
    event.preventDefault();

    var linterna_magica_id = element.getAttribute("id");
    linterna_magica_id = linterna_magica_id.split("-");
    linterna_magica_id = linterna_magica_id[linterna_magica_id.length-1];

    var lm_interface =
	document.getElementById("linterna-magica-"+linterna_magica_id);

    if (!lm_interface)
    {
	return null;
    }

    var html5_parent = lm_interface.parentNode;
    site_player = 
	this.find_site_html5_player_wrapper(html5_parent);

    if (!site_player)
    {
	return null;
    }

    site_player.parentNode.removeChild(site_player);
    this.show_lm_interface(linterna_magica_id);

    // Init the web controls
    if (this.controls)
    {
	this.player.init.apply(this,[linterna_magica_id]);
    }
    
    // <div> <span> <a> </a> </span> </div>
    var ext_toggle_wrapper = element.parentNode.parentNode;
    // Hide the external toggle plugin link
    ext_toggle_wrapper.style.setProperty("display", "none", "important");
}
