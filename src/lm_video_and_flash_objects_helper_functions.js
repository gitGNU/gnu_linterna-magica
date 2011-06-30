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

// Used for class names of marked objects. Flash objects might have
// id's already. It is not a good idea to replace them.
LinternaMagica.prototype.marked_object_template =
    "linterna-magica-processed-object-";

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

	if (o.linterna_magica_id != undefined)
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

    for (var i=0,l=this.found_flash_video_objects; i<l; i++)
    {
	// Another clip is started
	if (this.get_video_object(i) &&
	    this.player.state(i).string)
	    {
		started = i;
		break;
	    }
    }

    return started;
}

