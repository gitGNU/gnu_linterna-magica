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
// @source http://e-valkov.org/linterna-magica

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
	if (/youtube\.com/i.test(window.location.hostname) ||
	    /youtube-nocookie\.com/i.test(window.location.hostname))
	{
	    this.log("LinternaMagica.request_video_link:\n"+
		     "Removing/hiding duplicate object ",1);

	    this.hide_flash_video_object(object_data.linterna_magica_id,
					 object_data.parent);
	}

	return null;
    }

    if (/vbox7\.com/i.test(host))
    {
	address ="/play/magare.do";
	method = "POST";
	data = "vid="+video_id;
	content= "application/x-www-form-urlencoded";
    }

    if (/vimeo\.com/i.test(host))
    {
	address = "/moogaloop/load/clip:"+video_id;

	// Remove cookies and fetch page again. See "A note on
	// cookies".
	// this.extract_cookies();
	// this.expire_cookies();
    }

    if (/4videosharing\.com/i.test(host))
    {
	address = "/player/vConfig.php?vkey="+video_id;
    }

    // We should not be entering here anyway. It seems most objects
    // have the mediaURL variable)
    // if (/metacafe\.com/i.test(host))
    // {
    // 	address = "/fplayer.php?itemID="+video_id+"&t=embedded";
    // }

    if (/vbox\.bg/i.test(host))
    {
	address = "/extras/player/play.php?id="+video_id;
    }

    if (/boozho\.com/i.test(host))
    {
	address = "/player_playlist.php?v="+video_id;
    }

    // We have two options:
    // 1) Use address http://embed.vidoemo.com/player/vidoemo4.php?id=
    // and extract the flv link, then change &f= parameter fo HD links
    // 2) Use address http://www.vidoemo.com/videodownload.php?e=
    // and extract all links and use the FLV (if match as main link)
    // Links differ in key and path (v3.php -dw  /v7.php -play)
    if (/vidoemo\.com/i.test(host))
    {
	// Using option 2
	address = "/videodownload.php?e="+video_id;
    }

    if (/youtube\.com/i.test(host) || 
	/youtube-nocookie\.com/i.test(host))
    {
	var uri_args = null;
	// Some clips require &skipcontrinter=1. Other might require
	// something else.
	if (/&/i.test(location_href))
	{
	    uri_args = location_href.split(/&/);
	    // This is the host and path (http://...). We do not need
	    // it.
	    delete uri_args[0];
	    uri_args = uri_args.join("&");
	}

	address = "/watch?v="+video_id +(uri_args ? ("&"+uri_args) : "");

	// Remove cookies and fetch page again. See "A note on
	// cookies".
	this.extract_cookies();
	this.expire_cookies();
    }

    if (/myvideo\.de/i.test(host))
    {
	address = "/watch/"+video_id+"/";
    }

    if (/dailymotion\.com/i.test(host))
    {
	this.extract_cookies();
	this.expire_cookies();
	// Forced this way! See lm_extract_dom_objects.js
	// LinternaMagica.extract_objects_from_dom();
	address = object_data.video_id;
    }

    if (/videoclipsdump\.com/i.test(host))
    {
	address = "/player/cbplayer/settings.php?vid="+video_id;
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

    address = protocol+"//"+host+address;

    client.open(method,address ,true);

    if (content)
	client.setRequestHeader("Content-Type", content);

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
	var xml;
	var hd_links = new Array();

	if (client.responseXML)
	    xml = client.responseXML;

	if (/vbox7\.com/i.test(host))
	    url = client.responseText.split("=")[1].replace("&","");

	if (/vimeo\.com/i.test(host))
	{
	    var rq_sig = xml.getElementsByTagName("request_signature");

	    rq_sig = rq_sig[0].textContent;

	    var rq_exp = xml.getElementsByTagName(
		"request_signature_expires")[0].textContent;
	    var id = xml.getElementsByTagName("video")[0];
	    id= id.getElementsByTagName("nodeId")[0].textContent;

	    url = "http://www.vimeo.com/moogaloop/play/clip:"+
		id+"/"+rq_sig+"/"+rq_exp+"/?q=sd";

	    // Check if there is HD clip
	    var is_hd = xml.getElementsByTagName("isHD");
	    if (is_hd && is_hd[0] && is_hd[0].textContent)
	    {
		try
		{
		    is_hd=parseInt(is_hd[0].textContent);
		}
		catch(e)
		{
		    is_hd=0;
		}
	    }

	    // HD links support only for clips that have it
	    if (is_hd)
	    {
		var hd_link = new Object();

		// Translate?
		hd_link.label = "Low quality";
		hd_link.url = url;
		hd_links.unshift(hd_link);

		hd_link = new Object();
		// Translate?
		hd_link.label = "High quality";
		hd_link.url = url.replace(/q=sd/, "q=hd");
		hd_links.unshift(hd_link);
	    }

	    // Vimeo web server sends the clips as
	    // video/mp4. totemNarrowSpace plugin (plays video/mp4)
	    // sends custom UA. This prevents the video to load. Must
	    // use video/flv, so totemCone plugin could start and send
	    // UA of the browser.  totemNarrowSpace/QuickTime plugin
	    // have other issues as well. Could be forced to
	    // video/flv, but there is a better fix in
	    // create_video_object();
	    mime = "video/mp4";
	}

	if (/4videosharing\.com/i.test(host))
	{
	    var video_tag = xml.getElementsByTagName("video")[0];
	    url = video_tag.getElementsByTagName("src")[0].textContent;
	}

	// We should not be entering here anyway. It seems most
	// objects have the mediaURL variable)
	// if (/metacafe\.com/i.test(host))
	// {
	//     // The Content-type is not correct
	//     xml = (new DOMParser()).
	// 	parseFromString(client.responseText,"application/xml");
	//     var item = xml.getElementsByTagName("item")[0];
	//     url = item.getAttribute("url");
	// }

	if (/vbox\.bg/i.test(host))
	{
	    url = xml.getElementsByTagName("clip")[0].
		getAttribute("url");
	}

	if (/boozho\.com/i.test(host))
	{
	    var rel_url = xml.getElementsByTagName("movie_path")[0].
		textContent;
	    url = "http://www.boozho.com/"+rel_url;
	}

	if (/vidoemo\.com/i.test(host))
	{
	    var links_re = new RegExp(
		"\\\<a.*href=\\\"([^\\\"]+).*\\\>Download\\\s*"+
		    "(.*)\\\s*of\\\s*video",
		"ig");

	    var links;
	    while (links = links_re.exec(client.responseText))
	    {
		var hd_link = new Object();
		hd_link.label = links[2];
		hd_link.url = links[1];
		hd_links.push(hd_link);

		if (/flv/i.test(hd_link.label))
		{
		    url = hd_link.url;
		}
	    }
	}

	if (/youtube\.com/i.test(host) ||
	    /youtube-nocookie\.com/i.test(host))
	{
	    var fmt =
		this.extract_youtube_fmt_parameter(client.responseText);
	    var maps =
		this.extract_youtube_fmt_url_map(client.responseText);

	    hd_links = this.create_youtube_links(fmt, maps);
	    url = hd_links ? hd_links[hd_links.length-1].url : null;
	    // See "A note on cookies"
	    if (/restore/i.test(this.process_cookies))
	    {
		this.restore_cookies();
	    }
	}

	if (/dailymotion\.com/i.test(host))
	{
	    if (!this.plugin_is_installed &&
		!object_data.linterna_magica_id && 
		!object_data.parent)
	    {
		// In Dailymotion the script that creates the flash
		// object replaces itself. The work around here is to
		// request the page and process it. 

		// Dailymotion uses pseudo-random ids for some DOM
		// elements of interest. We replace the body HTML with
		// the one returned by the XHR. Then scripts are
		// processed. The script extraction code matches the
		// correct ID for the parentNode in DOM, that will
		// hold the video object. The original body is
		// restored, because some data is missing in the body
		// data from XHR. After all data is collected, the
		// parentNode (object_data.parent), where the video
		// object will be inserted is replaced with the one in
		// the original body.  Custom function to match the
		// parent by CSS class is used, because getElementById
		// does not support regular expressions.

		var body_data = 
		    client.responseText.split("<body")[1].
		    replace(/>{1}/,"__SPLIT__").
		    split("__SPLIT__")[1];

		var body = document.getElementsByTagName("body")[0];
		var original_body_data = body.innerHTML;

		body.innerHTML = body_data;

		this.script_data = client.responseText;
		object_data = this.extract_object_from_script_swfobject();

		body.innerHTML = original_body_data;

		object_data.parent = 
		    this.get_first_element_by_class("dmpi_video_playerv[0-9]+");

		if (!object_data.parent)
		{
		    return null;
		}
	    }

	    hd_links = this.extract_dailymotion_links(client.responseText);
	    url = hd_links ? hd_links[hd_links.length-1].url : null;

	    // See "A note on cookies"
	    if (/restore/i.test(this.process_cookies))
	    {
		this.restore_cookies();
	    }
	}

	if (/myvideo\.de/i.test(host))
	{
	    try
	    {
		var thumb_url = client.responseText.split(/image_src/)[1];
		thumb_url = thumb_url.split(/\/\>/)[0].split(/\'/)[2];
		url = this.create_myvideode_link(thumb_url);
	    }
	    catch(e)
	    {
		return;
	    }
	}

	if (/videoclipsdump\.com/i.test(host))
	{
	    var path = xml.getElementsByTagName("videoPath")[0];
	    if (path)
	    {
		url = path.getAttribute("value");
	    }
	}

	if (!url)
	{
	    return;
	}

	object_data.link = url;
	object_data.mime = mime;
	object_data.hd_links = hd_links.length ? hd_links : null;

	// FIXME HTML5 in WebKit switch like for flash plugin ?
	// In the next release 0.0.10 ?!
	if (!/youtube\.com/i.test(window.location.host) &&
	    !/youtube-nocookie\.com/i.test(window.location.host) &&
	    !/vimeo\.com/i.test(window.location.host) ||
	    ((/youtube\.com/i.test(window.location.host) ||
	      /youtube-nocookie\.com/i.test(window.location.host) ||
	      /vimeo\.com/i.test(window.location.host)) &&
	     this.plugin_is_installed))
	{
	    this.log("LinternaMagica.request_video_link_parse_response:\n"+
		     "Removing plugin install warning.",2);
	    this.remove_plugin_install_warning(object_data.parent);
	    this.log("LinternaMagica.request_video_link_parse response:\n"+
		     "Creating video object with url: "+url,1);
	    this.create_video_object(object_data)
	}
	else if ((/youtube\.com/i.test(window.location.host) ||
		  /youtube-nocookie\.com/i.test(window.location.host))  &&
		 ! this.plugin_is_installed)
	{
	    if (!this.youtube_flash_upgrade_timeout)
	    {
		this.youtube_flash_upgrade_counter = 0;
		var data = object_data;
		var self = this;
		this.youtube_flash_upgrade_timeout =
		    setInterval(function() {
			self.detect_youtube_flash_upgrade.
			    apply(self,[data]);
		    }, 500);
	    }
	}
	else if (/vimeo\.com/i.test(window.location.host) &&
		 ! this.plugin_is_installed)
	{
	    if (!this.vimeo_browser_upgrade_timeout)
	    {
		this.vimeo_browser_upgrade_counter = 0;
		var data = object_data;
		var self = this;
		this.vimeo_browser_upgrade_timeout =
		    setInterval(function() {
			self.detect_vimeo_browser_upgrade.
			    apply(self,[data]);
		    }, 500);
	    }
	}
    }
}
