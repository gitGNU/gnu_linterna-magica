//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011, 2012  Ivaylo Valkov <ivaylo@e-valkov.org>
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
	var url_template_data = null;

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
	    url_template_data = data.match(video_id_re);
	}
	else
	{
	    continue;
	}
	
	if (url_template_data)
	{
	    url = site.url_template;

	    for (var to_be_replaced in site.regex_replace_map)
	    {

		var index = site.regex_replace_map[to_be_replaced];
		var pos = url_template_data.length-index;

		var replace_data = url_template_data[pos];
		replace_data = replace_data.split("&")[0].split("?")[0];

		var regex = new RegExp ( "<"+to_be_replaced+">", "ig");

		url = url.replace(regex, replace_data);
	    }

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
//  * url_template - the url template to recreate the video link. Use
//  <video_id> where the video_id should be added.
//  *regex_replace_map - hash/object. 
//     The keys are strings to be replaces in the url_template, wrapped in <>.
//     The values are the indexes of each () block in the video_id_regex.
//     The indexes are subtracted from the length of the match array. 
//     The enumeration is from left ro right. 
//     For example: 1 for the last match, 2 for the next and so on.
//     The video_id string is optional if it is the last matched () block.
//     The code for google.video is an example.

LinternaMagica.prototype.remote_sites.add_site =
function (site_name_regex, video_id_regex, url_template, regex_replace_map)
{
    var site = new Object();

    if (!regex_replace_map)
    {
	regex_replace_map = new Object();
    }

    // Zero is an option
    if (regex_replace_map.video_id == undefined)
    {
	regex_replace_map.video_id = 1;
    }

    site.site_name_regex = site_name_regex;
    site.video_id_regex = video_id_regex;
    site.regex_replace_map = regex_replace_map;
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

LinternaMagica.prototype.remote_sites.add_site(
    "video\\\.google\\\.",
    "video\\\.google\\\.(.*)/googleplayer\\\.swf\\\?docid=([0-9-]+)\\\&",
    "http://video.google.<tld>/videoplay?docid=<video_id>", 
    {tld:2, video_id:1});

LinternaMagica.prototype.remote_sites.add_site(
    "viddler\\\.com",
    "viddler\\\.com\\\/(mini|embed|simple)\\\/([a-zA-Z0-9]+)\\\/",
    "http://viddler.com/v/<video_id>");

// Create the buton/link that points to the remote site video
LinternaMagica.prototype.create_remote_site_link = function(object_data)
{
    var p= document.createElement("p");

    var a = this.pack_external_link(object_data.remote_site_link,
				    "Linterna Mágica >>");

    var title = this.
	_("Watch this video at it's original site with Linterna Mágica");

    a.setAttribute("class", "linterna-magica-remote-clip-visit-page-button");
    a.setAttribute("title", title + " ("+object_data.remote_site_link+")");

    p.appendChild(a);

    var close = document.createElement("a");
    close.textContent="x";
    close.setAttribute("href", "#");
    close.setAttribute("class", "linterna-magica-remote-clip-close-button");
    close.setAttribute("title", this._("Remove this button, if it overlaps images or text in the page."));

    var close_click_function =  function(ev)
    {
    	ev.preventDefault();
	var wrapper =  this.parentNode;
	wrapper.nextSibling.style.removeProperty("top");
	wrapper.parentNode.removeChild(wrapper);
    };

    close.addEventListener("click", close_click_function, false);

    p.appendChild(close);

    p.setAttribute("class", "linterna-magica-remote-clip-buttons");

    return p;
}
