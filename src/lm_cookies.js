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

// Extract cookies and save them. Used in YouTube. See "A note on
// cookies".
LinternaMagica.prototype.extract_cookies = function()
{
    this.cookies = document.cookie.split(";");
    return this.cookies;
}

// Sotre extracted cookies/or expire. Used in YouTube.  See "A note on
// cookies".
LinternaMagica.prototype.store_cookies = function(expire)
{
    if (!this.cookies)
    {
	return null;
    }

    var cookies = this.cookies;
    // Nice date ? ;)
    var past_date = new  Date(1983, 9, 27);
    var domain = window.location.hostname;

    var self = this;
    var val = this.call_site_function_at_position.apply(self,[
	"set_cookies_domain",
	window.location.hostname]);

    if (!val)
    {
	return null;
    }
    else if (typeof(val) == "string")
    {
	// See YouTube support.
	domain = val;
    }

    for (var i=0, l=cookies.length; i<l; i++)
    {
	 var val = this.call_site_function_at_position.apply(self,[
	     "process_cookies",
	     window.location.hostname]);

	try 
	{
	    if (typeof(val) == "string")
	    {
		document.cookie = cookies[i]+
		    (expire ? "; expires="+
		     past_date.toUTCString(): "")+val;
	    }
	}
	catch(e)
	{
	    this.log("LinternaMagica.store_cookies:\n"+
		     "Exception while setting cookie with"+
		     " site specific string: "+e,1);
	}

	try
	{
	    // Host is used in dailymotion. It is not documented
	    // anywhere. It is overkill to export it.
	    document.cookie = cookies[i]+
		(expire ? "; expires="+past_date.toUTCString(): "")+
		"; domain="+domain+"; path=/; host="+domain+"; ";
	}
	catch(e)
	{
	    this.log("LinternaMagica.store_cookies:\n"+
		     "Exception while setting cookie: "+e,1);
	}
    }
}

// Restore cookies to previously extracted values. Used in
// YouTube. See "A note on cookies".
LinternaMagica.prototype.restore_cookies = function()
{
    // Don't set expire string 
    this.store_cookies(0);
}

// Expire/delete cookies values; Used in YouTube. See "A note on
// cookies".
LinternaMagica.prototype.expire_cookies = function ()
{
    // Set expire string in the past
    this.store_cookies(1);
}
