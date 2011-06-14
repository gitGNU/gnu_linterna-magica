//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011  Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Find if object is remotely embedded in a site and return the link
// to the video.
LinternaMagica.prototype.detect_object_in_remote_site = function()
{
    var data = this.detect_remotely_embeded;
    var url = null;

    for (var s=0; s<this.remote_sites.length; s++)
    {
	var site = this.remote_sites[s];
	var site_re = new RegExp (site.site_name_regex,"i");
	var video_id_re = new RegExp (site.video_id_regex,"i");
	var video_id = null;

	if (window.location.hostname.match(site_re))
	{
	    this.log("LinternaMagica.detect_object_in_remote_site:\n"+
		     "Seems object is located at it's original site."+
		     " Skipping remote site detection."+site_re, 2);
	    break;
	}

	this.log("LinternaMagica.detect_object_in_remote_site:\n"+
		 "Checking if object matches "+site_re, 5);

	if (data.match(site_re))
	{
	    this.log("LinternaMagica.detect_object_in_remote_site:\n"+
		     "Object matches "+site_re, 3);
	    video_id = data.match(video_id_re);
	}
	else
	{
	    continue;
	}
	
	if (video_id)
	{
	    var pos = video_id.length-1;

	    // Zero can be an option
	    if (site.video_id_position != null)
	    {
		pos = site.video_id_position;
	    }
	    video_id = video_id[pos];
	    video_id = video_id.split("&")[0].split("?")[0];

	    url = site.url_template.replace(/<video_id>/ig,video_id);

	    this.log("LinternaMagica.detect_object_in_remote_site:\n"+
		     "Extracted remote link to video clip for object "+url, 1);

	    break;
	}
    }

    return url;
}

// An array holding all sites for which remote objects can be detected
LinternaMagica.prototype.remote_sites = new Array();

//  Adds a site to the array.

//  * site_name_regex - regular expression that matches the site
//  (youtube\.com, dailymotion\.com etc). Will be passed to RegExp
//  * video_id_regex - regular expression that will match end extract
//    the video_id. Will be passed to RegExp
//  * video_id_position - the () block number where thevideo_id will
//    be captured in the video_id_regexp. null for last.
//  * url_template - the url template to recreate the video link. Use
//  <video_id> where the video_id should be added.
LinternaMagica.prototype.remote_sites.add_site =
function (site_name_regex, video_id_regex, url_template, video_id_position)
{
    var site = new Object();

    // Zero is an option
    if (video_id_position == undefined)
    {
	video_id_position = null;
    }

    site.site_name_regex = site_name_regex;
    site.video_id_regex = video_id_regex;
    site.video_id_position = video_id_position;
    site.url_template = url_template;
   
    this.push(site);
}

LinternaMagica.prototype.remote_sites.add_site(
    "vbox7\\\.com","ext\\\.swf\\\?vid=(.*)", 
    "http://vbox7.com/play:<video_id>");

LinternaMagica.prototype.remote_sites.add_site(
    "youtube\\\.com|youtube-nocookie\\\.com",
     "(v|embed)\\\/(.*)\\\&*",
    "http://youtube.com/watch?v=<video_id>");

LinternaMagica.prototype.remote_sites.add_site(
    "dailymotion\\\.com",
    "swf(\\\/video)*\\\/(.*)\\\?*",
    "http://dailymotion.com/video/<video_id>");

LinternaMagica.prototype.remote_sites.add_site(
    "vimeo\\\.com",
    "(moogaloop\\\.swf\\\?clip_id\\\=|\\\/video\\\/)(.*)",
    "http://vimeo.com/<video_id>");

LinternaMagica.prototype.remote_sites.add_site(
    "metacafe\\\.com",
    "metacafe\\\.com\\\/fplayer\\\/(.*)\\\.swf",
    "http://metacafe.com/watch/<video_id>");


// Create the buton/link that points to the remote site video
LinternaMagica.prototype.create_remote_site_link = function(object_data)
{
    var p= document.createElement("p");
    var a = document.createElement("a");
    a.textContent = "Linterna Mágica >>";
    a.setAttribute("class", "linterna-magica-toggle-plugin");

    a.setAttribute("href", object_data.remote_site_link);
    a.setAttribute("title", _("Watch this video at it's original"+
			      " site with Linterna Mágica"));

    p.appendChild(a);
    p.style.setProperty("position", "relative", "important");
    p.style.setProperty("z-index", "99999", "important");
    // See https://savannah.nongnu.org/bugs/?33303
    p.style.setProperty("margin-bottom", "50px", "important");

    return p;
}
