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

// Wrap links to external pages in data URI scheme. This is separate
// document. No referrer is send.
LinternaMagica.prototype.pack_external_link = function(href,text)
{
    var a = document.createElement('a');
    var data = "data:text/html;charset=utf-8;base64,";
    data += btoa(
	"<html><head><meta http-equiv='refresh' content='0;url="+
	href+"' /></head><body></body></html>");

    var txt = document.createTextNode(text);
    a.setAttribute("href", data);
    a.appendChild(txt);

    return a;
}
