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

// Search through scripts elements placed inline in the HTML document
// for constructors of javascript libraries  that create flash objects.
LinternaMagica.prototype.extract_objects_from_scripts = function()
{
    var scripts = document.getElementsByTagName("script");

    if(!scripts)
    {
	return;
    }

    // Reversed for faster youtube processing.
    // for (var s=0; s<scripts.length; s++)
    for (var s=scripts.length-1; s>0; s--)
    {
	if (!scripts[s].textContent)
	{
	    // For debugging only
	    // this.log("LM.scripts skipping "+s+" len "+
	    // 	     scripts[s].textContent.length,5);
	    continue;
	}

	// For debuging only
	// this.log("LinternaMagica.extract_objects_from_scripts:\n"+
	// 	 "Processing script #"+s+ "; len "+
	// 	 scripts[s].textContent.length,5);

	// For debuging only
	// this.log("LinternaMagica.extract_objects_from_scripts:\n"+
	// 	 "Processing script #"+s+ "; data "+
	// 	 scripts[s].textContent,5);

	this.script_data = scripts[s].textContent;
	var object_data = null;

	var self = this;
	var val = this.call_site_function_at_position.apply(self,[
	    "skip_script_processing",
	    window.location.hostname]);

	if (!val)
	{
	    continue;
	}

	if (/theonion\.com/i.test(window.location.hostname))
	{
	    object_data = this.extract_object_from_script_theonion();

	    if (!object_data)
	    {
		// No other method of extraction is useful. Skip to
		// next script.
		continue;
	    }
	}

	if (/youtube\.com/i.test(window.location.hostname) ||
	    (/youtube-nocookie\.com/i.test(window.location.hostname)))
	{
	    object_data =
		this.extract_object_from_script_youtube();

	    // Fix bloating in FF (mainly). Optimizes script
	    // processing. No need to check the other swf constructors
	    // in YouTube.
	    if (!object_data)
	    {
		continue;
	    }
	}

	if (/vimeo\.com/i.test(window.location.hostname))
	{
	    object_data =
		this.extract_object_from_script_vimeo();

	    // Optimizes script processing. No need to check the other
	    // swf constructors in Vimeo.
	    if (!object_data)
	    {
		continue;
	    }
	}

	if (!object_data)
	{
	    object_data =
		this.extract_object_from_script_swfobject();
	}

	if (!object_data)
	{
	    object_data =
		this.extract_object_from_script_ufo();
	}

	if (!object_data)
	{
	    object_data =
		this.extract_object_from_script_pokkariplayer();
	}

	if(object_data && object_data.video_id && !object_data.link)
	{
	    this.log("LinternaMagica.constructor:\n"+
		     "Requesting video link via video_id "+
		     object_data.video_id,1);

	    this.request_video_link(object_data);

	    if (/youtube\.com/i.test(window.location.hostname) ||
		(/youtube-nocookie\.com/i.test(window.location.hostname)))
	    {
		// We assume there is only one object per page in 
		// YouTube found trough scripts.
		// Stop processing, so it will not bloat.
		this.log("LinternaMagica.constructor:\n"+
			 "Found one object in YouTube. Stopping script processing",1);
		break;
	    }
	}

	if (object_data && object_data.link)
	{
	    if(!/youtube\.com/i.test(window.location.hostname) &&
	       !/.*facebook\.com/i.test(window.location.hostname))
	    {

		this.log("LinternaMagica.extract_objects_from_scripts:\n"+
			 "Removing plugin install warning.",2);

		this.remove_plugin_install_warning(object_data.parent);

		this.create_video_object(object_data);
	    }

	    if (/.*facebook\.com/i.test(window.location.hostname)  &&
		!this.facebook_flash_upgrade_timeout)
	    {
		this.facebook_flash_upgrade_counter = 0;
		var data = object_data;
		var self = this;
		this.facebook_flash_upgrade_timeout =
		    setInterval(function() {
			self.detect_facebook_flash_upgrade.
			    apply(self,[data]);
		    }, 500);
	    }
	}
    }
}
