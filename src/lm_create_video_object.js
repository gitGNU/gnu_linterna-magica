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

    // Fix for rtl languages. See
    // https://savannah.nongnu.org/bugs/?32740
    // https://savannah.nongnu.org/task/?11056
    container.setAttribute("dir", this.languages[this.lang].__direction);

    var lang_code = this.lang.split("_")[0];
    if (!lang_code)
    {
	// The locale is C
	lang_code = "en";
    }

    container.setAttribute("xml:lang", lang_code);
    container.setAttribute("lang", lang_code);

    container.style.setProperty("width",
				(object_data.width+"px"), "important");

    header.setAttribute("class", "linterna-magica-header");
    header.setAttribute("id", "linterna-magica-header-"+id);
    header.style.setProperty("width",
			     ((parseInt(object_data.width))+"px"),
			     "important");


    script_name.textContent = "Linterna Mágica";
    script_name.setAttribute("href", "#");
    script_name.setAttribute("title", this._("About")+ " Linterna Mágica");
    script_name.setAttribute("id", "linterna-magica-logo-"+id);
    script_name.setAttribute("class", "linterna-magica-logo");

    var self = this;
    script_name.addEventListener("click", function(ev)
				 {
				     var el = this;
				     self.about.apply(self, [ev, el]);
				 }, false);

    var site_html5_player =
	this.find_site_html5_player_wrapper(object_data.parent);

    var toggle_plugin_switch_type = 
	site_html5_player ? "html5" : "plugin";

    // If the plugin is not installed this is useless
    if (this.plugin_is_installed || site_html5_player)
    {
	// append before download link (first button in the header)
	var toggle_plugin = 
	    this.create_toggle_plugin_link(null,id,
					   toggle_plugin_switch_type);

	header.appendChild(toggle_plugin);
    }

    dw_link.textContent = this._("Download");
    dw_link.setAttribute("title", this._("Save the video clip"));

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
	var preferred_link = 
	    this.compute_preferred_hd_link(object_data.hd_links);

	// No link is calculated. Set to lowest.
	if (preferred_link == null || isNaN(preferred_link))
	{
	    preferred_link = 
		object_data.hd_links[object_data.hd_links.length-1];
	}

	var hd_wrapper = document.createElement("div");
	var hd_button = document.createElement("a");
	hd_button.setAttribute("href","#");
	hd_button.textContent = this._("HQ");
	hd_button.setAttribute("title", this._("Higher quality"));
	hd_button.setAttribute("class", "linterna-magica-switch-hd");

	var hd_button_click_function =  function(ev)
	{
	    var el = this;
	    self.show_or_hide_hd_links.apply(self, [ev, el]);
	};

	hd_button.addEventListener("click",
				   hd_button_click_function, false);

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

	    var button_click_function = function(ev)
	    {
		var el = this;
		self.switch_to_hd_link.apply(self, [ev, el]);
	    };

	    button.addEventListener("click",
				    button_click_function , false);

	    // Preferred link 
	    if (link == preferred_link)
	    {
		// Set the link in the interface
		this.select_hd_link_in_list(button,id);

		// Set the link for the player and download link.
		object_data.link = object_data.hd_links[link].url;
		dw_link.setAttribute("href",
				     object_data.hd_links[link].url);
	    }

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

	var log_link_click_function = function(ev)
	{
	    var el = this;
	    self.show_or_hide_web_log.apply(self, [ev, el]);
	};

	log_link.addEventListener("click",
				  log_link_click_function, false);

	header.appendChild(log_link);
	// Hide the web log, so it is accessible only from the interface.
	var log = document.getElementById("linterna-magica-web-log");
	log.style.setProperty("display","none", "important");
    }

    object_tag.setAttribute("width", object_data.width);
    object_tag.setAttribute("height", object_data.height);
    object_tag.setAttribute("id","linterna-magica-video-object-"+id);
    object_tag.setAttribute("standby", this._("Loading video..."));

    if (object_data.link)
    {
	var mime = object_data.mime ? object_data.mime : "video/flv";

 	// Fix for video/mp4 (and other QuickTime clips) for
	// totemNarrowSpace plugin. Fixes these issues of
	// totemNarrowSpace plugin:
	// - No API for fullscreen. 
	// - The UA it sends is different from the browser, Vimeo does
	// not load.
	// With video/flv totemCone plugin will load.
	if (/mp4|m4v|quicktime/i)
	{
	    var mp4 = navigator.mimeTypes["video/mp4"];
	    if (mp4 && mp4.enabledPlugin && mp4.enabledPlugin.name &&
		/totem/i.test(mp4.enabledPlugin.description))
	    {
		mime = "video/flv";
	    }
	}

	object_tag.setAttribute("type", mime);
	object_tag.setAttribute("data", object_data.link);
    }

    message.textContent = this._("Waiting for video plugin...");

    param.setAttribute("name", "autoplay");
    // Find if a clip is already playing.
    var started_clip = this.find_started_clip();

    param.setAttribute("value",
		       (started_clip !== null) ? "false" : this.autostart);

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
				// Using the exact height with small
				// objects hides the homepage link.
				(parseInt(object_data.height)-20)+"px",
				"important");
    container.appendChild(about_box);
    
    // Mark the object, so it is not processed and chacked after
    // insertion. The function mark_flash_object will use new id and
    // that might not be a good idea (object count, XHRs, duplicate
    // objects ... ). The linterna_magica_id property is set ot a
    // float, so it is not the same as the one of the flash object.
    object_tag.linterna_magica_id =
	parseFloat(object_data.linterna_magica_id+".1");

    // Add link after the object/embed
    // this.set_priority() has set this.priority
    // to self if there is no plugin
	if (this.plugin_is_installed || site_html5_player)
    {
	toggle_plugin =
	    this.create_toggle_plugin_link("link-not-in-header", id,
					  toggle_plugin_switch_type);

	var before = null;

	if (this.plugin_is_installed && !site_html5_player)
	{
	    before = this.get_flash_video_object(id).nextSibling;
	}
	else if (site_html5_player)
	{
	    before = site_html5_player.nextSibling;
	}

	if (before)
	{
	    object_data.parent.insertBefore(toggle_plugin, before);
	}
	else
	{
	    object_data.parent.appendChild(toggle_plugin);
	}

	if (((this.priority.self > this.priority.plugin) && 
	     this.plugin_is_installed && !site_html5_player) ||
	    ((this.priority.self > this.priority.html5) &&
	     site_html5_player))
	{
	    // Hide the toggle plugin button only if self has higher
	    // priority then plugin and html5.
	    toggle_plugin.style.setProperty("display", "none",
					    "important");
	}
    }

    if (this.controls)
    {
	var controls = this.create_controls(object_data);
	container.appendChild(controls);
    }

    var dom_object =  this.get_flash_video_object(id);

    if (!dom_object)
    {
	dom_object = site_html5_player;
    }

    // Remove/hide the object if it is in DOM
    if ((((this.priority.self > this.priority.plugin) &&
	  !site_html5_player) || 
	 ((this.priority.self > this.priority.html5) &&
	  site_html5_player)) &&
	dom_object &&
	// The object is still in DOM some scripts remove it
	dom_object.parentNode)
    {
	if(dom_object.nextSibling)
	{
	    object_data.use_sibling = dom_object.nextSibling;
	}

	if (!site_html5_player)
	{
	    this.hide_flash_video_object(id,dom_object.parentNode);
	}
	else 
	{
	    this.hide_site_html5_player(object_data.parent);
	}
    }

    if (toggle_plugin)
    {
	object_data.parent.insertBefore(container, toggle_plugin);
    }
    else
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

    if (((this.priority.self < this.priority.plugin) && 
	 this.plugin_is_installed) || 
	((this.priority.self < this.priority.html5) && 
	 site_html5_player))
    {
	this.hide_lm_video(object_data.linterna_magica_id);
    }

    // Defaults style fixes applied always.
    about_box.style.setProperty("overflow", "auto", "important");

    container.style.setProperty("height",
				((parseInt(object_data.height)+26+
				  (this.controls ? 24 : 0))+"px"),
				"important");

    if (object_data.parent)
    {
	object_data.parent.style.setProperty("height",
					     (parseInt(object_data.height)+
					      26+
					      // borders 1px x 2
					      2+
					      (this.controls ? 24 : 0))+"px",
					     "important");
    }

    

    var dom_object = this.get_flash_video_object(id);
    // Objects extracted from script usually does not have cloned object
    // For example youtube
    if (dom_object)
    {
	// Prevent the object to fill the container at 100% (if set)
	// This way the toggle plugin link after the object is not
	// overlaping elements.
	dom_object.style.setProperty("height", object_data.height+"px",
				     "important");
    }

    // Prevent the video object to fill the area at 100% and overlap
    // other elements. This happends if the site CSS sets this
    object_tag.style.setProperty("height", object_data.height+"px",
				 "important");

    object_tag.style.setProperty("width", object_data.width+"px",
				 "important");

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

    // Init the web controls functions
    // only if Linterna Mágica has priority
    if (this.controls &&
	(this.priority.self > this.priority.plugin))
    {
	this.player.init.apply(this,[id]);
    }

    // Examine the option for updates and check if necessary.
    this.check_for_updates();

    // Various CSS fixes
    var self = this;
    var val = this.call_site_function_at_position.apply(self,[
	"css_fixes",
	window.location.hostname, object_data]);

    return null;
}
