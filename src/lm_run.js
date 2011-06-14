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

// The initialisation code. This is kept outside the LinternaMagica
// object on purpose. This function is called in setInterval for a
// while, waiting for objects from "child" userscripts. With this code
// the configuration options of the user and translations objects are
// received. There is no other way for Greasemonkey (IceCat /
// Firefox). Epiphany (and Midori) could make it without this code,
// because the userscript is executed as if it is part of the web page
// and there is access to the window object and everything is in
// single scope.
function linterna_magica_init ()
{
    window.linterna_magica_init_counter ++;

    var ready_to_init = 0;

    // 1.5 second with 250 ms interval.
    if (window.linterna_magica_init_counter >= 6 ||
	window.linterna_magica_user_config != undefined || 
       	window.LinternaMagica_L10N != undefined)
    {
	clearInterval(window.linterna_magica_init_timeout);
	ready_to_init = 1;
    }
    
    if (ready_to_init)
    {
	var config = new Object();

	for (var o in linterna_magica_options)
	{
	    // We could be running without custom config
	    if (window.linterna_magica_user_config != undefined &&
		// Zero migth be an option
		window.linterna_magica_user_config[o] != undefined)
	    {
		config[o] = window.linterna_magica_user_config[o];
	    }
	    else
	    {
		config[o] = linterna_magica_options[o];
	    }
	}

	delete window.linterna_magica_user_config;

	for (var loc in window.LinternaMagica_L10N)
	{
	     LinternaMagica.prototype.languages[loc] =
		window.LinternaMagica_L10N[loc];

	    // Direction value must be lowercase
	    var dir = window.LinternaMagica_L10N[loc]["__direction"];

	    // Wrong value 
	    if (dir != "rtl" &&
		dir != "ltr")
	    {
		dir = "ltr";
	    }

	    LinternaMagica.prototype.languages[loc]["__direction"] = 
		dir.toLowerCase();
	}

	delete window.LinternaMagica_L10N;

	// Init
	var larerna_magica = new LinternaMagica(config);
    }
}

window.linterna_magica_init_counter = 0;
window.linterna_magica_init_timeout = 
    setInterval(linterna_magica_init, 250);
