//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
//  Copyright (C) 2013, 2014 Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Extract youtube fmt parameter
LinternaMagica.prototype.extract_youtube_fmt_parameter = function()
{
    var data = this.script_data;
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
	    var more_info = "";
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
	    case '82':
	    case '83':
	    case '84':
	    case '85':
		label += "MP4";
		break;
	    case '43':
	    case '44':
	    case '45':
	    case '46':
	    case '100':
	    case '101':
	    case '102':
		label += " WebM";
		break;
	    case '13':
	    case '17':
	    case '36':
		label += " 3GP";
		break;
	    default:
		label += this._("Unkown container");
	    }

	    switch (fmt_id)
	    {
	    case '82':
	    case '83':
	    case '84':
	    case '85':
	    case '100':
	    case '101':
	    case '102':
		label += " 3D";
		break;
	    default:
		"";
	    }

	    // Set video and audio encodings
	    switch (fmt_id)
	    {
	    case '5':
		more_info += "Sorenson H.263, MP3";
		break;
	    case '18':
	    case '22':
	    case '34':
	    case '35':
	    case '37':
	    case '38':
	    case '82':
	    case '83':
	    case '84':
	    case '85':
		more_info += "MPEG-4 AVC (H.264), AAC";
		break;
	    case '43':
	    case '44':
	    case '45':
	    case '46':
	    case '100':
	    case '101':
	    case '102':
		more_info += "VP8, Vorbis";
		break;
	    case '13':
	    case '17':
	    case '36':
		more_info += "MPEG-4 Visual, AAC";
		break;
	    default:
		more_info += " " + this._("Unkown encoding");
	    }

	    link.label  = link_data[1].split(/x/)[1] + "p " +label;
	    link.more_info = link_data[1] + " " +label+ " " + more_info;
	    if (!fmt_url_map[fmt_id])
	    {
		this.log("LinternaMagica.create_youtube_links:\n"+
			 "Missing URL for fmt_id "+fmt_id+
			 " in array map fmt_url_map",5);
		continue;
	    }

	    link.url = fmt_url_map[fmt_id];

	    if (/https:/i.test(window.location.protocol) &&
		/http:/i.test(link.url))
	    {
		link.url = link.url.replace("http:", "https:");
		this.mixed_content = true;
	    }


	    this.log("LinternaMagica.create_youtube_links:\n"+
		     "Extracted link  : "+link.url,4);

	   links.push(link);
	}

	return links;
    }

    return null;
}

