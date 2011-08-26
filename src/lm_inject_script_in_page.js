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

// This file must be concatenated firs in the Makefile. It injects the
// entire userscript in the page if Greasemonkey is detected. in
// Epiphany and Midori it is already running in the page scope. 
// See https://savannah.nongnu.org/bugs/?33120

// We are running in Greasemonkey and the userscript is not inject in
// the page yet.
if (typeof(unsafeWindow) == "object")
{
    (function inject_in_page() 
     {
	 var userscript_data = inject_in_page.caller.toString();
	 var script = document.createElement("script");
	 script.setAttribute("type", "text/javascript");
	 script.setAttribute("src", 
			     "data:text/javascript;charset=UTF-8;base64,"+
			     btoa("("+userscript_data+")();"));

	 var inject_data = function()
	 {
	     var head = document.getElementsByTagName("head")[0];
	     head.appendChild(script);
	     head.removeChild(script);
	 }

	 setTimeout(inject_data, 0);
     })();

    return;
}
