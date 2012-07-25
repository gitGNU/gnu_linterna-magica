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

// Extracts object data for flash objects created with SWFObject (v1 && v2)
// flash library
LinternaMagica.prototype.extract_object_from_script_swfobject = function()
{
    var constructor_re = new RegExp(
	"(swfobject.embedSWF|(\\\w+|window\\\[\\\"\\\w+\\\"\\\])\\\s*="+
	    "\\\s*new\\\s*SWFObject)\\\("+
	    "([^,]+)"+
	    "\\\s*,\\\s*([^,]+)"+
	    "\\\s*,\\\s*([^,]+)"+
	    "\\\s*,\\\s*([^,]+)"+
	    "\\\s*,\\\s*([^,\\\)]+)"+
	    "(\\\s*,\\\s*([^,\\\)]+)){0,1}"+
	    "(\\\s*,\\\s*([^,\\\)]+)){0,1}"+
	    "(\\\s*,\\\s*([^,\\\)]+)){0,1}"+
	    "(\\\s*,\\\s*([^,\\\)]+)){0,1}"+
	    "(\\\s*,\\\s*([^,\\\)]+)){0,1}"+
	    "\\\)",
	"img");

    var data = this.script_data;
    var constructor = null;
    var var_name = null;
    var id_re = null;
    var el = null;
    var count = 0;
    var last_constructor = null;

    while (constructor = constructor_re.exec(data))
    {
	last_constructor = constructor;
	el = constructor[4].replace(/\'|\"/g, "");

	if (!document.getElementById(el))
	{
	    // variable_name = constructor[2]
	    var_name = 
		constructor[2].replace(/window\[\"/,"").
		replace(/\"\]/,"");

	    id_re = new RegExp(
		var_name+"\\."+
		    "write\\("+"("+"\\'"+'|\\"'+")*"+
		    "([A-Za-z0-9_-]+)"+"("+"\\'"+'|\\"'+")*"+
		    "\\)",
		"ig");
	    
	    el = null;
	    var inner_count = 0;

	    while (el = id_re.exec(data))
	    {
		// If there are more than two SWFObject object in the
		// same <script> tag, we need the id of the DOM
		// element where the current matched SWF object will
		// write the SWF object. Theoretically the first match
		// of a SWFObject constructor should be related to the
		// first match for the SWFObject write method, the
		// second construcor to the second write method and so
		// on. This way we should be able to match the exact
		// id.
		//
		// See bug #108050:
		// https://savannah.nongnu.org/support/?108050
		if (inner_count >= count)
		    
		{
		    break;
		}
		
		inner_count++;
	    }

	    // Do not know where the object should be
	    if (!el)
	    {
		this.log("LinternaMagica.extract_object_from_script_"+
			 "swfobject:\n"+
			 "No id extracted from SWFObject.write method "+
			 "id_re" +id_re,4);

		continue;
	    }

	    el = el[el.length-2];
	    
	    // We have an element that will hold LM, break.
	    //
	    // See bug #108050:
	    // https://savannah.nongnu.org/support/?108050
	    if (document.getElementById(el))
	    {
		break;
	    }
	}
	count++;
    }

    constructor = last_constructor;

    // All attempts to find where to place LM failed. Exit.
    if (!document.getElementById(el))
    {
	return null;
    }

    var height, width;
    var object_data= new Object();

    if (this.skip_object_if_id(el))
    {
	return null;
    }

    object_data.parent = document.getElementById(el);

    // No such element. Do not know where the object should be
    if (!object_data.parent)
    {

	this.log("LinternaMagica.extract_object_from_script_swfobject:\n"+
		 "Wrong element id (or wrong regex)"+el,1);

	return null;
    }

    object_data.width = constructor[5].replace(/\'|\"/g, "");
    object_data.height = constructor[6].replace(/\'|\"/g, "");

    // Extract width from parent node if it is in percent
    if (/%/i.test(object_data.width))
    {
	object_data.width = object_data.parent.clientWidth;
    }

    if (/%/i.test(object_data.height))
    {
	object_data.height = object_data.parent.clientHeight;
    }

    this.extract_link_data = data;
    object_data.link = this.extract_link();


    if (!object_data.link)
    {
	this.extract_video_id_data = data;

	var self = this;
	var val = this.call_site_function_at_position.apply(self,[
	    "libswfobject_skip_video_id_extraction",
	    window.location.hostname,object_data]);

	// Result from default function
	if (val && typeof(val) == "boolean")
	{
	    object_data.video_id = this.extract_video_id();
	}
	else if(val)
	{
	    // Result from site function
	    object_data.video_id = val;
	}
    }

    if (object_data.video_id || object_data.link)
    {
	this.log("LinternaMagica.extract_object_from_script_swfobject:\n"+
		 "SWF object extracted from script ",1);

	object_data.linterna_magica_id =
	    this.mark_flash_object("extracted-from-script");
	
	var self = this;
	var val = this.call_site_function_at_position.apply(self,[
	    "extract_hd_links_from_script_if_link",
	    window.location.hostname, data]);
	
	if (val && typeof(val) != "boolean")
	{
	    object_data.hd_links = val;
	}

	return object_data;
    }

    return null;
}
