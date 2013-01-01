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

// Create the object/frame that will fetch the script with JSONP data
// without sending referrer.
// data = 
// {
//     // Where to save the setInterval id
//     parser_timeout: object,
//     // The counter object/variable used to count the time that passed
//     // since checking started
//     parser_timeout_counter: object,
//     // The URL where the JSONP data is
//     jsonp_script_link: string,
//     // The function to parse the data inside the frame
//     jsonp_function: string
//     // The function in LM that will use and parse the data.
//     parser_function: object,
//     // The id for the frame
//     frame_id: string
//    // Custom data to be passed to the parser_function
//    user_data: object
// }
LinternaMagica.prototype.create_checker_frame = function(data)
{

    if (!data || typeof(data) != "object")
    {
	return null;
    }

    if (!data.parser_timeout)
    {
	data.parser_timeout_counter = 0;
	var self = this;

	// Polling. The data will be retrieved in the main window =>
	// the LinternaMagica object.
	data.parser_timeout = 
	    setInterval(function()
			{
			    self.jsonp_data_parser.apply(self,[data]);
			}, 10);
    }

    // The script is wrapped inside a data URI scheme. This way the
    // page where the user was (referrer) is not sent. Cross-domain
    // frame communcication with hashed messages
    // (original-link#message=) is used to access the data.
    var checker_frame = document.createElement("object");
    checker_frame.setAttribute("id", data.frame_id);

    var frame_script = function()
    {
	window[jsonp_function] = function (request_data)
	{
	    var hash = /#/i.test(receiver_location) ? "" : "#";

	    // Stringify
	    var data = json_parser.json_to_string(request_data);

	    // Protect against illegal XML characters 
	    data = encodeURI(data);

	    // Pack the data
	    var packed_data = btoa(data);

	    // If packed_data is null, native JSON is missing. At least
	    // updates should have backup. For updates the JSON object
	    // is simple and conversion is easy.
	    window.parent.location = decodeURI(receiver_location)+hash+
		encodeURI("&linterna_magica&lm_request_data="+
			  packed_data+
			  "&linterna_magica");
	};
    };

    var frame_data = 
	"<html><head>"+
	"<script async='async' defer='defer' type='text/javascript'>"+
	"var json_parser = new Object(); json_parser.json_to_string = "+
	this.json_to_string.toString()+"; "+
	"var jsonp_function ='"+data.jsonp_function+"'; "+
	"var receiver_location='"+
	encodeURI(window.location)+"';("+frame_script.toString()+")();"+
	"</script>"+
	"<script async='async' defer='defer' type='text/javascript' src='"+
	data.jsonp_script_link+"'>"+
	"</script>"+
	"</head><body></body></html>";

    checker_frame.setAttribute("data",
			       "data:text/html;charset=UTF-8;base64,"+
			       btoa(frame_data));

    checker_frame.setAttribute("width","1px");
    checker_frame.setAttribute("height", "1px");

    document.getElementsByTagName("body")[0].appendChild(checker_frame);
}

// Parses the JSONP data and clears the frame/object. Passes the JSONP
// data to the data.parser_function function. The format of the data
// object is documented in create_checker_frame().
LinternaMagica.prototype.jsonp_data_parser = function(data)
{
    if (!data || typeof(data) !== "object")
    {
	return null;
    }

    data.parser_timeout_counter++;

    // With default timeout 10mS this will be 10 sec. Stop
    // checking. Something must be wrong.
    if (data.parser_timeout_counter >= 10000)
    {
	clearInterval(data.parser_timeout);
    }

    if (/linterna_magica/i.test(window.location))
    {
	clearInterval(data.parser_timeout);
	var jsonp_data  = 
	    window.location.toString().split("&linterna_magica");

	// Clear our data from the address field
	// window.location = jsonp_data[0]+jsonp_data[jsonp_data.length-1];
	history.go(-1);
	
	// Cleanup the checker object/frame
	var o = document.getElementById(data.frame_id);
	if (o)
	{
	    o.parentNode.removeChild(o);
	}

	// The real data
	jsonp_data = jsonp_data[1].split("lm_request_data=")[1].split("&")[0];

	// Unpack
	jsonp_data = this.string_to_json(decodeURI(atob(jsonp_data)));

	data.parser_function.apply(this, [jsonp_data, data.user_data]);
    }
}

// Convert JSON to string. Older browsers lack native JSON
// object. They will require custom code.
LinternaMagica.prototype.json_to_string = function (json_object)
{
    var json_as_string = null;

    if (typeof(JSON) == "object" &&
	typeof(JSON.stringify) == "function")
    {
	try
	{
	    json_as_string = JSON.stringify(json_object);
	}
	catch(e)
	{
	}
    }

    return json_as_string;
}

// Convert string to JSON. Older browsers lack native JSON
// object. They will require custom code.
LinternaMagica.prototype.string_to_json = function (json_string)
{
    var json_object = null;

    if (typeof(JSON) == "object" &&
	typeof(JSON.parse) == "function")
    {
	try
	{
	    json_object  = JSON.parse(json_string)
	}
	catch(e)
	{
	}
    }

    return json_object;
}
