//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011, 2012, 2014 Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Increment the counter for found video flash objects, mark the
// element with appropriate class attribute and return the new value.
LinternaMagica.prototype.mark_flash_object = function(element)
{
    this.found_flash_video_objects ++;

    // Video objects extracted from scripts usually do not exist in
    // DOM. Then we just have to increment the counter.
    if (element != "extracted-from-script" ||
	element != "extracted-by-code")
    {
	element.linterna_magica_id = this.found_flash_video_objects;
    }

    return this.found_flash_video_objects;
}

// Get the DOM object with Linterna Magica id
LinternaMagica.prototype.get_flash_video_object =
function(linterna_magica_id)
{
    // Scan the document object for object, embed and iframe objects
    var object_list = this.create_object_list();

    for (var i=0, l=object_list.length; i<l; i++)
    {
	var o = object_list[i];
	if (o.linterna_magica_id != undefined &&
	    o.linterna_magica_id == linterna_magica_id)
	{
	    return o;
	}
    }

    return null;
}

// Get the id (linterna_magica_id) of marked flash object.
LinternaMagica.prototype.get_marked_object_id =
function(element)
{
    return element.linterna_magica_id;
}

// Get the first element matching CSS class. Without the parent node
// searches trough document.
LinternaMagica.prototype.get_first_element_by_class =
function(className, parent)
{
    var top = parent ? parent : document;

    var children = top.getElementsByTagName("*");
    
    if (!children)
    {
	return null;
    }

    for (var i=0, l=children.length; i <l; i++)
    {
	var el = children[i];
	if (this.object_has_css_class(el, className))
	{
	    return el;
	}
    }

    return null;
}

// Check if DOM element has CSS class matching the string in className
LinternaMagica.prototype.object_has_css_class = function (element, className)
{
    var class_regex = new RegExp ("\\\s*("+className+")\\\s*","");
    var matches_class = element.hasAttribute("class") ? 
	element.getAttribute("class").match(class_regex) : null;

    if (matches_class)
    {
	return matches_class[matches_class.length-1];
    }

    return false;
}

// Add a class to the classes of an element
LinternaMagica.prototype.add_css_class = function(element, class_name)
{
    if (!this.object_has_css_class(element, class_name))
    {
	var c = element.getAttribute("class");
	element.setAttribute("class", c+" "+class_name);
    }

    return element.getAttribute("class");
}

// Get the video object with id
// "linterna-magica-video-object-"+linterna_magica_id from DOM
LinternaMagica.prototype.get_video_object = function(linterna_magica_id)
{
    var video_object = null;

    video_object = document.
	getElementById("linterna-magica-video-object-"+linterna_magica_id);

    return video_object;
}

// Show the video object and the interface
LinternaMagica.prototype.show_lm_interface = function(linterna_magica_id)
{
    var lm_interface = document.getElementById("linterna-magica-"+
					       linterna_magica_id);
    this.__show_lm(lm_interface);
}

// Hide the video object and the interface
LinternaMagica.prototype.hide_lm_interface = function(linterna_magica_id)
{
    var lm_interface = document.getElementById("linterna-magica-"+
					       linterna_magica_id);
    this.__hide_lm(lm_interface, linterna_magica_id);
}

// Hide the video object and the interface
LinternaMagica.prototype.hide_lm_video_object = function(linterna_magica_id)
{
    var video_object = document.getElementById("linterna-magica-"+
					       "video-object-wrapper-"+
					       linterna_magica_id);
    this.__hide_lm(video_object, linterna_magica_id);
}

// Show the video object
LinternaMagica.prototype.show_lm_video_object = function(linterna_magica_id)
{
    var video_object = document.getElementById("linterna-magica-"+
					       "video-object-wrapper-"+
					       linterna_magica_id);
    this.__show_lm(video_object);
}

LinternaMagica.prototype.__show_lm = function(element)
{
    if (!element)
    {
	return null;
    }

    element.style.removeProperty("display");
}

LinternaMagica.prototype.__hide_lm = function(element, linterna_magica_id)
{
    if (!element)
    {
	return null;
    }

    var self = this;
    this.player.stop.apply(self, [linterna_magica_id]);

    element.style.setProperty("display", "none", "important");
}


// Show the flash video object
LinternaMagica.prototype.show_flash_video_object =
function(flash_object)
{
    if (!flash_object)
    {
	return null;
    }


    // See https://savannah.nongnu.org/bugs/?36888
    flash_object = this.force_flash_video_object_start(flash_object);

    flash_object.style.removeProperty("display");

    return flash_object;
}

// Hide the flash video object
LinternaMagica.prototype.hide_flash_video_object =
function(flash_object)
{
    if (!flash_object)
    {
	return null;
    }

    // Force the playback to stop. Setting the object on the
    // background and changing its type alone does not work. 
    // See https://savannah.nongnu.org/bugs/?36888
    flash_object = this.force_flash_video_object_stop(flash_object);

    flash_object.style.setProperty("display", "none", "important");

    return flash_object;
}

LinternaMagica.prototype.force_flash_video_object_stop =
function(flash_object)
{
    var clone = this.force_flash_video_object_src(flash_object, 
						     "x-fake-flash");
    clone = 
	this.force_flash_video_object_type(clone,
				       "x-fake/x-flash-stopped");

    clone = this.force_flash_video_object_injection(flash_object, clone);

    return clone;
}

