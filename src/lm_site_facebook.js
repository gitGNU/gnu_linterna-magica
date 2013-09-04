//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012  Ivaylo Valkov <ivaylo@e-valkov.org>
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
// @source http://linternamagica.org

// END OF LICENSE HEADER

// Detect facebook flash upgrade warning This is called withing
// setInterval. It is needed because when the elements with the
// warning are inserted all our data that has been added before that
// is removed.
LinternaMagica.prototype.detect_facebook_flash_upgrade = function(object_data)
{
    this.facebook_flash_upgrade_counter++;

    var child = object_data.parent.firstChild;
    var insert_object = null;

    // 10 seconds with 500ms interval
    if (this.facebook_flash_upgrade_counter >= 20 ||
	// Gnash is installed and we have DOM object
	(child &&  /embed|object/i.test(child.localName)) ||
	// We found a warning
	(child && /flash|player/i.test(child.textContent)))
    {
	clearInterval(this.facebook_flash_upgrade_timeout);

	this.log("LinternaMagica.detect_facebook_flash_upgrade:\n"+
		 "Removing plugin install warning.",2);

	this.remove_plugin_install_warning(object_data.parent);

	this.log("LinternaMagica.detect_facebook_flash_upgrade:\n"+
		 "Creating video object.",2);

	this.create_video_object(object_data);
    }
}

LinternaMagica.prototype.sites["facebook.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.facebook.com"] = "facebook.com";

LinternaMagica.prototype.sites["facebook.com"].
    replace_extracted_object_from_script =
function(object_data)
{
    if (!this.facebook_flash_upgrade_timeout)
    {
	this.log("LinternaMagica.sites.replace_extracted_"+
		 "object_from_script:\n"+
		 "Delaying video object creation in Facebook.",3);
	this.facebook_flash_upgrade_counter = 0;
	var data = object_data;
	var self = this;
	this.facebook_flash_upgrade_timeout =
	    setInterval(function() {
	    	self.detect_facebook_flash_upgrade.
	    	    apply(self,[data]);
	    }, 500);
    }

    return false;
}

LinternaMagica.prototype.sites["facebook.com"].set_video_link_regex =
function()
{
    var result = new Object();

    // Found DOM object
    // Might not work anymore. Can't test it.
    // 
    // While fixing bug #108050, even when Gnash was installed the
    // browser didn't render it where the clip should be. Manually
    // setting higher flash version in Gnash settings did not help
    // either.
    //
    // Also the fix for bug #108050 introduced the
    // flash_plugin_installed(), so clips are always extracted from
    // script tags. This fragment should probably be removed.
    //
    // See bug #108050:
    // https://savannah.nongnu.org/support/?108050
    if (!this.script_data)
    {
	result.link_re = new RegExp (
	    "thumb_url=(.*)&video_src=(.*)&(motion_log)=(.*)",
	    "i");

	result.link_position = 3;
    }
    // Extracting from script
    else
    {
 	result.link_re = new RegExp (
	    "(\\\"|\\\')video(\\\"|\\\'),\\\s*(\\\"|\\\')([^\\\"\\\']+)(\\\"|\\\'){1}",
 	    "i");
	result.link_position = 2;
    }

    return result;
}

LinternaMagica.prototype.sites["facebook.com"].process_extracted_link = function(link)
{
    // For some reason they use Unicode escape character, that
    // could not be converted by decodeURIComponent or
    // unescape directly. This workaround might break
    // non-ASCII strings in the link
    link = unescape(link.replace(/\\u0025/g, "%"));

    link = link.split(',');
    link = link[0] ? link[0] : link;

    link = link.split('"');
    link = link[3] ? link[3] : link.join();

    link = link.replace(/\\\//g, "/");

    return link;
}

// Reference. Just returns false
LinternaMagica.prototype.sites["facebook.com"].
do_not_clean_amps_in_extracted_link = "video.google.com";

// See bug #108013:
// https://savannah.nongnu.org/support/index.php?108013
LinternaMagica.prototype.sites["facebook.com"].
skip_script_processing = function()
{
    if (/(video|photo)\.php/i.test(window.location.href) &&
	this.script_data.length >= 26214400 )
    {
	// Skip scripts larger than 25 KB on video pages.
	return false;
    }
    else if (!/(video|photo)\.php/i.test(window.location.href) &&
    	     this.script_data.length >= 5120)
    {
    	// Skip scripts larger than 5 KB on non-video pages.
    	return false;
    }

    return true;
}

LinternaMagica.prototype.sites["facebook.com"].
extract_hd_links_from_script_if_link =
function()
{
    var data = this.script_data;

    var hd_strings = ["sd_src", "hd_src" ];
    var hd_links = new Array();
    var l,i;

    var link_re = new RegExp (
	"(\\\"|\\\')video(\\\"|\\\'),\\\s*(\\\"|\\\')"+
	    "([^\\\"\\\']+)(\\\"|\\\'){1}",
	"i");

    var match = data.match(link_re);

    if (!match || !match[match.length-2])
    {
	return;
    }

    var links = unescape(match[match.length-2].replace(/\\u0025/g, "%"));

    links = links.split(/,/);

    for (var i=0, l=links.length; i<l; i++)
    {
	// Skip data that does not have link infromation.
	if (!/_src/i.test(links[i]))
	{
	    continue;
	}
	var link = new Object();
	// The # at the end of the link is needed, because
	// Facebook adds some event listenerers for click events
	// for anchor elements that break the default browser
	// behaviour. This causes the HD links to load directly in
	// the browser. This work-around works because ... ? I
	// suppose they filter links with #.
	link.url = 
	    this.sites["facebook.com"].
	    process_extracted_link(links[i])+"#";

	if (/sd_src/i.test(links[i]))
	{
	    // Resolution is not consistent. Cant use 400p for example
	    link.label = this._("Low") 
	    link.more_info = "MPEG-4, H.264";
	}
	else
	{
	    // Resolution is not consistent. Cant use 720p for example
	    link.label = this._("High");
	    link.more_info = "MPEG-4, H.264";
	}

	hd_links.unshift(link);
    }

    if (hd_links.length > 0)
    {
	return hd_links;
    }

    return null;
}

LinternaMagica.prototype.sites["facebook.com"].css_fixes =
function(object_data)
{
    // Facebook adds some event listenerers for click events for the
    // naviation (next/prev video/photo) anchor elements that break
    // the default browser behaviour. It is suspected that the page is
    // requested at the background and injected in the DOM. Linterna
    // Magica does not load for next or previous clips. The
    // work-around is to force the browser to load the link as if it
    // was no Facebook JavaScript - on the foreground.

    var next = document.querySelector(".photoPageNextNav");
    var prev = document.querySelector(".photoPagePrevNav");

    var fb_nav_click_fn = function(ev)
    {
	window.location = this.getAttribute("href");
    }

    if (next)
    {
	next.addEventListener("click", fb_nav_click_fn, false);
    }

    if (prev)
    {
	prev.addEventListener("click", fb_nav_click_fn, false);
    }
}
 
// Reference. Calls the logic that processes <script> tags
LinternaMagica.prototype.sites["facebook.com"].flash_plugin_installed = "youtube.com";
