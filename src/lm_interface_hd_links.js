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

// Event listenr function that configs the video object
// for HD links
LinternaMagica.prototype.switch_to_hd_link = function(event, element)
{
    event.preventDefault();

    // Extract linterna_magica_id from the span wrapper id
    // attribute
    // div->ul->li->link
    // The span holds all the links and has an id
    var div = element.parentNode.parentNode.parentNode;
    var id = div.getAttribute("id").split(/-/);
    id = id[id.length-1];

    var dw_link = document.getElementById(
	"linterna-magica-video-download-link-"+id);

    var video_object = document.getElementById(
	"linterna-magica-video-object-"+id);

    if (dw_link && video_object)
    {
	dw_link.setAttribute("href",
			     element.getAttribute("href"));

	video_object.setAttribute("data",
				  element.getAttribute("href"));

	var sibling = video_object.nextSibling;
	var parent = video_object.parentNode;

	// Replace the <object> element
	// because the plugin will not detect the URL change
	var new_video = video_object.cloneNode(true);
	video_object.parentNode.removeChild(video_object);

	if (sibling)
	{
	    parent.insertBefore(new_video, sibling);
	}
	else
	{
	    parent.appendChild(new_video);
	}

	// hide the list
	div.style.setProperty("display", "none", "important");
    }
}

// Event listener function to show the hd links list and update
// notifier popup on click
LinternaMagica.prototype.show_or_hide_hd_links = function(event, element)
{
    event.preventDefault();

    var hd_list = element.nextSibling;
    if (hd_list)
    {
	var display = hd_list.style.getPropertyValue("display");
	if (display)
	{
	    hd_list.style.removeProperty("display");
	}
	else
	{
	    hd_list.style.setProperty("display", "none", "important");
	}
    }
    return true;
}
