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

// Uses the extracted object data (width, link, placement ...)
// to create the video object playable by totem/vlc/gecko-mediaplayer
LinternaMagica.prototype.create_video_object = function(object_data)
{
    if (typeof(object_data) !== "object")
	return;

    var id = object_data.linterna_magica_id;
    this.log("LinternaMagica.create_video_object:\n"+
	     "Creating video object with linterna_magica_id "+id,2);

    // Check if another object is created already there and skip.
    // this.dirty_objects[(id-1)] will brak for scripts, because it is
    // null
    if (((id-1) >= 0))
    {
	// Will break if the there is object that is not created just
	// before this one.
	var lm_instance = 
	    document.getElementById("linterna-magica-"+(id-1));
	if (lm_instance && lm_instance.parentNode &&
	    lm_instance.parentNode == object_data.parent)
	{
	     this.log("LinternaMagica.create_video_object:\n"+
		      "It seems object with linterna_magica_id "+id+
		      " will be created at the same place where object "+
		      "with linterna_magica_id "+(id-1)+" already exists. "+
		      "Not creating object with id #"+id,1);
	    return null;
	}
    }

    var container = document.createElement("div");
    var header = document.createElement("div");
    var script_name = document.createElement("a");
    var dw_link = document.createElement("a");
    var object_tag = document.createElement("object");
    var message = document.createElement("p");
    var param = document.createElement("param");

    container.setAttribute("id", "linterna-magica-"+id);
    container.setAttribute("class", "linterna-magica");
    container.style.setProperty("width",
				(object_data.width+"px"), "important");


    header.setAttribute("class", "linterna-magica-header");
    header.setAttribute("id", "linterna-magica-header-"+id);
    header.style.setProperty("width",
			     ((parseInt(object_data.width))+"px"),
			     "important");


    script_name.textContent = "Linterna Mágica";
    script_name.setAttribute("href", "#");
    script_name.setAttribute("title", _("About")+ " Linterna Mágica");
    script_name.setAttribute("id", "linterna-magica-logo-"+id);
    script_name.setAttribute("class", "linterna-magica-logo");

    var self = this;
    script_name.addEventListener("click", function(ev){
	var el = this;
	self.about.apply(self, [ev, el]);
    }, false);

    // If the plugin is not installed this is useless
    if (this.plugin_is_installed)
    {
	// append before download link (first button in the header)
	var toggle_plugin = this.create_toggle_plugin_link(null,id);
	header.appendChild(toggle_plugin);
    }

    dw_link.textContent = _("Download");
    dw_link.setAttribute("title", _("Save the video clip"));

    dw_link.setAttribute("id", "linterna-magica-video-download-link-"+id);
    dw_link.setAttribute("class", "linterna-magica-video-download-link");
    dw_link.setAttribute("href", object_data.link);

    if (!object_data.link)
    {
	dw_link.style.setProperty("display", "none", "important");
    }

    header.appendChild(dw_link);

    // Create HD links
    if (object_data.hd_links)
    {
	var hd_wrapper = document.createElement("div");
	var hd_button = document.createElement("a");
	hd_button.setAttribute("href","#");
	hd_button.textContent = _("HQ");
	hd_button.setAttribute("title", _("Higher quality"));
	hd_button.setAttribute("class", "linterna-magica-switch-hd");
	hd_button.addEventListener("click", function(ev)
				   {
				       var el = this;
				       self.show_or_hide_hd_links.
					   apply(self, [ev, el]);
				   }, false);

	hd_wrapper.appendChild(hd_button);

	var hd_links = document.createElement("div");
	hd_links.setAttribute("id", "linterna-magica-hd-links-list-"+id);
	hd_links.setAttribute("class", "linterna-magica-hd-links-list");
	hd_links.style.setProperty("display","none","important");

	var ul = document.createElement("ul");

	for(var link=0; link<object_data.hd_links.length; link++)
	{
	    var li = document.createElement("li");
	    var button = document.createElement("a");
	    button.setAttribute("href",object_data.hd_links[link].url);
	    button.textContent = object_data.hd_links[link].label;
	    button.addEventListener("click", function(ev)
				    {
					var el = this;
					self.switch_to_hd_link.
					    apply(self, [ev, el]);
				    }, false);

	    li.appendChild(button);
	    ul.appendChild(li);
	}
	hd_links.appendChild(ul);
	hd_wrapper.appendChild(hd_links);
	header.appendChild(hd_wrapper);
    }

    header.appendChild(script_name);

    // Log to web
    if (this.debug_level && this.log_to == "web")
    {
	var log_link  =  this.create_web_log_link(id);
	log_link.addEventListener("click", function(ev)
				  {
				      var el = this;
				      self.show_or_hide_web_log.
					  apply(self, [ev, el]);
				  }, false);

	header.appendChild(log_link);
	// Hide the web log, so it accessible only from interface.
	var log = document.getElementById("linterna-magica-web-log");
	log.style.setProperty("display","none", "important");
    }

    object_tag.setAttribute("width", object_data.width);
    object_tag.setAttribute("height", object_data.height);
    object_tag.setAttribute("id","linterna-magica-video-object-"+id);
    object_tag.setAttribute("standby", _("Loading video..."));

    if (object_data.link)
    {
	var mime = object_data.mime ? object_data.mime : "video/flv";
	object_tag.setAttribute("type", mime);
	object_tag.setAttribute("data", object_data.link);
    }

    message.textContent = _("Waiting for video plugin...");

    param.setAttribute("name", "autoplay");
    // Start only the first found clip
    param.setAttribute("value", (id > 0) ? "false" : this.autostart);

    object_tag.appendChild(param);

    param = document.createElement("param");
    param.setAttribute("name", "showcontrols");
    // controls = true is for our web controls. Reverse logic for the plugin
    param.setAttribute("value", (this.controls ? "false": "true"));
    object_tag.appendChild(param);

    // VLC uses toolbar
    param = document.createElement("param");
    param.setAttribute("name", "toolbar");
    param.setAttribute("value", (this.controls ? "false": "true"));
    object_tag.appendChild(param);

    // totemNarrowspace (QuickTime) uses controller
    param = document.createElement("param");
    param.setAttribute("name", "controller");
    param.setAttribute("value", (this.controls ? "false": "true"));
    object_tag.appendChild(param);

    param = document.createElement("param");
    param.setAttribute("name", "cache");
    param.setAttribute("value",  true);
    object_tag.appendChild(param);

    object_tag.appendChild(message);
    container.appendChild(header);
    container.appendChild(object_tag);

    var about_box = this.create_about_box(id);
    // Fix dailymotion (otherwise it is set to 100%
    // and it goes out of the "box")
    about_box.style.setProperty("height",
				object_data.height+"px",
				"important");
    container.appendChild(about_box);

    object_tag.setAttribute("linterna_magica_id", id);

    // Add link after the object/embed
    // this.set_priority() has set this.priority
    // to self if there is no plugin
    if (this.plugin_is_installed)
    {
	toggle_plugin = this.create_toggle_plugin_link(this.priority, id);

	// Fix displacement of toggle_plugin link/button in vimeo
	if (/vimeo\.com/i.test(window.location.hostname))
	{
	    toggle_plugin.style.setProperty("top", 
					    parseInt(object_data.height)+10+
					    "px", "important");
	}

	var before = this.dirty_objects[id].nextSibling;
	if (before)
	{
	    object_data.parent.insertBefore(toggle_plugin, before);
	}
	else
	{
	    object_data.parent.appendChild(toggle_plugin);
	}
	if (!/plugin/i.test(this.priority))
	{
	    toggle_plugin.style.setProperty("display", "none",
					    "important");
	}
    }

    if (this.controls)
    {
	var controls = this.create_controls(object_data);
	container.appendChild(controls);
    }

    // IMPORTANT: First remove the object
    // then insert the new one, otherwise a loop is created
    // in extract_objects_from_dom.

    // Remove the object if it is in DOM
    // Objects extracted from script has null value in this.dirty_objects
    if (/self/i.test(this.priority)
	&& this.dirty_objects[id]
	// The object is still in DOM some scripts remove it
       && this.dirty_objects[id].parentNode)
    {
	if(this.dirty_objects[id].nextSibling)
	{
	    object_data.use_sibling = this.dirty_objects[id].nextSibling;
	}

	object_data.parent.removeChild(this.dirty_objects[id]);
    }

    if (/self/i.test(this.priority) && this.plugin_is_installed)
    {
	object_data.parent.insertBefore(container, toggle_plugin);
    }
    else if(/self/i.test(this.priority))
    {
	if (object_data.use_sibling)
	{
	    object_data.parent.insertBefore(
		container,
		object_data.use_sibling);
	}
	else
	{
	    if (object_data.parent)
	    {
		object_data.parent.appendChild(container);
	    }
	}
    }

    // Various CSS fix-ups
    container.style.setProperty("height",
				((parseInt(object_data.height)+26+
				  (this.controls ? 24 : 0))+"px"),
				"important");

    // The thumbnail image overlaps the toggle plugin button after our
    // changes. This way our button is visible.
    if (/vimeo\.com/i.test(window.location.hostname) && 
	object_data.parent.firstChild)
    {
	// The first child should be a div with thumbnail as
	// background. Reduce it's size so it will not overlap our
	// button.
	object_data.parent.firstChild.style.
	    setProperty("height", parseInt(object_data.height)+"px",
			"important");
    }

    if (object_data.parent)
    {
	var move_down_fb_frame = null;
	if (/mqsto\.com/i.test(window.location.hostname))
	{
	    // Move the facebook comment frame in mqsto.com 100px
	    // down. overlaps the player.
	    move_down_fb_frame = 100;
	}

	object_data.parent.style.setProperty("height",
					     (parseInt(object_data.height)+
					      26+(move_down_fb_frame ? 
						  move_down_fb_frame: 0)+
					      // borders 1px x 2
					      2+
					      (this.controls ? 24 : 0))+"px",
					     "important");

	// Show HD links list. 
	if (/vimeo\.com/i.test(window.location.hostname))
	{
	    object_data.parent.style.
	    	setProperty("overflow", "visible", "important");

	    object_data.parent.parentNode.style.
	    	setProperty("overflow", "visible", "important");
	}
	// if (/vimeo\.com/i.test(window.location.hostname))
	// {
	//     // object_data.parent.parentNode.style.
	//     // 	setProperty("overflow-y", "visible", "important");

	//     // Hides the HD links menu
	//     // object_data.parent.parentNode.style.
	//     // 	setProperty("overflow-x", "hidden", "important");
	// }
    }

    // Objects extracted from script usually does not have cloned object
    // For example youtube
    if (this.dirty_objects[id])
    {
	// Prevent the object to fill the container at 100% (if set)
	// This way the toggle plugin link after the object is not
	// overlaping elements.
	this.dirty_objects[id].style.setProperty("height",
						 object_data.height+"px",
						 "important");
    }
    // Prevent the video object to fill the area at 100% and overlap
    // other elements. This happends if the site CSS sets this
    object_tag.style.setProperty("height",
				 object_data.height+"px",
				 "important");

    object_tag.style.setProperty("width",
				 object_data.width+"px",
				 "important");

    // No idea what this fixes.
    if (/vimeo\.com/i.test(window.location.href))
    {
	object_tag.style.setProperty("position","relative","important");
    }

    if (this.plugin_is_installed)
    {
	// Remove backrounds so the toggle plugin link is visible
	// (for example youtube)
	object_data.parent.style.
	    setProperty("background-color", "transparent",
			"important");

	// Fixes script crash in vimeo.com with firefox. if
	// parent.parentNode is not an object
	if (object_data.parent.parentNode)
	{
	    object_data.parent.parentNode.
		style.setProperty("background-color", "transparent",
				  "important");
	}
    }

    // Fixes script crash in vimeo.com with firefox. if
    // parent.parentNode is not an object
    if (object_data.parent && object_data.parent.parentNode)
    {

	// The CSS hides parts of our elements
	if (/tv7\.bg/i.test(window.location.hostname) ||
	    /vimeo\.com/i.test(window.location.hostname))
	{
	    object_data.parent.parentNode.style.
		setProperty("height",
			    (parseInt(object_data.height)+26+
			     // borders 1px x 2
			     2+
			     (this.controls ? 24 : 0)  )+"px",
			    "important");

	    object_data.parent.parentNode.style.
		setProperty("width",
			    (parseInt(object_data.width+2))+"px",
			    "important");
	}

	if (/tv7\.bg/i.test(window.location.hostname) ||
	    /vimeo\.com/i.test(window.location.hostname))
	{
	    var third_parent = object_data.parent.parentNode.parentNode;
	    if (third_parent)
	    {
		third_parent.style.setProperty("overflow", "visible", "important");
		third_parent.style.
		    setProperty("height", 
				(parseInt(object_data.height)+26+
				 // borders 1px x 2
				 2+
				 (this.controls ? 24 : 0)  )+"px",
				"important");
	    }
	}

	if (/vimeo\.com/i.test(window.location.hostname) ||
	    /reuters\.com/i.test(window.location.hostname))
	{
	    // Extra height for reuters.com. Otherwise the controlls
	    // are hidden.
	    var reuters = 
		/reuters\.com/i.test(window.location.hostname) ? 100 : 0;

	    var fourth_parent = object_data.parent.parentNode.parentNode.parentNode;
	    if (fourth_parent)
	    {
		fourth_parent.style.setProperty("overflow", "visible", "important");
		fourth_parent.style.
		    setProperty("height", 
				(parseInt(object_data.height)+26+
				 reuters+
				 // borders 1px x 2
				 2+
				 (this.controls ? 24 : 0)  )+"px",
				"important");
	    }
	}


	// dailymotion.com && metacafe.com && btn.bg
	// These have single div inside another one
	// which (through height) overlaps elemenst
	// It is not good to be applied on parent.parentNode
	// which has different number of childNodes
	if ((object_data.parent.parentNode.childNodes.length === 3 &&
	     // text node
	     object_data.parent.parentNode.firstChild.nodeType === 3 &&
	     object_data.parent.parentNode.lastChild.nodeType === 3) ||
	    object_data.parent.parentNode.localName.toLowerCase() === "li")

	{
	    object_data.parent.parentNode.style.
		setProperty("height",
			    (parseInt(object_data.height)+26+
			     // borders 1px x 2
			     2+
			     (this.controls ? 24 : 0)  )+"px",
			    "important");

	    this.log("LinternaMagica.create_video_object:\n"+
		     "Detected single wrapper "+
		     "element inside another one. Aplying parent.parent "+
		     "height: "+(parseInt(object_data.height)+26)+"px", 4);
	}
    }

    // Temporary
    // parent.style.setProperty("border", "1px solid red", "important");

    // Push to video object list
    this.video_objects.push(container);

    // Init the web controls functions
    // only if Linterna Mágica has priority
    if (this.controls &&
	/self/i.test(this.priority))
    {
	this.player.init.apply(this,[id]);
    }

    // Examine the option for updates and check if necessary.
    this.check_for_updates();

    return null;
}
