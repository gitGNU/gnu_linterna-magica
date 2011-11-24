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

// Event listener function that configs the video object
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

    var selected_link = document.getElementById(
	"linterna-magica-selected-hd-link-"+id);

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

	// Set the new selected link in the list and clear the old one
	if (selected_link)
	{
	    this.unselect_hd_link_in_list(selected_link);
	}

	this.select_hd_link_in_list(element,id);

	// hide the list
	div.style.setProperty("display", "none", "important");
    }
}

// Event listener function to show the hd links list and update
// notifier popup on click
LinternaMagica.prototype.show_or_hide_hd_links = function(event, element)
{
    event.preventDefault();

    var id = element.getAttribute("id").split(/-/);
    id = id[id.length-1];

    var hd_list = element.nextSibling;
    if (hd_list)
    {
	var display = hd_list.style.getPropertyValue("display");
	if (display)
	{
	    hd_list.style.removeProperty("display");

	    var top_offset = 0;
	    var el = element;

	    // Calculate the offset to the top of the window and
	    // decrease the height of the list if needed. See
	    // https://savannah.nongnu.org/bugs/index.php?34465
	    while(el && !isNaN(el.offsetTop))
	    {
		top_offset += el.offsetTop;
		el = el.offsetParent;
	    }

	    if (hd_list.clientHeight > top_offset)
	    {
		// Increase the width ~twice. Higher values than 1.85
		// leave too much empty space at the right of the div.
		var w = hd_list.clientWidth * 2.085;
		var h = 0;

		var links = hd_list.getElementsByTagName("li");
		for (var i=0,l=links.length;i<l;i++)
		{
		    var li = links[i];
		    var li_h  = (li.clientHeight ? 
				 li.clientHeight: li.offsetHeight);
		    h += li_h;
		}

		// Setting "float: left" in the same loop as the
		// height calculations changes the sum.
		for (var i=0,l=links.length;i<l;i++)
		{
		    var li = links[i];
		    li.style.setProperty("float", "left", "important");
		    li.style.setProperty("width", "270px", "important");
		}

		// Half the height. The "float:left" renders in two
		// columns, so we reduce the height. Add two pixels for
		// Epiphany, otherwise it renders scrollbars. 
		h = h/2 + 2;

		hd_list.style.setProperty("height", h+"px", "important");
		hd_list.style.setProperty("width", w+"px", "important");

		// Without hiding and showing again the div,
		// scrollbars are visible and some of the <li>
		// elements have weird sizes.
		hd_list.style.setProperty("display", "none", "important");
		var redraw_timeout_function = function(ev)
		{
		    var hd_list = 
			document.getElementById("linterna-magica-hd-"+
						"links-list-"+id);
		    hd_list.style.removeProperty("display");
		}

		// We must wait a while for the redrawing/calculating
		// to take effect. Immediate showing is not having the
		// desired effect.
		setTimeout(redraw_timeout_function, 15);
	    }

	    var hd_list_blur_function = function(ev)
	    {
		var timeout_function = function()
		{
		    if (document.activeElement &&
			document.activeElement.hasAttribute("id") &&
			document.activeElement.getAttribute("id") 
			!= "linterna-magia-selected-hd-link-"+id)
		    {
			hd_list.style.setProperty("display", 
						  "none", "important");
		    }
		    element.removeEventListener("blur",
						hd_list_blur_function,
						true);
		};

		// Wait for the selected link to become the
		// document.activeElement.
		setTimeout(timeout_function, 250);
	    };

	    element.addEventListener("blur", hd_list_blur_function, true);
	}
	else
	{
	    hd_list.style.setProperty("display", "none", "important");
	}
    }
    return true;
}

// Set style and id of the selected link in the HD list. This way it
// is distinguished.
LinternaMagica.prototype.select_hd_link_in_list = function(element,id)
{
    if (typeof(element) != "object" ||
	// ID = zero is an option.
	id == "undefined")
    {
	return element;
    }

    element.style.setProperty("border-style", "solid", "important");
    element.style.setProperty("border-width", "1px", "important");
    element.style.setProperty("border-color", "#bbbbbb", "important");
    element.style.setProperty("background-color", "#151515", "important");
    element.style.setProperty("color", "#ffffff", "important");
    element.setAttribute("id", "linterna-magica-selected-hd-link-"+id);

    return element;
}

// Remove the style and the id of previous selected link in the HD
// list. Called before select_hd_link_in_list() is called for newly
// selected link.
LinternaMagica.prototype.unselect_hd_link_in_list = function(element)
{
    if (typeof(element) != "object")
    {
	return element;
    }

    element.removeAttribute("id");
    element.style.removeProperty("border-width");
    element.style.removeProperty("border-color");
    element.style.removeProperty("border-style");
    element.style.removeProperty("background-color");
    element.style.removeProperty("color");

    // 09.04.2011 WebKit /Epiphany keeps showing border even if it is
    // removed and border-style, border-color and border-width are
    // null.
    if (element.style.getPropertyValue("border"))
    {
	element.style.setProperty("border-width", "0px", "important");
    }

    return element;
}
