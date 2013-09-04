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
// @source http://linternamagica.org

// END OF LICENSE HEADER

LinternaMagica.prototype.sites["clipovete.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.clipovete.com"] = "clipovete.com";

LinternaMagica.prototype.sites["clipovete.com"].set_video_link_regex =
function()
{
    var result = new Object();
    result.link_re =  new RegExp (
	"\\\&video=(.*)\\\&(video_id)=(.*)",
	"i");

    result.link_position = 3;

    return result;
}

LinternaMagica.prototype.sites["clipovete.com"].process_extracted_link = function(link)
{
    return  "http://storage.puiako.com/clipovete.com/videos/"+link +".flv";
}

LinternaMagica.prototype.sites["blip.tv"].plugin_install_warning =
function(node)
{
    // Not a plugin warning, but the best place for this. Remove div
    // element blocking the new object.
    var ads = document.getElementById('ads_video');
    if (ads)
    {
    	ads.parentNode.removeChild(ads);
    }

    return null;
}
