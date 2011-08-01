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

// Increment the counter for found video flash objects, mark the
// element with appropriate class attribute and return the new value.
LinternaMagica.prototype.mark_flash_object = function(element)
{
    this.found_flash_video_objects ++;

    // Video objects extracted from scripts usually do not exist in
    // DOM. Then we just have to increment the counter.
    if (element != "extracted-from-script")
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
LinternaMagica.prototype.show_lm_video = function(linterna_magica_id)
{
    var lm = this.get_video_object(linterna_magica_id).parentNode;

    if (!lm)
    {
	return null;
    }

    lm.style.removeProperty("display");
}

// Hide the video object and the interface
LinternaMagica.prototype.hide_lm_video = function(linterna_magica_id)
{
    var lm = this.get_video_object(linterna_magica_id).parentNode;

    if (!lm)
    {
	return null;
    }

    lm.style.setProperty("display", "none", "important");
}

// Show the flash video object
LinternaMagica.prototype.show_flash_video_object =
function(linterna_magica_id,parent)
{
    var flash_object = 
	this.get_flash_video_object(linterna_magica_id,parent);

    if (!flash_object)
    {
	return null;
    }

    flash_object.style.removeProperty("display");

    return flash_object;
}

// Hide the flash video object
LinternaMagica.prototype.hide_flash_video_object =
function(linterna_magica_id, parent)
{
    var flash_object =
	this.get_flash_video_object(linterna_magica_id, parent);

    if (!flash_object)
    {
	return null;
    }

    flash_object.style.setProperty("display", "none", "important");

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

    var html5_player_holder = null;
    var t = null;

    var video_or_canvas = parent.getElementsByTagName("video");

    if (!video_or_canvas || !video_or_canvas.length)
    {
	// Some pages (Vimeo, Dailymotion might use a canvas tag
	// before inserting the video tag). 
	video_or_canvas  =  parent.getElementsByTagName("canvas");

	// No more guesses
	if (!video_or_canvas || !video_or_canvas.length)
	{
	    return null;
	}
    }

    html5_player_holder = video_or_canvas[0].parentNode;

    // Searching for the holder element that is placed in the
    // parent element (parent) that holds Linterna Magica.
    while (parent != html5_player_holder)
    {
	t = html5_player_holder;
	html5_player_holder = html5_player_holder.parentNode;
    }

    if (t !== null)
    {
	html5_player_holder = t;
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