// Extract links data for youtube from fmt_url_map
LinternaMagica.prototype.extract_youtube_fmt_url_map = function()
{
    var data = this.script_data;
    var fmt_re = new RegExp (
	"(\\\"|\\\'|\\\&|\\\&amp;)url_encoded_fmt_stream_map"+
	    "(\\\"|\\\')*(\\\=|\\\:|,)\\\s*(\\\"|\\\')*"+
	    "([a-zA-Z0-9\\\-\\\_\\\%\\\=\\\/,\\\\\.\|:=&%\?\+]+)");

    var fmt = data.match(fmt_re);

    if (fmt)
    {
	// For debug level 1
	this.log("LinternaMagica.extract_youtube_fmt_url_map:\n"+
		 "Extracted fmt_url_map.",1);

	this.log("LinternaMagica.extract_youtube_fmt_url_map:\n"+
		 "RAW map variable:"+fmt,5);

	// Hash with keys fmt_ids and values video URLs
	var map = new Object();

	fmt = fmt[fmt.length-1].replace(/\\\//g, "/");
	fmt = fmt.split(/,/);

	var links = 0;

	for (var url=0; url<fmt.length; url++) 
	{
	    // Usually the links have the following pattern
	    // (itag=fmt_id)*url=URL&type=video/...&(itag=fmt_id)*
	    var link = fmt[url].match(/(url|conn)=([^&]+)/);
	    var fmt_id = fmt[url].match(/itag=([0-9]+)/);
	    var sig = fmt[url].replace(/\\u0026/g, '&').match(/sig=[^&]+/);
	    sig = sig ? sig[sig.length-1].replace(/sig/,'signature') : '';

	    // Bug 39402. Some links have the signature in the s=<SIG>
	    // format. For example when they are oppened from Canada
	    if (!sig)
	    {
		this.sites["youtube.com"].encrypted_signature = 1;
		sig = "";
	    }
	    
	    if (fmt_id && link)
	    {
		links++;
		link = unescape(link[link.length-1]);
		// Live streams support. 
		// See bugs #36759:
		// https://savannah.nongnu.org/bugs/?36759
		link = link.replace(/\\u0026stream=/, '/');
		link = link.split(/\\u0026/)[0];

		map[fmt_id[fmt_id.length-1]] =  link+"&"+sig;
	    }
	}

	return links ? map: null;
    }
    else
    {
	this.log("LinternaMagica.extract_youtube_fmt_url_map:\n"+
		 "No fmt_url_map parameter found. ",1);
    }

    return null;
}

LinternaMagica.prototype.sites["youtube.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.youtube.com"] = "youtube.com";
LinternaMagica.prototype.sites["www.youtube-nocookie.com"] = "youtube.com";
LinternaMagica.prototype.sites["youtube-nocookie.com"] = "youtube.com";

// Referenced by Vimeo, Xhamster
LinternaMagica.prototype.sites["youtube.com"].flash_plugin_installed =
function()
{
    // We must examine scripts because searching for links in DOM
    // objects in YouTube bloats GNU IceCat. The other option is to
    // use the matched video_id and XHR the page again from where to
    // get the links. That is not acceptable. No need to duplicate the
    // code in __no_flash_plugin_installed().
    return this.sites.__no_flash_plugin_installed.apply(this, [arguments]);
}

LinternaMagica.prototype.sites["youtube.com"].skip_script_processing =
function()
{
    // See bug #108013:
    // https://savannah.nongnu.org/support/index.php?108013
    // Do not skip script processing in youtube. The default function
    // might skip scripts in some browsers.
    return true;
}

LinternaMagica.prototype.sites["youtube.com"].skip_link_extraction = function()
{
    // Link extraction bloats FF in youtube:
    // LinternaMagica.extract_link_from_param_list: 
    // Trying to extract a link from param/attribute "flashvars"
    // at www.youtube.com time: ***14:58:59:999***
    // LinternaMagica.extract_link: No link found. at
    // www.youtube.com time: ***15:12:21:356***
    this.log("LinternaMagica.sites.skip_link_extraction:\n"+
	     "Skipping link extraction in YouTube. Might bloat "+
	     "GNU IceCat and other forks and versions of Firefox.",4);
    return false;
}

LinternaMagica.prototype.sites["youtube.com"].skip_video_id_extraction = function()
{
    this.log("LinternaMagica.sites.skip_video_id_extraction:\n"+
	     "Skipping video_id extraction in YouTube.",4);
    return false;
}


// Extracts data for the flash object in youtube from a script
LinternaMagica.prototype.sites["youtube.com"].extract_object_from_script =
function()
{
    // Check for unavailable clips in playlists and switch to the next
    // clip.  YT is using some strange loading technique that looks
    // like AJAX/XMLHttpRequest, which breaks LM loading. Leaving this
    // task to YT is not an option.

    var unavailable = document.getElementById("player-unavailable");
    if (unavailable &&
	(!this.object_has_css_class(unavailable, "hid") ||
	 getComputedStyle(unavailable).getPropertyValue("display") != "none"))
    {
	var object_data = new Object();
	object_data.linterna_magica_id = null;
	this.sites["youtube.com"].css_fixes.apply(this, [object_data]);
	this.sites["youtube.com"].player_stream_ended_action.apply(this,[]);
	return;
    }

    var data = this.script_data;
    if (!data.match(/ytplayer\.config =/))
    {
 	return null;
    }

    var height = data.match(/\"height\"\:\s*\"([0-9]+)\"/);
    var width = data.match(/\"width\"\:\s*\"([0-9]+)\"/);

    this.extract_video_id_data = data;

    var fmt = this.extract_youtube_fmt_parameter();
    var maps = this.extract_youtube_fmt_url_map();

    var hd_links = this.create_youtube_links(fmt, maps);
    var link = (hd_links && hd_links.length) ? hd_links : null;

    var player_id = data.match(/\"id\"\:\s*\"([a-zA-Z0-9_\-]+)\"/);

    // We do not have any links! Give up.
    if (!link)
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

    if (player_id)
    {
	player_id = player_id[player_id.length-1];
    }
    else
    {
	player_id = "movie_player";
    }

    var player = document.getElementById(player_id);
    var player_api = document.getElementById("player-api");

    if (!width || !height)
    {
	height = player ? player.clientHeight : null;
	width  = player ? player.clientWidth : null;
    }

    if (!width || !height)
    {
	height = ( player && player.parentNode ) ?
	    player.parentNode.clientHeight : null;
	width  = ( player && player.parentNode ) ?
	    player.parentNode.parentNode.clientWidth : null;
    }

    if (!width || !height)
    {
	var cs = window.getComputedStyle(player_api);
	width = parseInt(cs.getPropertyValue("width"));
	height = parseInt(cs.getPropertyValue("height"));
    }

    if (!width || !height)
    {
	this.log("LinternaMagica.extract_object_from_script_youtube:\n"+
		 "Missing object data "+
		 "\n H: "+height+
		 "\n W: "+width, 3);

	return null;
    }

    this.log("LinternaMagica.extract_object_from_script_youtube:\n"+
	     " H: "+height+
	     "\n W:"+width+
	     "\n player/swf "+player_id,2);


    var object_data = new Object();

    object_data.width= width;
    object_data.height= height;
    object_data.link = hd_links ? hd_links[hd_links.length-1].url : null;
    object_data.hd_links = link;
    object_data.parent = player_api.parentNode;
    object_data.site_player = player_api;

    if (this.is_swf_object(player))
    {
	this.priority = true;
	object_data.linterna_magica_id =
	    this.mark_flash_object(player);
    }
    else
    {
	object_data.linterna_magica_id =
	    this.mark_flash_object("extracted-from-script");
    }

    return object_data;
}

LinternaMagica.prototype.sites["youtube.com"].
stop_if_one_extracted_object_from_script =
function()
{
    this.log("LinternaMagica.sites.stop_if_"+
	     "one_extracted_object_from_script:\n"+
 	     "Found one object in YouTube. Stopping script processing",3);
    return false;
}

LinternaMagica.prototype.sites["youtube.com"].
replace_extracted_object_from_script =
function(object_data)
{
    this.create_video_object(object_data);
    return false;
}

LinternaMagica.prototype.sites["youtube.com"].player_stream_ended_action =
function()
{
    var playlist = document.getElementById("watch7-playlist-tray");
    var autoplay = document.getElementById("watch7-playlist-bar-autoplay-button");
    var current_song =
	this.get_first_element_by_class("playlist-bar-item-playing", playlist);

    var shuffle = document.getElementById("watch7-playlist-bar-shuffle-button");

    var next_song = null;

    if (!playlist || !autoplay || !current_song ||
	!this.object_has_css_class(autoplay, "yt-uix-button-toggled"))
    {
	return;
    }

    if (shuffle && 
	this.object_has_css_class(shuffle, "yt-uix-button-toggled"))
    {
	var songs = playlist.getElementsByTagName("a");
	var rand = Math.floor(Math.random() * songs.length);
	next_song = songs[rand].getAttribute("href");
    }
    else 
    {
	if (/text/i.test(current_song.nextSibling))
	{
	    next_song = current_song.nextSibling.nextSibling;
	}
	else
	{
	    next_song = current_song.nextSibling;
	}

	next_song = 
	    next_song.getElementsByTagName("a")[0].
	    getAttribute("href");
    }

    window.location.href = next_song;

    return true;
}

LinternaMagica.prototype.sites["youtube.com"].css_fixes =
function(object_data)
{
    var id = object_data.linterna_magica_id;
    var toggle_plugin = document.getElementById("linterna-magica-toggle-plugin-"+id);
    if (toggle_plugin)
    {
	toggle_plugin = toggle_plugin.parentNode.parentNode;
	toggle_plugin.style.setProperty("width", object_data.width+"px", "important");
    }

    var playlist = document.getElementById("watch7-playlist-tray-container");
    if (playlist)
    {
	var lm = document.getElementById("linterna-magica-"+id);
	if (lm)
	{
	    lm.style.setProperty("float", "left", "important");
	}
    }


    var player_api  = document.getElementById("player-api");
    if (this.priority)
    {
	if (player_api && player_api.style)
	{
	    player_api.style.setProperty("display", "none", "important");
	}
    }

    // Fix history navigation (HTML5) for LM
    window.addEventListener("popstate", function() {
	setTimeout(function() { window.location.reload(); }, 50);
    }, true);

    // Prevent next clip loading with AJAX on HTML5 player stream end.
    if (!this.priority)
    {
	var video_el = player_api.getElementsByTagName("video");
	if (video_el && video_el[0])
	{
	    var self = this;
	    video_el[0].addEventListener("ended", function(){
		self.sites["youtube.com"].player_stream_ended_action.apply(self,[]);
	    }, true);
	}
    }

    // Override YT playlist links and related clips click
    // event. Ensure LM will load when a new video is selected.
    var links = document.querySelectorAll("#watch7-playlist-tray > li > a,"+
					  " #watch-related > li >a, "+
					  " #watch7-playlist-bar-next-button, "+
					  " #watch7-playlist-bar-prev-button");

    // Disabled for testing
    // links = null;
    if (links && links.length > 0)
    {
	var clip_click_fn = function(ev)
	{
	    var url = this.href;

	    if (!url)
	    {
		var a = this.getElementsByTagName('a')[0];
		url = a.getAttribute('href');
	    }

	    if (!url)
	    {
		return;
	    }

	    setTimeout(function()
		       {
			   window.location.href = url;
		       },50);
	};

	for (var i=0,l=links.length; i<l;i++)
	{
	    var t = links[i];
	    t.addEventListener('click',clip_click_fn,false);
	    t.parentNode.addEventListener('click',clip_click_fn,false);
	}
    }

    if (document.getElementById("playnav-playview"))
    {
	// In channels/user pages in YouTube the web controlls are
	// overlapped by few elements.

	var el = 	document.getElementById("playnav-playview");
	el.style.setProperty("margin-top", "50px", "important");

	var user_nav = document.getElementById("user_playlist_navigator");

	if (user_nav)
	{
	    user_nav.style.setProperty("overflow", "visible", "important");
	    var height = document.defaultView.getComputedStyle(user_nav).
		getPropertyValue("height");

	    user_nav.style.setProperty("height",
				       (parseInt(height)+50)+"px",
				       "important");
	}

	var playnav_body = document.getElementById("playnav-body");

	if (playnav_body)
	{
	    playnav_body.style.setProperty("overflow",
					   "visible", "important");

	    // A top border of 1px fixes the top displacement. Why?!
	    var color = document.defaultView.getComputedStyle(user_nav).
		getPropertyValue("background-color");

	    color = color ? color : "#999999";

	    playnav_body.style.setProperty("border-top",
	     				   "1px solid "+color,  "important");
	}

	var playnav_play_content =
	    document.getElementById("playnav-play-content");

	if (playnav_play_content)
	{
	    var height = document.defaultView.
		getComputedStyle(playnav_play_content).
		getPropertyValue("height");

	    playnav_play_content.style.
		setProperty("height",
			    (parseInt(height)+50)+"px",
			    "important");
	}
    }

    // Bug #33504 https://savannah.nongnu.org/bugs/?33504
    if (object_data.parent)
    {
	object_data.parent.style.setProperty("overflow", "visible", "important");
    }

    // When YouTube's HTML5 player detects that the browser does not
    // have support for any clip, a warning div is displayed. It must
    // be hidden or it displaces Linterna Magica.

    // The <video/> element is missing because of the
    // error. this.find_site_html5_wrapper() will not
    // work. Implementing custom_html5_player_finder() is not so good
    // idea.
    var html5_wrapper = document.getElementById("movie_player-html5");

    if (html5_wrapper)
    {
	var html5_warning = html5_wrapper.querySelector(".video-fallback");

	// The clips that are displayed as unavailable have different
	// class. Sometimes?
	//
	// Fixes bug #35992 https://savannah.nongnu.org/bugs/?35992
	if (!html5_warning)
	{
	    html5_warning =
		html5_wrapper.querySelector(".html5-video-fallback");
	}

	if (html5_warning &&
	    !/none/i.test(html5_warning.style.getPropertyValue('display')))
	{
	    // Must hide the entire HTML5 wrapper, so Linterna Magica
	    // will not be displaced.
	    html5_wrapper.style.setProperty('display', "none", "important");

    
	    // Hide site controls and video container. Should not
	    // overlap with Linterna Magica now. Fixes the overlapping
	    // of HTML5 player and LM.
	    var controls = html5_wrapper.querySelector(".html5-video-controls");
	    var container = html5_wrapper.querySelector(".html5-video-container");

	    if (controls)
	    {
		controls.style.setProperty("display", "none", "important");
	    }

	    if (container)
	    {
		container.style.setProperty("display", "none", "important");
	    }

	}
    }

    var movie_player = document.getElementById("movie_player");
    if (movie_player)
    {
	movie_player.style.setProperty("height",
				       parseInt(object_data.outer_height)+2+
				       "px", "important");
    }

    // Without this the toggle plugin stays hidden below the title of
    // the clip
    var watch7 = document.getElementById('watch7-player');
    if (watch7)
    {
	watch7.style.setProperty("height", 
				 (parseInt(object_data.outer_height)+
				  24)+"px", "important");
    }


    var watch7_container = document.getElementById("watch7-container");
    if (watch7_container)
    {
	watch7_container.style.setProperty("margin-top", "38px", "important");
    }

    return false;
}

