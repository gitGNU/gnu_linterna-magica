//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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

LinternaMagica.prototype.sites["kickstarter.com"] = new Object();

// Reference 
LinternaMagica.prototype.sites["www.kickstarter.com"] = "kickstarter.com";

// Kickstarter does not have scripts that could be processed. This
// function is an example for website support that works by combining
// Linterna Magica functions and doesn not depend on most of the
// framework.
LinternaMagica.prototype.sites["kickstarter.com"].no_flash_plugin_installed =
function()
{
    // The video link is kept in a non-standard (w3c) attribute in a
    // <div/> with class video-player.
    var selectors = document.querySelectorAll(".video-player");

    var object_data = null;
    var link = null;
    var width = null;
    var height = null;
    var parent = null;

    if (selectors && selectors.length)
    {
	for (var i=0,l=selectors.length;i<l;i++)
	{
	    var s = selectors[i];

	    // The attribute that holds the video link
	    if(s.hasAttribute("data-video"))
	    {
		// Use the link extraction function to detect if there
		// is realy a link.
		this.extract_link_data = "video="+s.getAttribute("data-video");

		link = this.extract_link();

		// The style rules of the video wrapper div seems to
		// have the correct width and height, but they are
		// missing sometimes in some browsers.
		width = parseInt(s.style.getPropertyValue("width"));
		height = parseInt(s.style.getPropertyValue("height"));

		if (!width)
		{
		    width = s.clientWidth;
		}

		if (!height)
		{
		    height = s.clientHeight;
		}

		// Kickstarter injects the flash object in a <div/>
		// with class "overlay", that is a child of the <div/>
		// with the "video-player" class. In absence of flash
		// plugin we want to place the Linterna Magica in the
		// same place. The child div is usually the firstChild
		// object, but the loop code (theoretically) should
		// work, if Kickstarter changes something.
		for (var j=0,ln=s.childNodes.length;j<ln;j++)
		{
		    parent = s.childNodes[j];

		    if (parent.hasAttribute("class") &&
			/overlay/i.test(parent.getAttribute("class")))
		    {
			break;
		    }

		    // This code usually should never be
		    // reached. Sometimes errors occur in Midori and
		    // the <div/> with the overlay class is not in the
		    // DOM. The play-icon image of the site is not
		    // rendered in Midori. We will use the <div/> with
		    // the video-player class as a parent.
		    if (j=l)
		    {
			parent = s;
		    }
		}

		if (link && width && height && parent)
		{
		    break;
		}
	    }
	}

	var object_data = new Object();
	object_data.link = link;
	object_data.width = width;
	object_data.height = height;
	object_data.parent = parent;
	object_data.linterna_magica_id = 
	    this.mark_flash_object("extracted-by-code");

	// Cleanup flash warnings. Will remove the thumbnail image as
	// well and we will not have to manually delete it. The image
	// displaces the Linterna Magica replacement object.
	this.remove_plugin_install_warning(object_data.parent);
	this.create_video_object(object_data);

	return true;
    }

    // Just in case, if nothing was found with the special code,
    // return null, so scripts will be parsed.  This is fall-back
    // if/when Kickstarter changes its design. If they change, they
    // might (observation from other pages) use a JavaScript library.
    return null;
}

LinternaMagica.prototype.sites["kickstarter.com"].css_fixes =
function(object_data)
{
    var id = object_data.linterna_magica_id;

    // A bar with social networks buttons overlaps with Linterna
    // Magica because the grand parent element does not have the
    // height needed for the replacement object. Fix that.
    var lm = document.getElementById("linterna-magica-"+id);

    if (lm)
    {
	var grand_parent = lm.parentNode.parentNode;
	var h = parseInt(lm.style.getPropertyValue("height"));

	grand_parent.style.setProperty("height", h+'px', "important");
    }
    
    // A popup notification about missing flash plugin is showed above
    // Linterna Magica on every link click. Hide it.
    var popup = document.getElementById("growl_section");

    if (popup)
    {
	popup.style.setProperty("z-index", "-9999999", "important");
    }

    // The overlay <div/> has a CSS rule line-height equal to its
    // height. This hides the button at the bottom of the flash object
    // that switches to Linterna Magica. Removing th line-height does
    // not affect us if we had fallen back to the div with class
    // video-player as parent. Removing the rule might not work,
    // because rules are either in style or in sheet almost randomly.
    object_data.parent.style.setProperty("line-height", "0px", "important");

    return false;
}
