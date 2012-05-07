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
	    "addVariable\\\((\\\"|\\\')video_src(\\\"|\\\'),\\\s*"+
		"(\\\"|\\\')([^\\\"\\\']+)(\\\"|\\\')(\\\))\\\;{1}",
	    "i");

	result.link_position = 3;
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
    if (/video\.php/i.test(window.location.href) &&
	this.script_data.length >= 15360 )
    {
	// Skip scripts larger than 15 KB on video pages.
	return false;
    }
    else if (!/video\.php/i.test(window.location.href) &&
	     this.script_data.length >= 5120)
    {
	// Skip scripts larger than 5 KB on non-video pages.
	return false;
    }

    return true;
}
