//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Set the domain used to process (expire) cookies. Not required for
// most sites. See lm_site_youtube.js:set_cookies_domain.
LinternaMagica.prototype.sites.__set_cookies_domain = function()
{
    return true;
}

// Take an action while processing cookies. This is executed for every
// cookie object. Duplicates normal cookies processing. Not needed
// form most sites. It should return a string with domain, path and
// other values. See lm_site_dailymotion.js:prcoess_cookies.
LinternaMagica.prototype.sites.__process_cookies = function()
{
    return true;
}

// Used to skip detection (as swf) of iframes. Not used in most
// sites. See lm_site_dailymotion.js:do_not_force_iframe_detection.
LinternaMagica.prototype.sites.__do_not_force_iframe_detection =
function()
{
    return true;
}

// Set the video_id to the returned value and skip extraction from DOM
// object attributes. The true return value for this default function
// does not stop extraction. See comments after
// LinternaMagica.prototype.sites. See
// lm_site_dailymotion.js:skip_video_id_extraction
LinternaMagica.prototype.sites.__skip_video_id_extraction = function()
{
    return true;
}

// Take an action if video_id is extracted, but link extraction could
// not happen with XHR. See lm_site_myvideode.js:skip_xhr_if_id. The
// true return value for this default function does not stop XHR. See
// comments after LinternaMagica.prototype.sites.
LinternaMagica.prototype.sites.__skip_xhr_if_video_id = function(object_data)
{
    return true;
}

// Do not extract video link. The true return value for this default
// function does not stop link extraction. See comments after
// LinternaMagica.prototype.sites. See
// lm_site_youtube.js:skip_link_extraction
//
// If the returned value is true and not boolean it will be used as
// the object that has extracted data. See
// lm_site_priorg.js:skip_link_extraction
LinternaMagica.prototype.sites.__skip_link_extraction = function()
{
    return true;
}

// Extract HD/HQ links from DOM with site specific function and code if a link
// is extracted. See
// lm_site_tedcom.js:extract_hd_links_from_dom_if_link. See comments
// after LinternaMagica.prototype.sites. See
LinternaMagica.prototype.sites.__extract_hd_links_from_dom_if_link =
function(data)
{
    return true;
}

// Extract HD/HQ links from script with site specific function and code if a link
// is extracted. See
// lm_site_tedcom.js:extract_hd_links_from_dom_if_link. See comments
// after LinternaMagica.prototype.sites. See
LinternaMagica.prototype.sites.__extract_hd_links_from_script_if_link =
function()
{
    return true;
}

// Skip script processing on a condition defined in the function and
// return value is false (or null or undefined).
LinternaMagica.prototype.sites.__skip_script_processing = function()
{

    // Skip scripts larger than 17KB by default
    if (this.script_data.length >= 17408)
    {
	this.log("LinternaMagica.sites.__skip_script_processng:\n"+
		 "Skipping script with size "+this.script_data.length,5);
	return false;
    }
    else
    {
	this.log("LinternaMagica.sites.__skip_script_processng:\n"+
		 "Processing script with size "+this.script_data.length,5);
    }


    return true;
}

// Extract object data from script
LinternaMagica.prototype.sites.__extract_object_from_script = function()
{
    return true;
}

// If one video object is found, stop all further searches in scripts.
LinternaMagica.prototype.sites.__stop_if_one_extracted_object_from_script =
function()
{
    return true;
}

// Skip video_id extraction (and force it to something) in SWFObject
// detection and extraction code.
LinternaMagica.prototype.sites.__libswfobject_skip_video_id_extraction =
function()
{
    return true;
}

// Create the replacement object. See
// lm_site_facebook.js:replace_extracted_object_from_script
LinternaMagica.prototype.sites.__replace_extracted_object_from_script =
function(object_data)
{
    return true;
}

// Force/set the regular expression used to extract video links to
// site specific value. Overrides the default one.
LinternaMagica.prototype.sites.__set_video_link_regex = function()
{
    return true;
}

// Make some changes to or fix/clean an extracted link.
LinternaMagica.prototype.sites.__process_extracted_link = function(link)
{
    return true;
}

// Extracted links have ampersands (&) in them which are usually
// parameters for the flash player. Some sites need them. When this
// function returns false, the cleaning does not occur. See
// lm_site_google_video.js
LinternaMagica.prototype.sites.__do_not_clean_amps_in_extracted_link =
function()
{
    return true;
}

// Force/set the regular expression used to extract video id to
// site specific value. Overrides the default one.
LinternaMagica.prototype.sites.__set_video_id_regex = function()
{
    return true;
}

// Execute at the end of the code that removes text and image warnings
// about missing flash plugin. See
// lm_site_clipovetecom.js:plugin_install_warning.
LinternaMagica.prototype.sites.__plugin_install_warning = function(node)
{
    return true;
}

