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

// Holds all the site specific config and function
LinternaMagica.prototype.sites = new Object();

// A function returns false/null, if the calling function should
// exit/return after this function is executed.  Otherwise it should
// return true.
// Take an action before options initialisation. This is the
// earliest position where site-specific action could be
// taken. The default config is to keep processing.
//
// For example, ted.com requires a different approach.
LinternaMagica.prototype.sites.__before_options_init = function ()
{
    return true;
}

// Take an action when no flash plugin is installed
LinternaMagica.prototype.sites.__no_flash_plugin_installed = function()
{
    this.log("LinternaMagica.sites.__no_flash_plugin_installed:\n"+
	     "Examining scripts.", 4);

    // video.google.* bloats in this function. It takes around 1 min
    this.extract_objects_from_scripts();

    return true;
}

// Take an action when flash plugin is installed. For example
// myvideo.de and theonion.com have custom function.
LinternaMagica.prototype.sites.__flash_plugin_installed = function()
{
    return true;
}

// LinternaMagica.prototype.sites.__process_cookies
// LinternaMagica.prototype.sites.__css_style_fix
// LinternaMagica.prototype.sites.__detect_flash_ // Useless?
// LinternaMagica.prototype.sites.__skip_video_id_extract // DM force?
// LinternaMagica.prototype.sites.__skip_xhr_if_video_id
// LinternaMagica.prototype.sites.__wait_before_xhr
// LinternaMagica.prototype.sites.__extract_scripts_extract_when // Condition ? DM /ted? 
// LinternaMagica.prototype.sites.__extract_scripts_once // YT ?
// LinternaMagica.prototype.sites.__extract_scripts_wait_insert // FB
// LinternaMagica.prototype.sites.__wait_before_inserting_object_from-script // FB
// LinternaMagica.prototype.sites.__extract_swfobject_regex
// LinternaMagica.prototype.sites.__extract_swfobject_hdlinks
// LinternaMagica.prototype.sites.__extract_video_link_regex
// LinternaMagica.prototype.sites.__extract_video_link_match
// LinternaMagica.prototype.sites.__match_for_video_link
// LinternaMagica.prototype.sites.__keep_amps_in_video_link
// LinternaMagica.prototype.sites.__process_plugin_install_warning
// LinternaMagica.prototype.sites.__prepare_xhr
// LinternaMagica.prototype.sites.__process_xhr_responce
// LinternaMagica.prototype.sites.__insert_object_after_xhr

// Check if site specific config and function exists and call it. If
// it doesn't, call the general/default function.  A function returns
// false/null, if the calling function should exit/return after this
// function is executed. Otherwise it should return true.
LinternaMagica.prototype.call_site_function_at_position =
function (position_name, match_site, data)
{
    var self = this;

    if (this.sites[match_site])
    {
	// Recursion is used to handle references to strings.

	if (typeof(this.sites[match_site]) == "object" &&
	    typeof(this.sites[match_site][position_name]) == "function")
	{
	    // Defined site and function

	    this.log("LinternaMagica.call_site_function_at_position:\n"+
		     "Calling function "+position_name+
		     "for site (both site and function defined)",5);

	    return this.sites[match_site][position_name].apply(self,[data]);
	}
	else if (typeof(this.sites[match_site]) == "object" &&
		 typeof(this.sites[match_site][position_name]) == "string")
	{
	    // Reference to a function of another site

	    var ref_to = this.sites[match_site][position_name];

	    this.log("LinternaMagica.call_site_function_at_position:\n"+
		     "Calling referenced function "+
		     position_name+" (site defined,"+
		     " function reference): "+match_site+" -> "+ref_to,5);

	    return this.call_site_function_at_position.apply(self, [
		position_name, ref_to, data]);
	}
	else if (typeof(this.sites[match_site]) == "string")
	{
	    // Reference to a another site

	    var ref_to = this.sites[match_site];

	    this.log("LinternaMagica.call_site_function_at_position:\n"+
		     "Using another site config (reference) for function "+
		     position_name+": "+match_site+" -> "+ref_to,5);

	    return this.call_site_function_at_position.apply(self, [
		position_name, ref_to, data]);
	}
    }
    else if ((this.sites[match_site] &&
	      !this.sites[match_site][position_name]) ||
	     !this.sites[match_site])
    {
	// General-purpose / default function.

	this.log("LinternaMagica.call_site_function_at_position:\n"+
		 "Using default function "+position_name+
		 "(no site specific config)",5);

	return this.sites["__"+position_name].apply(self, [data]);
    }

    return true;
}
