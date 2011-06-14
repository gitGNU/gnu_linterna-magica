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

// Extract youtube fmt parameter
LinternaMagica.prototype.extract_youtube_fmt_parameter = function(data)
{
    var fmt_re = new RegExp (
	"(\\\"|\\\'|\\\&)fmt_list"+
	    "(\\\"|\\\')*(\\\=|\\\:|,)\\\s*(\\\"|\\\')*"+
	    "([a-zA-Z0-9\\\-\\\_\\\%\\\=\\\/,\\\\]+)");

    var fmt = data.match(fmt_re);

    if (fmt)
    {
	fmt = fmt[fmt.length-1].replace(/\\/g, "");

	this.log("LinternaMagica.extract_youtube_fmt_parameter:\n"+
		 "Extracted fmt  : "+fmt,1);

	return unescape(fmt);
    }
    else
    {
	this.log("LinternaMagica.extract_youtube_fmt_parameter:\n"+
		 "No fmt parameter found. ",1);
    }

    return null;
}

// Combine fmt and fmt_url_map to links with labels /hd links 
LinternaMagica.prototype.create_youtube_links = function(fmt, fmt_url_map)
{
    if (fmt && fmt_url_map)
    {
	fmt = unescape(fmt).split(/,/);
	var links = new Array();

	for (var f=0; f<fmt.length; f++)
	{
	    // fmt_id/width x height/ junk (?)
	    var link_data = fmt[f].split(/\//);
	    var link = new Object();

	    // Table with fmt values and meaning at
	    // http://en.wikipedia.org/wiki/YouTube#Quality_and_codecs

	    var label="";
	    var fmt_id = link_data[0];

	    // Set container
	    switch (fmt_id)
	    {
	    case '5':
	    case '34':
	    case '35':
		label += "FLV";
		break;
	    case '18':
	    case '22':
	    case '37':
	    case '38':
		label += "MP4";
		break;
	    case '43':
	    case '45':
		label += " WebM";
		break;
	    case '17':
		label += " 3GP";
		break;
	    default:
		label += _("Unkown container");
	    }

	    // Set video and audio encodings
	    switch (fmt_id)
	    {
	    case '5':
		label += " Sorenson H.263, MP3";
		break;
	    case '18':
	    case '22':
	    case '34':
	    case '35':
	    case '37':
	    case '38':
		label += " MPEG-4 AVC (H.264), AAC";
		break;
	    case '43':
	    case '45':
		label += " VP8, Vorbis";
		break;
	    case '17':
		label += " MPEG-4 Visual, AAC";
		break;
	    default:
		label += " " + _("Unkown encoding");
	    }

	    link.label  = link_data[1] + " " +label;
	    link.url = fmt_url_map[fmt_id].replace(/\\u0026/g,"&");

	    this.log("LinternaMagica.create_youtube_links:\n"+
		     "Extracted link  : "+link.url,4);

	   links.push(link);
	}

	return links;
    }

    return null;
}

// Detect youtube flash upgrade warning This is called withing
// setInterval. It is needed because when the elements with the
// warning are inserted all our data that has been added before that
// is removed.
LinternaMagica.prototype.detect_youtube_flash_upgrade = function(object_data)
{
    this.youtube_flash_upgrade_counter++;

    // With default timeout 500mS this will be 3 sec. Stop checking and insert.    
    // Might be flashblock
    if (document.getElementById("flash-upgrade") ||
	this.youtube_flash_upgrade_counter >= 6 )
    {
	clearInterval(this.youtube_flash_upgrade_timeout);

	this.log("LinternaMagica.detect_youtube_flash_upgrade:\n"+
		 "Removing plugin install warning.",2);

	this.remove_plugin_install_warning(object_data.parent);

	this.log("LinternaMagica.detect_youtube_flash_upgrade:\n"+
		 "Creating video object.",2);

	this.create_video_object(object_data);
    }
}


// Extracts data for the flash object in youtube from a script
LinternaMagica.prototype.extract_object_from_script_youtube = function()
{
    var data = this.script_data;
    if (!data.match(/var\s*swfConfig/))
    {
 	return null;
    }

    var height = data.match(/\"height\"\:\s*\"([0-9]+)\"/);
    var width = data.match(/\"width\"\:\s*\"([0-9]+)\"/);

    this.extract_video_id_data = data;
    var video_id = this.extract_video_id();

    var embed_id = data.match(/\"id\"\:\s*\"([a-zA-Z0-9_\-]+)\"/);

    // We do not have any links!
    if (!video_id)
    {
	return null;
    }

    if (height)
    {
	height = height[height.length-1];
    }

    if (width)
    {
	width = width[width.length-1];
    }

    if (embed_id)
    {
	embed_id= embed_id[embed_id.length-1];
    }

    if (!width || !height)
    {
	this.log("LinternaMagica.extract_object_from_script_youtube:\n"+
		 "Missing object data "+
		 "\n H: "+height+
		 "\n W:"+width, 3);

	return null;
    }

    this.log("LinternaMagica.extract_object_from_script_youtube:\n"+
	     " H: "+height+
	     "\n W:"+width+
	     "\n embedid "+embed_id,2);


    var object_data = new Object();

    object_data.width= width;
    object_data.height= height;
    object_data.video_id=video_id;

    if (embed_id)
    {
	embed_object = document.getElementById(embed_id);
	if (embed_object)
	{
	    if (this.plugin_is_installed)
	    {
		this.dirty_objects.push(embed_object);
		object_data.parent = embed_object.parentNode;
	    }
	}
    }

    if (!embed_id ||
	!embed_object ||
	(embed_object &&
	 !this.plugin_is_installed))
    {
	// Ugly && dirty hack.
	// This way we have linterna_magica_id
	this.dirty_objects.push(null);
	object_data.parent = document.getElementById("watch-player");
    }
    object_data.linterna_magica_id = this.dirty_objects.length-1;

    return object_data;
}

// Extract links data for youtube from fmt_url_map
LinternaMagica.prototype.extract_youtube_fmt_url_map = function(data)
{
    var fmt_re = new RegExp (
	"(\\\"|\\\'|\\\&)fmt_url_map"+
	    "(\\\"|\\\')*(\\\=|\\\:|,)\\\s*(\\\"|\\\')*"+
	    "([a-zA-Z0-9\\\-\\\_\\\%\\\=\\\/,\\\\\.\|:=&%\?]+)");

    var fmt = data.match(fmt_re);

    if (fmt)
    {

	// For debug level 1
	this.log("LinternaMagica.extract_youtube_fmt_url_map:\n"+
		 "Extracted fmt_url_map.",1);

	// Hash with keys fmt_ids and values video URLs
	var map = new Object();

	// There was unescape here but it broke the split by ,. How it
	// worked it is not clear. Maybe YT changed something.
	fmt = fmt[fmt.length-1].replace(/\\\//g, "/");

	fmt = fmt.split(/,/);

	for (var url=0; url<fmt.length; url++) 
	{
	    // fmt_id|link
	    var m = fmt[url].split(/\|/);
	    map[m[0]] =  m[1];
	}

	return map;
    }
    else
    {
	this.log("LinternaMagica.extract_youtube_fmt_url_map:\n"+
		 "No fmt_url_map parameter found. ",1);
    }

    return null;
}
