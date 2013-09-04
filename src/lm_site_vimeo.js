//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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


LinternaMagica.prototype.extract_signature_vimeo = function()
{
    var data = this.script_data;
    var signature = null;

    if (!data)
    {
	return null;
    }

    var signature_re =  new RegExp(
	"(\\\"|\\\')*signature(\\\"|\\\')*:(\\\"|\\\')*([^,\\\"\\\']+)(\\\"|\\\')*",
	"im");

    signature = data.match(signature_re);

    if (signature && signature[signature.length-2])
    {
	signature = signature[signature.length-2];
    }

    return signature;
}
 
LinternaMagica.prototype.extract_time_stamp_vimeo = function()
{
    var data = this.script_data;
    var time_stamp = null;

    if (!data)
    {
	return null;
    }

    var time_stamp_re =  new RegExp(
	"(\\\"|\\\')*[^_]timestamp(\\\"|\\\')*:(\\\"|\\\')*([^,\\\"\\\']+)(\\\"|\\\')*",
                  // ^^^ Skip cached_timestamp
	"im");

    time_stamp = data.match(time_stamp_re);

    if (time_stamp && time_stamp[time_stamp.length-2])
    {

	time_stamp = time_stamp[time_stamp.length-2];
    }

    return time_stamp;
}


LinternaMagica.prototype.extract_codec_and_quality_vimeo = function()
{
    var data = this.script_data;

    if (!data)
    {
	return null;
    }

    var files_re =  new RegExp(
	"(\\\"|\\\')*files(\\\"|\\\')*:(\\\"|\\\')*([^\\\}]+)",
	"im");

    var files = data.match(files_re);

    if (!files && !files[files.length-1]);

    this.log("LinternaMagica.prototype.extract_codec_and_quality_vimeo:\n"+
	     "Result from files_re: "+files,5);

    var codecs_data_re = new RegExp(
	"(\\\"|\\\')*([^:,\\\"\\\']+)(\\\'|\\\")*:\\\[([^\\\]]+)\\\]",
	"img");

    var codecs_data =  null;
    var codecs = new Object();
    codecs.length = -1;

    while(codecs_data = codecs_data_re.exec(files[files.length-1]))
    {
	if (codecs_data && codecs_data[codecs_data.length-1] &&
	    codecs_data[codecs_data.length-3])
	{
	    var name = codecs_data[codecs_data.length-3];
	    var quality = codecs_data[codecs_data.length-1];
	    quality = quality.replace(/\"|\'|/g, '').split(/,/);
	    codecs[name] = quality;

	    this.log("LinternaMagica.extract_codec_and_quality_vimeo:\n"+
		     "Extracted codec "+name+". "+
		     "Available quality: "+quality.join(", ")+".",5);
	    codecs.length++;
	}
    }

    if (codecs.length == -1)
    {
	codecs = null;
    }

    delete codecs.length;

    return codecs;
}

LinternaMagica.prototype.create_links_vimeo = function(args)
{
    if(!args)
    {
	return null;
    }
   
    var links = new Array();

    for (var c in args.codecs)
    {
	for (var i=0,l=args.codecs[c].length;i<l; i++)
	{
	    var q = args.codecs[c][i].toLowerCase();
	    var link = new Object();

	    link.url = "http://player.vimeo.com/play_redirect?quality="+q+
		"&codecs="+c+
		"&clip_id="+args.object_data.video_id+
		"&time="+args.time_stamp+
		"&sig="+args.signature+"&type=html5_desktop_local";


	    // Mobile 480x
	    // SD 640x
	    // HD 1280x

	    var res = null;
	    if (q == "mobile")
	    {
		res = "480p";
	    }
	    else if (q ==  "sd")
	    {
		res = "640p";
	    }
	    else if (q == "hd")
	    {
		res = "1280p";
	    }
	    else
	    {
		res = "Unknown";
	    }

	    var codec = c.toUpperCase();
	    link.label = res + " "+codec;
	    link.more_info = codec+ " "+q.toUpperCase()+" "+res;

	    links.push(link);
	}
    }

    return (links && links.length >=0) ? links : null;
}

LinternaMagica.prototype.sites["vimeo.com"] = new Object();

// Reference 
LinternaMagica.prototype.sites["www.vimeo.com"] = "vimeo.com";

// Reference YT's function. Checks for HTML5 player and if found, scan
// scripts.
LinternaMagica.prototype.sites["vimeo.com"].flash_plugin_installed = "youtube.com";

// Extract object data in Vimeo. This makes Firefox and forks to work
// without plugin and without HTML5 (missing H264)
LinternaMagica.prototype.sites["vimeo.com"].extract_object_from_script = function()
{
    var player_element_re = new RegExp(
	"player[0-9]+_[0-9]+_element\\\s*=\\\s*"+
	    "document.getElementById\\\(\\\'([a-zA-Z0-9_]+)\\\'\\\)",
	"im");

    var data = this.script_data;
    var player_element = data.match(player_element_re);

    if (!player_element)
    {
	return null;
    }

    var el = document.getElementById(player_element[1]);

    // No parent element
    if (!el)
    {
	return null;
    }

    var video_id = data.match(/\"id\":([0-9]+),/);

    if (video_id)
    {
	video_id = video_id[1];
    }

    // It is possible to extract width and height from JavaScript but
    // they make the object HUGE and out of place

    var width = el.clientWidth || el.offsetWidth || 
	el.parentNode.clientWidth || el.parentNode.offsetWidth;

    var height = el.clientHeight || el.offsetHeight || 
	el.parentNode.clientHeight || el.parentNode.offsetHeight;
    
    if (video_id && width && height)
    {
	var object_data = new Object();
	object_data.width = width;
	object_data.height = height;
	object_data.video_id = video_id;
	object_data.parent = el;
	object_data.mime = "video/mp4";


	var time_stamp = this.extract_time_stamp_vimeo();
	var signature = this.extract_signature_vimeo();

	if (!time_stamp)
	{
	    this.log("LinternaMagica.extract_object_from_script_vimeo:\n"+
		     "Unable to extract time stamp. Giving up.",1);

	    return null;
	}

	if (!signature)
	{
	    this.log("LinternaMagica.extract_object_from_script_vimeo:\n"+
		     "Unable to extract signature. Giving up.",1);

	    return null;
	}
	
	var codecs = this.extract_codec_and_quality_vimeo();

	var args  = new Object();
	args.object_data = object_data;
	args.codecs = codecs;
	args.time_stamp = time_stamp;
	args.signature = signature;
		
	var hd_links = this.create_links_vimeo(args);
	object_data.hd_links = hd_links;

	object_data.link = hd_links ? hd_links[hd_links.length-1].url : null;
	
	if (!object_data.link)
	{
	    return null;
	}


	this.log("LinternaMagica.extract_object_from_script_vimeo:\n"+
		 "Object data extracted from script ",1);

	object_data.linterna_magica_id =
	    this.mark_flash_object("extracted-from-script");

	return object_data;
    }

    return null;
}
 
LinternaMagica.prototype.sites["vimeo.com"].css_fixes = function(object_data)
{
    // The thumbnail image overlaps the toggle plugin button after our
    // changes. This way our button is visible.
    if (object_data.parent.firstChild &&
	/HTMLDiv/i.test(object_data.parent.firstChild))
    {
	// The first child should be a div with thumbnail as
	// background. Reduce it's size so it will not overlap our
	// button. A size of 0 px does not hide the linterna magica
	// header object, but moves the flash object down.  A size of
	// object_data.height px does not hide the header, but does
	// not move the flash object. The only option left is to
	// remove the element. This fixes the toggle_plugin
	// displacement, if the height of the element is changed.
	object_data.parent.removeChild(object_data.parent.firstChild);

	var flash_object = 
	    this.get_flash_video_object(object_data.linterna_magica_id, 
					object_data.parent);

	if (flash_object)
	{
	    flash_object.style.setProperty("position", 
					   "relative", "important");
	}
    }

    // Show HD links list. 
    object_data.parent.style.
	setProperty("overflow", "visible", "important");

    object_data.parent.parentNode.style.
	setProperty("overflow", "visible", "important");

    object_data.parent.parentNode.style.
	setProperty("background-color", "transparent", "important");

    object_data.parent.parentNode.style.
	setProperty("background-image", "none", "important");

    // No idea what this fixes.
    var object_tag = 
	document.getElementById("linterna-magica-video-object-"+
				object_data.linterna_magica_id);

    if (object_tag)
    {
	object_tag.style.setProperty("position","relative","important");
    }

    // Fixes the height of the third parent element.  Fixes
    // replacement object visibility.
    var third_parent = object_data.parent.parentNode.parentNode;

    if (third_parent)
    {
	third_parent.style.setProperty("overflow", "visible",
				       "important");
	third_parent.style.setProperty("height", 
				       (parseInt(object_data.height)+26+
					// borders 1px x 2
					2+
					(this.controls ? 24 : 0)  )+40+"px",
				       "important");
	third_parent.style.
	    setProperty("background-color", "transparent", "important");
    }

    // Fixes the height of the fourth parent. Fixes replacement object
    // visibility.
    var fourth_parent = object_data.parent.parentNode.
	parentNode.parentNode;

    if (fourth_parent)
    {
	fourth_parent.style.setProperty("overflow", "visible",
					"important");
	fourth_parent.style.setProperty("height", 
					(parseInt(object_data.height)+26+
					 // borders 1px x 2
					 2+
					 (this.controls ? 24 : 0)  )+40+"px",
					"important");
    }

   
    // The CSS rules hide parts of our elements
    object_data.parent.parentNode.style.
	setProperty("height", (parseInt(object_data.height)+26+
		     // borders 1px x 2
		     2+
		     (this.controls ? 24 : 0)  )+"px", "important");

    object_data.parent.parentNode.style.
	setProperty("width", (parseInt(object_data.width+2))+"px",
		    "important");

    var site_html5_player = 
	this.find_site_html5_player_wrapper(object_data.parent);

    if (site_html5_player)
    {
	// The HTML5 player's thumbnail image has black lines on top and
	// back after adding LM. Clear them
	site_html5_player.style.setProperty("height", "87%", "important");

	// The LM switch button is too close to the thumbnail of the HTML5 player.
	site_html5_player.style.setProperty("margin-bottom", 
					    "5px", "important");
    }

    // The previousSibling of the Linterna Magica div is a mysterious
    // div (stays white) with class="s bu" that has height set to
    // 100%. This displaces LM. This div should hold the SWF object,
    // but it is missing.

    var lm = document.getElementById("linterna-magica-"+
     				     object_data.linterna_magica_id);
 
    if (lm)
    {
    	var div_sbu = lm.previousSibling;
    	if (/HTMLDiv/i.test(div_sbu) && 
	    div_sbu.hasAttribute("class") && 
	    /s bu/i.test(div_sbu.getAttribute("class")) &&
	    !site_html5_player)
    	{
    	    div_sbu.parentNode.removeChild(div_sbu);
    	}
    } 

    // A div left by the website player is taking the space for LM
    // Usually a waring about missing flash or no supported video
    // format in the browser.
    if (lm)
    {
    	var div = lm.previousSibling;
    	if (/HTMLDiv/i.test(div))
    	{
    	    div.parentNode.removeChild(div);
    	}
    } 


    // Fix video galerry displacement on first page when LM volume
    // slider is showing.

    var gallery = document.getElementById("videos_gallery");
    if (gallery)
    {
	gallery.style.setProperty("margin-top", "90px", "important");
    }

    // Fix the loading on the front page
    this.vimeo_fix_navigation();
   
    
    return false;
}

// Sometimes IceCat renders two Linterna Magica
// players. The following tries to prevent it.
LinternaMagica.prototype.sites["vimeo.com"].
    process_duplicate_object_before_xhr =
function(object_data)
{
    this.log("LinternaMagica.sites.process_duplicate_object_before_xhr:\n"+
             "Removing/hiding duplicate object ",1);

    this.hide_flash_video_object(object_data.linterna_magica_id,
                                 object_data.parent);

    return false;
}

LinternaMagica.prototype.sites["vimeo.com"].
    skip_video_id_extraction = function()
{
    return null;
}


LinternaMagica.prototype.vimeo_fix_navigation = function()
{
    var vimeo_fix_list = function (list_id) 
    {
	var list = document.getElementById(list_id);

	if (!list)
	{
	    return false;
	}

	var vimeo_list_click_fn = function(ev)
	{
	    window.location = this.getAttribute("href");
	}

	var li_elements = list.getElementsByTagName('li');
	for (var i=0, l=li_elements.length; i<l; i++)
	{
	    var li = li_elements[i];
	    var a = li.getElementsByTagName("a");

	    if (a && a[0]) {
		a[0].addEventListener("click", vimeo_list_click_fn, true);
	    }
	}

	return true;
    }

    if (window.location.pathname == '/')
    {
	vimeo_fix_list('featured_videos');
	var featured_ = document.getElementById("featured_videos");
	if (featured_videos)
	{
	    featured_videos.addEventListener("DOMNodeInserted",
				    function(e)
				    {
					var timeout = function()
					{
					    vimeo_fix_list('featured_videos');
					}
					// Three attempts. Should
					// catch it.
					setTimeout(timeout, 500);
					setTimeout(timeout, 1200);
					setTimeout(timeout, 5000);
				    }, false);
	}

    }
    else
    {
	// Holds the navigation on clip pages
	var brozar = document.getElementById("brozar");
	if (brozar)
	{
	    brozar.addEventListener("DOMNodeInserted", 
				    function(e)
				    {
					var timeout = function()
					{
					    vimeo_fix_list('clips');
					}
					// Three attempts. Should
					// catch it. setInterval is
					// causing the brouser to
					// segfault. Probably the
					// clearInterval is not
					// clearing the timers (lack
					// of scope variables);
					setTimeout(timeout, 500);
					setTimeout(timeout, 1200);
					setTimeout(timeout, 5000);
				    }, false);
	}
    }
}
