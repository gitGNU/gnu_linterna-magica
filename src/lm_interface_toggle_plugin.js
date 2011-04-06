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
// @source http://e-valkov.org/linterna-magica

// END OF LICENSE HEADER

// Create the link/button to switch between flash plugin and
// Linterna Mágica
LinternaMagica.prototype.create_toggle_plugin_link = function(plugin_priority,id)
{
    var toggle_plugin = document.createElement("a");
    var self = this;
    var wrapper = null;
    toggle_plugin.setAttribute("href", "#");
    if (plugin_priority)
    {
	toggle_plugin.setAttribute("class", "linterna-magica-toggle-plugin");
    }
    toggle_plugin.addEventListener("click", function(ev)
    				   {
				       var el = this;
				       self.toggle_plugin.
					   apply(self, [ev, el]);
    				   }, false);
    if (plugin_priority)
    {

	toggle_plugin.textContent = "Linterna Mágica >>";

	// Fix link displacement after an object (vbox7 and others)
	wrapper = document.createElement("p");
	wrapper.appendChild(toggle_plugin);
	wrapper.style.setProperty("position", "relative", "important");
    }
    else
    {
	toggle_plugin.textContent = this._("Plugin");
	toggle_plugin.setAttribute("class", 
				   "linterna-magica-toggle-plugin-header");
	toggle_plugin.setAttribute("id", 
				   "linterna-magica-toggle-plugin-header-"+id);
    }

    toggle_plugin.setAttribute("title",
			       this._("Switch between flash plugin"+
				 " and Linterna Mágica"));

    return wrapper ? wrapper : toggle_plugin;
}

// Event listener function that switches between flash plugin and
// Linterna Mágica
LinternaMagica.prototype.toggle_plugin = function(event,element)
{
    event.preventDefault();

    // for the header link
    // element->header->container_div->object
    // for the external link
    // element->p->div_with_object->object

    var parent = element.parentNode;
    if (parent.previousSibling &&
	/object|embed/i.test(parent.previousSibling.localName))
    {
	// Must be "external" toggle_plugin link (Linterna Mágica >>)
	var obj = parent.previousSibling;
    }
    else
    {
	var id = element.getAttribute("id");
	id = id.split("-");
	id = id[id.length-1];
	// Must be toggle_plugin link in header
	var obj = document.getElementById("linterna-magica-video-object-"+id);
	    // element.parentNode.parentNode.
    	    // getElementsByTagName("object")[0];
    }

    // Give up
    if (!obj)
	return null;

    var type = obj.getAttribute("type");
    // Not every swf has type
    // There might be a problem with <object><embed></object> structures
    // where the object has no attributes for flash detection
    if (this.is_swf_object(obj))
    {
	this.log("LinternaMagica.toggle_plugin:\n"+
		 "Replacing swf object (id:"+
		 obj.getAttribute("linterna_magica_id")+
		 ") with video object.", 4);

	var video_object = this.video_objects[
	    obj.getAttribute("linterna_magica_id")];

	// The link is in a paragraph (because of link displacement
	// fix in some sites)
	obj.parentNode.insertBefore(video_object, parent);

	// Init the web controls
	if (this.controls)
	{
	    this.player.init.apply(this,[
		obj.getAttribute("linterna_magica_id")]);
	}
    	obj.parentNode.removeChild(obj);
	parent.style.setProperty("display", "none", "important");
    }
    else if(/video/i.test(type))
    {
	this.log("LinternaMagica.toggle_plugin:\n"+
		 "Replacing video object (id:"+
		 obj.getAttribute("linterna_magica_id")+
		 ") with swf object.", 4);

	// Must be the toggle plugin link
	obj.parentNode.nextSibling.style.removeProperty("display");

	var dirty_object = this.dirty_objects[
	    obj.getAttribute("linterna_magica_id")];
	obj.parentNode.parentNode.insertBefore(dirty_object,
					       obj.parentNode.nextSibling);

    	obj.parentNode.parentNode.removeChild(obj.parentNode);
    }
}
