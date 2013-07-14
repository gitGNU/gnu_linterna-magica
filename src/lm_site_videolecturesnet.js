//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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
LinternaMagica.prototype.sites["videolectures.net"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.videolectures.net"] = "videolectures.net";

LinternaMagica.prototype.sites["videolectures.net"].skip_link_extraction =
function()
{
    var see_also = document.getElementById("vl_seealso");

    if (!see_also)
    {
	return null;
    }

    var ps = see_also.getElementsByTagName("p");

    if (!ps)
    {
	return null;
    }

    var p = ps[0];
    var link = p.getElementsByTagName("a");

    if (!link)
    {
	return null;
    }

    link = link[0];

    var extracted_data = new Object();
    extracted_data.link = link.getAttribute("href");
    // Breaks the web controls. Works fine in Totem without this.
    // extracted_data.mime = "video/x-ms-wmv";

    return extracted_data;

}

LinternaMagica.prototype.sites["videolectures.net"].do_not_force_iframe_detection =
function()
{
    return false;
}
