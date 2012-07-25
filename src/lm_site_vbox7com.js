//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012  Ivaylo Valkov <ivaylo@e-valkov.org>
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

LinternaMagica.prototype.sites["vbox7.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.vbox7.com"] = "vbox7.com";

LinternaMagica.prototype.sites["vbox7.com"].prepare_xhr =
function(object_data)
{
    var result = new Object();

    result.address ="/play/magare.do";
    result.method = "POST";
    result.data = "vid="+object_data.video_id;
    result.content= "application/x-www-form-urlencoded";

    return result;
}

LinternaMagica.prototype.sites["vbox7.com"].process_xhr_response =
function(args)
{
    var client = args.client;
    var object_data = args.object_data;

    object_data.link = client.responseText.split(/videoFile=/i)[1].split("&")[0];

    return object_data;
}
