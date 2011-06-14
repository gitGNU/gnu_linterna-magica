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

// Set cookies processing. See "A note on cookies".
LinternaMagica.prototype.set_cookies = function(cookies)
{
    // delete | restore
    var set_cookies_to = cookies ? cookies :"";

    if (!cookies ||
	(!/delete/i.test(cookies) &&
	 !/restore/i.test(cookies)))
    {
	set_cookies_to = "delete";
    }

    this.process_cookies = set_cookies_to;
}

// Check the flash plugin status (installed/not installed) and
// set this.priority  according to configuration
LinternaMagica.prototype.set_priority = function(priority)
{
    // self || plugin
    var set_priority_to = priority ? priority :"";

    // If not valid value force to self
    if (!priority ||
	(!/plugin/i.test(priority) &&
	 !/self/i.test(priority)))
    {
	set_priority_to = "self";
    }

    // If no plugin installed force to self
    if (!this.plugin_is_installed &&
	/plugin/i.test(priority))
    {
	set_priority_to="self";
    }

    this.priority = set_priority_to;
}

// Check configuration options and set the types of controls
// for the video plugin (web/plguin control)
LinternaMagica.prototype.set_controls = function(controls)
{
    // self || plugin
    var set_controls_to;

    // If not valid value force to self
    if (!controls ||
	(!/plugin/i.test(controls) &&
	 !/self/i.test(controls)))
    {
	set_controls_to = false;
    }

    if (/plugin/i.test(controls))
    {
	set_controls_to=false;
    }

    if (/self/i.test(controls))
    {
	set_controls_to=true;
    }

    this.controls = set_controls_to;
}

// Check configuration options and set if
// playback should start on object creation
LinternaMagica.prototype.set_autostart = function(autostart)
{
    var start = autostart ? autostart : true;

    if (!autostart ||
	(!/enabled/i.test(autostart) && 
	 !/disabled/i.test(autostart) &&
	 !/on/i.test(autostart) &&
	 !/off/i.test(autostart) &&
	 !/true/i.test(autostart) &&
	 !/false/i.test(autostart)))
    {
	start = false;
    }

    if (/enabled/i.test(autostart) ||
	/on/i.test(autostart) ||
	/true/i.test(autostart))
    {
	start = true;
    }

    if (/disabled/i.test(autostart)
	|| /off/i.test(autostart)
	|| /false/i.test(autostart))
    {
	start = false;
    }

    this.autostart = start;
}

// Set the timeout for Dailymotion. After this timeout background
// processing starts
LinternaMagica.prototype.set_wait_dailymotion = function(wait)
{
    var set_wait_to = wait ? wait :"";

    if (!wait ||
	(typeof(wait) != "number" &&
	 !/[0-9]+/i.test(wait) &&
	 !/false/i.test(wait) &&
	 !/no/i.test(wait) &&
	 !/off/i.test(wait) &&
	 !/disabled/i.test(wait)))
    {
	// Realy ?
	set_wait_to = 1500;
    }

    if ( /false/i.test(wait) ||
	 /no/i.test(wait) ||
	 /off/i.test(wait) ||
	 /disabled/i.test(wait))
    {
	set_wait_to = 0;
    }

    this.wait_dailymotion = set_wait_to;
}

// Set updates 
LinternaMagica.prototype.set_check_updates = function(updates)
{
    var set_updates_to = updates ? updates : "";

    if (!updates ||
	(!/^[0-9]+(d|w|m||y)$/i.test(updates) &&
	 !/false/i.test(updates) &&
	 !/no/i.test(updates) &&
	 !/off/i.test(updates) &&
	 !/disabled/i.test(updates) &&
	 !/never/i.test(updates)))
    {
	set_updates_to = "3w";
    }

    if ((/false/i.test(updates) ||
	 /no/i.test(updates) ||
	 /off/i.test(updates) ||
	 /disabled/i.test(updates) ||
	 /never/i.test(updates)) ||
	// Don't accept raw numbers
	updates >= 0)
    {
	set_updates_to = -1;
    }

    this.updates = set_updates_to;
}
