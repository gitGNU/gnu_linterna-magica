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

// Localization function 
// Checks if there is translation for the default browser language or
// user selected one and then if the string is translated into that
// language. If no translation is found the string is returned as-is
// (English);
LinternaMagica.prototype._ = function (string)
{
    if (this.lang == "C")
    {
	return string;
    }

    var use_lang = this.languages[this.lang];

    return use_lang ? 
	use_lang[string] ? use_lang[string] : string : string ;
}

// Examines navigator.language and sets this.env_lang (en_US, en_UK,
// bg_BG; etc)
LinternaMagica.prototype.set_env_lang = function()
{
    var env_lang = navigator.language.replace("-", "_");
    
    // Epiphany (WebKit?) without translation
    if (env_lang.toLowerCase() == "c")
    {
	// Same as GNU IceCat & Firefox without translation
	env_lang = "en_US";
    }
    
    // Epiphany uses only lowercase
    env_lang = env_lang.split(/_/);
    env_lang[env_lang.length-1] = 
	env_lang[env_lang.length-1].toUpperCase();

    env_lang[0] = 
	env_lang[0].toLowerCase();

    env_lang = env_lang.join("_");

    this.env_lang = env_lang;
}