// Run code before changing the checked DOM node to the next one in
// the loop that removes text and image warnings about missing flash
// plugin. See lm_site_bliptv.js:plugin_install_warning_loop
LinternaMagica.prototype.sites.__plugin_install_warning_loop =
function(node)
{
    return true;
}

// Returns the data needed to fetch a resource that has the video url.
// Returned object 
// {
//     // The URL can be relative to the window.location.host. (required)
//     address: string,
//     // The method to be used for the request. (optional)
//     methog: string,
//     // The data to be send with the with the xhr.send() request :
//     // xrh.send(data) (optional)
//     data: string,
//     // The Content-Type header to be used for the request. (optional)
//     content: string,
// }
LinternaMagica.prototype.sites.__prepare_xhr = function(object_data)
{
    return false;
}

// Process the XHR response. 
// Arguments 
// An object:
// {
//     // XHR client object
//     client: object,
//     // The object that holds the extracted information about the flash
//     // object
//     object_data: object
// }
// Return value
// object_data
LinternaMagica.prototype.sites.__process_xhr_response =
function(args)
{
    return true;
}

// Run a function when duplicate object is found (being already processed)
// before XHR.  The return value does not really matter. The caller
// function returns null after executing this code.
LinternaMagica.prototype.sites.__process_duplicate_object_before_xhr =
function(object_data)
{
    return true;
}

// Add the replacement object overriding the default code i freturn
// value is false.
LinternaMagica.prototype.sites.__insert_object_after_xhr = function(object_data)
{
    return true;
}

// Add syle and classes to DOM elements for various fixes.The return
// value does not really matter. The caller function returns null
// after executing this code. Executed after the replacement object is
// inserted. CSS classes and DOM ids are accessible.
LinternaMagica.prototype.sites.__css_fixes = function(object_data)
{
    return true;
}

// Skip matching for flowplayer and fixing links. See
// lm_site_dailymotion.js:skip_flowplayer_links_fix()
LinternaMagica.prototype.sites.__skip_flowplayer_links_fix =
function(object_data)
{
    return true;
}

// Site specific code (rule) used to find the site HTML5 player
// element in the parent element. See
// lm_site_dailymotion.js:custom_html5_player_finder()
LinternaMagica.prototype.sites.__custom_html5_player_finder =
function(parent)
{
    return true;
}


// lm_site_youtube.js:player_stream_ended_action()
LinternaMagica.prototype.sites.__player_stream_ended_action =
function()
{
    return true;
}

// Check if site specific config and function exists and call it. If
// it doesn't, call the general/default function.  A function returns
// false/null, if the calling function should exit/return after this
// function is executed. Otherwise it should return true.
LinternaMagica.prototype.call_site_function_at_position =
function (position_name, match_site, data)
{
    var self = this;

    var debug_level  =  6;

    if (position_name == "process_cookies" ||
	position_name == "extract_object_from_script" || 
	position_name == "skip_script_processing")
    {
	// These functions are called inside a loop and
	// prints too much information.
	debug_level = 7;
    }

    if (this.sites[match_site])
    {
	// Recursion is used to handle references to strings.

	if (typeof(this.sites[match_site]) == "object" &&
	    typeof(this.sites[match_site][position_name]) == "function")
	{
	    // Defined site and function

	    this.log("LinternaMagica.call_site_function_at_position:\n"+
		     "Calling function "+position_name+
		     " for site (both site and function defined)",debug_level);

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
		     " function reference): "+match_site+" -> "+ref_to,debug_level);

	    return this.call_site_function_at_position.apply(self, [
		position_name, ref_to, data]);
	}
	else if (typeof(this.sites[match_site]) == "string")
	{
	    // Reference to a another site

	    var ref_to = this.sites[match_site];

	    // Don't make calls to a reference if it's function is not
	    // defined and the default one will be called anyway.
	    if (typeof(this.sites[ref_to][position_name]) != "undefined")
	    {
		this.log("LinternaMagica.call_site_function_at_position:\n"+
			 "Using another site config (reference) for function "+
			 position_name+": "+match_site+" -> "+ref_to,debug_level);

		return this.call_site_function_at_position.apply(self, [
		    position_name, ref_to, data]);
	    }
	}
    }

    // MUST be in separate if block. Don't merge with previous
    // one. The first if (this.sites[match_site]) will be accessed
    // before this one.
    if ((this.sites[match_site] &&
	 !this.sites[match_site][position_name]) ||
	!this.sites[match_site])
    {
	// General-purpose / default function.

	this.log("LinternaMagica.call_site_function_at_position:\n"+
		 "Using default function "+position_name+
		 " (no site specific config)",debug_level);

	return this.sites["__"+position_name].apply(self, [data]);
    }

    return true;
}
