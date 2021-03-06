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

LinternaMagica.prototype.sites["videoclipsdump.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.videoclipsdump.com"] = "videoclipsdump.com";

LinternaMagica.prototype.sites["videoclipsdump.com"].prepare_xhr =
function(object_data)
{
    var result = new Object();

    result.address = "/player/cbplayer/settings.php?vid="+
	object_data.video_id;

    return result;
}

LinternaMagica.prototype.sites["videoclipsdump.com"].process_xhr_response =
function(args)
{
    var client = args.client;
    var object_data = args.object_data;
    var xml = client.responseXML;
    var path = xml.getElementsByTagName("videoPath")[0];

    if (path)
    {
	object_data.link = path.getAttribute("value");
    }

    return object_data;
}
