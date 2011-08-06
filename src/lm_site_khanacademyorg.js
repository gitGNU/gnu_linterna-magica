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

LinternaMagica.prototype.sites["khanacademy.org"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.khanacademy.org"] = "khanacademy.org";

LinternaMagica.prototype.sites["khanacademy.org"].css_fixes =
function(object_data)
{
    if (object_data.parent && object_data.parent.hasAttribute("id") &&
	/youtube_blocked/i.test(object_data.parent.getAttribute("id")))
    {
	// The site has two flash objects. The main one is a YouTube
	// video that is detected as remotely embedded. For this one
	// link is created. The second one is sort of a fallback with
	// clips at archive.org. It is hidden and displaced by the
	// site, but it starts playing. We hide the YouTube object and
	// show the fallback one.
	var parent = object_data.parent;
	parent.style.setProperty("left", "0px", "important");
	parent.style.setProperty("position", "relative", "important");
	parent.style.setProperty("visibility", "visible", "important");

	for (var i=0, l=this.found_flash_video_objects;i<l;i++)
	{
	    // Hide all other LM && flash objects 
	    var fo = this.get_flash_video_object(i);
	    if (fo &&
		fo.linterna_magica_id != object_data.linterna_magica_id)
	    {
		fo.parentNode.style.setProperty("display", "none",
						"important");
	    }
	}

	// Make some space between LM and the site buttons. 
	parent.style.setProperty("margin-bottom", "20px", "important");

    }

    return null;
}
