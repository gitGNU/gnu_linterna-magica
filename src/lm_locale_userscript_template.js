//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011  Ivaylo Valkov <ivaylo@e-valkov.org>
//  Copyright (C) 2010  Anton Katsarov <anton@katsarov.org>
//
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

// ==UserScript==
// @name           Linterna Mágica l10n @LOCALE@
// @namespace Linterna Mágica
// @description  @LOCALE_NAME@ localisation for Linterna Mágica version @VERSION@.
// @include        http://*
// @include        https://*

// ==/UserScript==

var LM_L10N;

var head = document.getElementsByTagName("head")[0];
var script = document.createElement("script");

script.setAttribute("type", "text/javascript");

var script_data = 
    "if (window.LinternaMagica_L10N == undefined)"+
    "{"+
    "window.LinternaMagica_L10N = new Object();"+
    "}; ";

for (var o in LM_L10N)
{
    script_data += "window.LinternaMagica_L10N['"+o+ "'] = "; 
    if (/object/i.test(typeof(LM_L10N[o])))
    {
	script_data += "{";
	for (var oo in LM_L10N[o])
	{
	    if (/object/i.test(typeof(LM_L10N[o][oo])) &&
		typeof(LM_L10N[o][oo].join) != "undefined")
	    {
		// Array
		script_data += '"'+oo+ '" : ["' +
		    LM_L10N[o][oo].join('","')+'"],';
	    }
	    else if (/object/i.test(typeof(LM_L10N[o][oo])))
	    {
		// Object
		script_data += '"' +oo+'":{';
		for (var ooo in LM_L10N[o][oo])
		{
		    script_data += '"'+ooo+ '" : "' +LM_L10N[o][oo][ooo]+'",';
		}
		script_data +='},';
	    }
	    else
	    {
		// String or number
		script_data += '"'+oo+ '" : "' +LM_L10N[o][oo]+'",';
	    }
	}
	script_data += "};";
    }
    else
    {
	script_data += '"'+LM_L10N[o]+'"';
    }
}

script_data += ";";

script.textContent = script_data;

head.appendChild(script);

head.removeChild(script);
LM_L10N = undefined;
