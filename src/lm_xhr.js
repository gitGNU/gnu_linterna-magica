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
// @source http://linterna-magica.nongnu.org

// END OF LICENSE HEADER

// Request a video link for extracted video_id.
LinternaMagica.prototype.request_video_link = function(object_data)
{
    // FIXME:
    // If it is embeded in remote site it might be good to
    // extract them from swf object data/src attribute
    var protocol = window.location.protocol;
    var host = window.location.host;
    var location_href = window.location.href;
    var video_id = object_data.video_id;
    var address = null;
    var method ="GET";
    var data =null;
    var content= null;
    var client = new XMLHttpRequest();

    // Mark video_id data as being retrieved already.  Prevents tow
    // players to show in YouTube. There is a check in
    // create_video_object() for duplicate objects, but this prevents
    // useless XHR requests.
    if (!this.requested_ids[video_id+host])
    {
	this.requested_ids[video_id+host]=1;
    }
    else
    {
	this.log("LinternaMagica.request_video_link:\n"+
		 "Video with id  "+video_id+
		 " is being processed. Skipping this request."+host,1);

	var self = this;
	var val = this.call_site_function_at_position.apply(self,[
	    "process_duplicate_object_before_xhr",
	    host, object_data]);

	return null;
    }

    var self = this;
    var val = this.call_site_function_at_position.apply(self,[
	"prepare_xhr",
	host, object_data]);

    if (val && typeof(val) != "boolean")
    {
	address = val.address ? val.address : address ;
	method = val.method ? val.method : method;
	data = val.data ? val.data : data;
	content = val.content ? val.content : content;
    }

    var self = this;
    client.onreadystatechange = function() {
	var client = this;
	self.request_video_link_parse_response(client, object_data);
    }

    if (!address)
    {
	this.log("LinternaMagica.request_video_link:\n"+
		 "No address availible for host "+host,1);
	return null;
    }

    // Only set the address if it is relative
    if (!/^http/i.test(address))
    {
	address = protocol+"//"+host+address;
    }

    client.open(method,address ,true);

    if (content)
    {
	client.setRequestHeader("Content-Type", content);
    }

    client.send(data);
}

// Extract the video link from the response we received (see above)
LinternaMagica.prototype.request_video_link_parse_response =
function(client, object_data)
{
    if (client.readyState == 4 && client.status == 200)
    {
	// Remove marked video_id as being retrieved already.
	if (this.requested_ids[object_data.video_id+host])
	{
	    delete this.requested_ids[object_data.video_id+host];
	}

	var host = window.location.hostname;
	var url;
	var mime= "video/flv";

	var self = this;
	var val = this.call_site_function_at_position.apply(self,[
	    "process_xhr_response",
	    host, {client: client, object_data:object_data}]);

	if (!val ||  typeof(val) == "boolean" || (val && !val.link))
	{
	    return null;
	}
	else
	{
	    object_data = val;
	}

	if (!object_data.mime)
	{
	    object_data.mime = mime;
	}

	var self = this;
	var val = this.call_site_function_at_position.apply(self,[
	    "insert_object_after_xhr",
	    host, object_data]);

	if (val)
	{
	    this.log("LinternaMagica.request_video_link_parse_response:\n"+
		     "Removing plugin install warning.",2);
	    this.remove_plugin_install_warning(object_data.parent);
	    this.log("LinternaMagica.request_video_link_parse response:\n"+
		     "Creating video object with url: "+object_data.link,1);
	    this.create_video_object(object_data)
	}
    }
}
