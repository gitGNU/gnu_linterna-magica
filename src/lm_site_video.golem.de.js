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
// @source http://linternamagica.org

// END OF LICENSE HEADER

LinternaMagica.prototype.sites["video.golem.de"] = new Object();

LinternaMagica.prototype.sites["video.golem.de"].
    libswfobject_skip_video_id_extraction =
function()
{
    var id = window.location.href.split("/");
    id = id[id.length-2];

    return id;
}

LinternaMagica.prototype.sites["video.golem.de"].extract_object_from_script =
function()
{
    var object_data = 
	this.extract_object_from_script_swfobject.apply(this,[arguments]);

    if (!object_data)
    {
	return null;
    }

   object_data.link =  "http://video.golem.de/download/" +
	object_data.video_id;
    object_data.video_id = null;

    return object_data;
}

LinternaMagica.prototype.sites["video.golem.de"].css_fixes = 
function(object_data)
{
    object_data.parent.style.removeProperty("background");
}
