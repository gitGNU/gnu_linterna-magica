//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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


// This object initializes the LinternaMagica object
var linterna_magica_options =
    {
	// Print debugging information
	// log level 0,1, 2, 3, 4, 5
	"debug": 0,
	// Where to print the debugging information
	// web: Print messages in the web page (default)
	// console: Use the debugging console of the browser
	"log_to": "web",
 	// Should the web logger be automatically expanded by default
	// false: No (default)
	// true: Yes
	"web_log_expand": false,
	// Should Linterna  Mágica automatically check and notify for
	// updates.
	// <time><type>: Check at interval. (default 3w)
		// <time>: number
		// <type>:  d/w/m/y
		// d = day, w = week, m = month, y = year
	// Linterna Mágica will check for updates also at the first
	// and at the second day after the exact match that is
	// configured.
	// off/disabled/no/never/false/0: Do not check
	"updates": "1w",
	// Automatically start the video playback
	// enabled: Auto start the clip (default)
	// disabled:  Do not start the clip
	"autostart": "on",
	// Web controls or video plugin controls
	// self: Use controls provided by Linterna Mágica (default)
	// plugin: Use controls provided by the video plugin
	"controls": "self",
	// Interface language
	// auto: Use the language of the browser interface if
	// translation is available (default)
	// <lc>_<CC>: Set language to lc_CC, where
	// <lc>:  language code (lowercase)
	//  <CC>: country code (uppercase)
	// Example: en_US, en_UK, bg_BG
	"locale": "auto",
	// The way cookies are proccessed. The explanation is too long
	// to fit here. Please ***read*** "A note on cookies", in the
	// HELP file.
	// delete: Just delete the cookies.
	// restore: Extract and restore cookies.
	"cookies": "restore",
	// Timeout before background processing (XHR) starts  in
	// milliseconds. 1 s = 1000 ms. If you have problems increase the
	// value.
	// off/no/disabled/false/0: Don't wait (defult)
        // <integer>: Wait for <integer> milliseconds.
	"wait_xhr": "off",
	// Preferred video quality.
	//
	// low/medium/high: Automatically select the link for
	// low/medium/high from the list of links (default low)
	//
	// <number>: Start the <number> link from the list. If not
	// available the highest quality. Use "1" for lowest quality.
	//
	// <number>%: Start the link that corresponds to <number>
	// percent from the list. Float numbers are allowed - 34.56%,
	// 18,6%.
	"quality": "low",
    };

// NO MINIMISATION ABOVE THIS LINE