LinternaMagica.prototype.force_flash_video_object_start =
function(flash_object)
{
    var clone = this.force_flash_video_object_src(flash_object, "swf");

    clone = 
	this.force_flash_video_object_type(clone,
				       "application/x-shockwave-flash");

    clone = this.force_flash_video_object_injection(flash_object, clone);

    return clone;
}

// Add/remove swf from the flash object src/data attribute. Used when
// hiding the flash player to stop its playback so there is no dual
// playback as described in bug #36888.
// See https://savannah.nongnu.org/bugs/?36888
LinternaMagica.prototype.force_flash_video_object_src =
function(flash_object, src)
{
    if (!flash_object || !src)
    {
	return null;
    }

    var old_src = null;

    if (/swf/i.test(src))
    {
	old_src = "x-fake-flash";
    }
    else if (/x-fake-flash/i.test(src))
    {
	old_src = "swf";
    }
    else
    {
	return flash_object;
    }

    var src_attribute = 
	/object/i.test(flash_object.localName) ? "data" : "src";

    var full_src = flash_object.getAttribute(src_attribute);

    if (!full_src)
    {
	return flash_object;
    }

    full_src = full_src.replace('.'+old_src, '.'+src);

    var clone = flash_object.cloneNode(true);
    clone.linterna_magica_id = flash_object.linterna_magica_id;
    
    clone.setAttribute(src_attribute, full_src);

    return clone;
}

LinternaMagica.prototype.force_flash_video_object_injection =
function(flash_object, clone)
{
    var sibling = flash_object.nextSibling ? 
	flash_object.nextSibling : null;

    var parent = flash_object.parentNode;

    flash_object.parentNode.removeChild(flash_object);
 
    if (sibling)
    {
	parent.insertBefore(clone, sibling);
    }
    else
    {
	parent.appendChild(clone);
    }

    return clone;
}

// Force the flash object to another type. Used when hiding the flash
// player to stop its playback so there is no dual playback as
// described in bug #36888.
// See https://savannah.nongnu.org/bugs/?36888
LinternaMagica.prototype.force_flash_video_object_type =
function(flash_object, type)
{
    if (!flash_object || !type)
    {
	return null;
    }
  
    var clone = flash_object.cloneNode(true);
    clone.linterna_magica_id = flash_object.linterna_magica_id;
    
    flash_object = clone;
    flash_object.setAttribute("type", type);
   
    return flash_object;
}

// Check all video objects to find if one is started.
LinternaMagica.prototype.find_started_clip = function()
{
    var started = null;
    var self = this;

    for (var i=0,l=this.found_flash_video_objects; i<l; i++)
    {
	var state = self.player.state.apply(self,[i]);
	// Another clip is started
	if (this.get_video_object(i) &&
	    state && state.string)
	    {
		started = i;
		break;
	    }
    }

    return started;
}

// Search for <video> or <canvas> (some sites use it alongside
// <video>) in the parent and return its parentNode that is child of
// parent.
LinternaMagica.prototype.find_site_html5_player_wrapper =
function(parent)
{
    if (!parent)
    {
	return null;
    }

    var self = this;
    var html5_player_holder = null;
    var t = null;

    var html5_player_element = null;

    var val = this.call_site_function_at_position.apply(self,[
	"custom_html5_player_finder",
	window.location.hostname, parent]);

    if (val && typeof(val) != "boolean")
    {
	html5_player_element = val;
    }
    else 
    {
	html5_player_element = parent.getElementsByTagName("video");

	if (!html5_player_element || !html5_player_element.length)
	{
	    // Some pages (Vimeo, Dailymotion (now uses iframe) might
	    // use a canvas tag before inserting the video tag).
	    html5_player_element  =  parent.getElementsByTagName("canvas");

	    // No more guesses
	    if (!html5_player_element || !html5_player_element.length)
	    {
		return null;
	    }
	}

	html5_player_element = html5_player_element[0];
    }

    html5_player_holder = html5_player_element.parentNode;

    // Searching for the holder element that is placed in the
    // parent element (parent) that holds Linterna Magica.
    while (parent != html5_player_holder)
    {
	t = html5_player_holder;

	// Fix crashing and strange behaviour in Midori 0.4.0
	// Complains on html5_player_holder.parentNode; about
	// html5_player_holder not being an object.
	if (!html5_player_holder)
	{
	    continue;
	}

	html5_player_holder = html5_player_holder.parentNode;
    }

    if (t !== null)
    {
	html5_player_holder = t;
    }

    // We don't want to hide the LM player as well. The wrapper should
    // be the HTML5 player itself.
    if (html5_player_holder == parent)
    {
	html5_player_holder = html5_player_element;
    }

    return html5_player_holder;
}

// Hide the HTML5 player wrapper found in the parent element.
LinternaMagica.prototype.hide_site_html5_player =
function(parent)
{
    var html5_player =
	this.find_site_html5_player_wrapper(parent);

    if (!html5_player)
    {
	return null;
    }

    html5_player.style.setProperty("display", "none", "important");
    return html5_player;
}

// Show the HTML5 player wrapper found in the parent element.
LinternaMagica.prototype.show_site_html5_player =
function(parent)
{

    var html5_player =
	this.find_site_html5_player_wrapper(parent);

    if (!html5_player)
    {
	return null;
    }

    html5_player.style.removeProperty("display");
    return html5_player;
}

// Pause the first HTML5 player (<video>) found in the parent element.
LinternaMagica.prototype.pause_site_html5_player =
function(parent)
{
    if (!parent)
    {
	return null;
    }

    var video = parent.getElementsByTagName("video");

    if (!video || !video.length)
    {
	return null;
    }

    video = video[0];
    video.pause();
}
