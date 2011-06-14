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

// Extracts object data for flash objects created with SWFObject (v1 && v2)
// flash library
// This also extracts objects created with  new Flash() (novatv).bg
// because of great simillarity in processing and arguments
LinternaMagica.prototype.extract_object_from_script_swfobject = function()
{
    var constructor_re = new RegExp(
	"(swfobject.embedSWF|(\\\w+)\\\s*=\\\s*new\\\s*SWFObject|"+
	    "new\\\s*Flash)\\\("+
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
	"im");

    var data = this.script_data;
    var constructor = data.match(constructor_re);
    var height, width, el;
    var object_data= new Object() ;

    if (!constructor)
    {
	return null;
    }

    el = constructor[4].replace(/\'|\"/g, "");

    if (!document.getElementById(el))
    {
	// variable_name = constructor[2]
	var id_re = new RegExp(
	    (/novatv\.bg/i.test(window.location.hostname)
	     ?  "(\\.)*" : constructor[2]+"\\.")+
		"write\\("+"("+"\\'"+'|\\"'+")*"+
		"([A-Za-z0-9_-]+)"+"("+"\\'"+'|\\"'+")*"+
		"\\)",
	    "i");

	el = data.match(id_re);

	// Do not know where the object should be
	if (!el)
	{
	    this.log("LinternaMagica.extract_object_from_script_"+
		     "swfobject:\n"+
		     "No id extracted from SWFObject.write method "+data+
		     "id_re" +id_re,4);

	    return null;
	}

	el = el[el.length-2];
    }

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

    if (/dailymotion\.com/i.test(window.location.hostname))
    {
	object_data.video_id = window.location.pathname;
    }
    else
    {
	this.extract_link_data = data;
	object_data.link = this.extract_link();

	if (!object_data.link)
	{
	    this.extract_video_id_data = data;
	    object_data.video_id = this.extract_video_id();
	}
    }

    if (object_data.video_id || object_data.link)
    {
	// if (/dailymotion\.com/i.test(window.location.hostname))
	// {
	//     this.log("LinternaMagica.extract_object_from_script_swfobject:\n"+
	// 	     "Trying to extract dailymotion.com HQ links ",1);
	//     object_data.hd_links = this.extract_dailymotion_hd_links(data);

	// }
	// else
	if (/ted\.com/i.test(window.location.hostname))
	{
	    this.log("LinternaMagica.extract_object_from_script_swfobject:\n"+
		     "Trying to extract ted.com HQ links ",1);
	    object_data.hd_links = this.extract_tedcom_hd_links(data);
	}
	// else if (/myvideo\.de/i.test(window.location.hostname))
	// {
	//     // See the comments for this function
	//     object_data.link = this.create_myvideode_link();
	//     // Now that we have a link remove the video_id
	//     // so it is not processed
	//     object_data.video_id = null;
	// }

	this.log("LinternaMagica.extract_object_from_script_swfobject:\n"+
		 "SWF object extracted from script ",1);

	// Ugly && dirty hack.
	// This way we have linterna_magica_id
	this.dirty_objects.push(null);
	object_data.linterna_magica_id = this.dirty_objects.length-1;
	return object_data;
    }

    return null;
}
