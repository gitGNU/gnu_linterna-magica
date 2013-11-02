//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011 Ivaylo Valkov <ivaylo@e-valkov.org>
//  Copyright (C) 2012, 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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

 
LinternaMagica.prototype.extract_links_vimeo = function()
{
    var data = this.script_data;

    if (!data)
    {
	return null;
    }

    var files_re =  new RegExp(
	"(\\\"|\\\')*files(\\\"|\\\')*:(\\\"|\\\')*(.*)(\\\'|\\\")hls",
	"im");

    var files = data.match(files_re);

    if (!files && !files[files.length-2])
    {
	return null;
    }

    this.log("LinternaMagica.prototype.extract_links_vimeo:\n"+
	     "Result from files_re: "+files[files.length-2],5);

    urls_data_re = new RegExp(
	"(\\\"|\\\')*(mobile|hd|sd)(\\\'|\\\")*[^\\\}]+url(\\\'|\\\")*:(\\\'|\\\")*([^\\\'\\\",\\\}]+)",
    "img");

    var links = new Array();

    while(urls_data = urls_data_re.exec(files[files.length-2]))
    {
	if (urls_data && urls_data[urls_data.length-1] &&
	    urls_data[urls_data.length-5])
	{
	    var link = new Object();
	    var quality = urls_data[urls_data.length-5];
	    link.url = urls_data[urls_data.length-1];

	    // Mobile 480x
	    // SD 640x
	    // HD 1280x

	    var res = "";

	    if (quality == "mobile")
	    {
		res = "480p";
	    }
	    else if (quality ==  "sd")
	    {
		res = "640p";
	    }
	    else if (quality == "hd")
	    {
		res = "1280p";
	    }
	    else
	    {
		res = "Unknown";
	    }

	    link.label = res + " H.264";
	    link.more_info = res+ " H.264 "+quality.toUpperCase();

	    link.video_width = res;

	    links.push(link);

	    this.log("LinternaMagica.extract_links_vimeo:\n"+
		     "Extracted link "+link.url,5);
	}
    }


    // Sort the array by video width, so the links show properly in
    // the HD links list with the highest quality at the top.
    var sort_fun = function (a, b)
    {
	if (parseInt(a.video_width) > parseInt(b.video_width))
	{
	    return -1;
	}
	else if (parseInt(a.video_width) < parseInt(b.video_width))
	{
	    return 1;
	}
	else
	{
	    return 0;
	}
    }

    links.sort(sort_fun);

    return (links && links.length >=0) ? links : null;
}


LinternaMagica.prototype.sites["vimeo.com"] = new Object();

// Reference 
LinternaMagica.prototype.sites["www.vimeo.com"] = "vimeo.com";


LinternaMagica.prototype.sites["vimeo.com"].flash_plugin_installed = function()
{
    return this.sites["vimeo.com"].
        no_flash_plugin_installed.apply(this,[arguments]);
}

LinternaMagica.prototype.sites["vimeo.com"].no_flash_plugin_installed = function()
{
    var player_class = document.querySelectorAll('.player');

    if (!player_class) {
	return null;
    }

    var el = null;

    for (var i=0,l=player_class.length;i<l;i++)
    {
	el = player_class[i];
	if (el.hasAttribute('id') &&
	    /player[0-9a-zA-Z_]+/i.test(el.getAttribute('id')))
	    {
		break;
	    }
    }

    if (!el)
    {
	return null;
    }

    var video_id = null;
    var video_id_re = /video\/([^\/]+)/;
    if (el.hasAttribute('data-fallback-url'))
    {
	video_id = el.getAttribute('data-fallback-url').match(video_id_re);
    }

    if (!video_id)
    {
	var noscript = el.getElementsByTagName('noscript');

	if (noscript)
	{
	    video_id = noscript[0].textContent.match(video_id_re);
	}
    }

    if (!video_id || !video_id[video_id.length-1])
    {
	return null;
    }

    video_id = video_id[video_id.length-1];

    var width = el.clientWidth || el.offsetWidth || 
	el.parentNode.clientWidth || el.parentNode.offsetWidth;

    var height = el.clientHeight || el.offsetHeight || 
	el.parentNode.clientHeight || el.parentNode.offsetHeight;

    var object_data = null;
    
    if (video_id && width && height)
    {
	object_data = new Object();

	object_data.width = width;
	object_data.height = height;
	object_data.video_id = video_id;
	object_data.parent = el.parentNode;
	object_data.mime = "video/mp4";

	// Clear the site player
	el.parentNode.removeChild(el);
    }

    if (this.wait_xhr)
    {
	this.log("LinternaMagica.sites.vimeo.com:\n"+
		 "Waiting "+this.wait_xhr+
		 " ms ("+(this.wait_xhr/1000)+
		 " s) before requesting video link via"+
		 " video_id "+data.video_id+" ",1);

	var self = this;
	setTimeout(function() {
	    self.request_video_link.apply(self,[object_data]);
	}, this.wait_xhr);
    }
    else
    {
	this.request_video_link(object_data);
    }
}


LinternaMagica.prototype.sites["vimeo.com"].prepare_xhr = function(object_data)
{
    object_data.address = window.location.protocol+"//"+
	"player.vimeo.com/v2/video/"+object_data.video_id+"/config";

    return object_data;
}

LinternaMagica.prototype.sites["vimeo.com"].process_xhr_response =
function(args)
{
    var client = args.client;
    var object_data = args.object_data;

    this.script_data = client.responseText;

    var hd_links = this.extract_links_vimeo();

    object_data.hd_links = hd_links;

    object_data.link = hd_links ? hd_links[hd_links.length-1].url : null;

    if (!object_data.link)
    {
	return null;
    }

    return object_data;
}

LinternaMagica.prototype.sites["vimeo.com"].skip_script_processing = function()
{
    return false;
}

LinternaMagica.prototype.sites["vimeo.com"].skip_link_extraction = function()
{
    return false;
}

LinternaMagica.prototype.sites["vimeo.com"].css_fixes = function(object_data)
{

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
