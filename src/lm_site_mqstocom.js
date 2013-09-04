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

LinternaMagica.prototype.sites["mqsto.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.mqsto.com"] = "mqsto.com";

LinternaMagica.prototype.sites["mqsto.com"].process_extracted_link =
function(link)
{
    // Must be just the path part othe link
    if (!/^http/i.test(link))
    {
	link = "http://mqsto\.com/video/"+link;
    }

    return link;
}

LinternaMagica.prototype.sites["mqsto.com"].css_fixes =
function(object_data)
{
    // Move the facebook comment frame in mqsto.com 100px
    // down. overlaps the player.
    var move_down_fb_frame = 100;

    object_data.parent.style.setProperty("height",
					 (parseInt(object_data.height)+
					  26+move_down_fb_frame+
					 // borders 1px x 2
					 2+
					 (this.controls ? 24 : 0))+"px",
					 "important");

    return false;
}
