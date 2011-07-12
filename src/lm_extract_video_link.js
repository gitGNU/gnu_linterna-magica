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

// Extract video links from a string passed as argument
LinternaMagica.prototype.extract_link = function()
{
    if (!this.extract_link_data)
    {
	return null;
    }

    var data = this.extract_link_data;
    var link_re = null;


    if (/facebook\.com/i.test(window.location.hostname))
    {
	// Found DOM object
	if (!this.script_data)
	{
	    link_re = new RegExp (
		"thumb_url=(.*)&video_src=(.*)&(motion_log)=(.*)",
		"i");
	}
	// Extracting from script
	else
	{
	    link_re = new RegExp (
		"addVariable\\\((\\\"|\\\')video_src(\\\"|\\\'),\\\s*"+
		    "(\\\"|\\\')([^\\\"\\\']+)(\\\"|\\\')(\\\))\\\;{1}",
		"i");
	}
    }
    // Reuters
    else if (/reuters\.com/i.test(window.location.hostname))
    {
	link_re = new RegExp (
	    "videoURL=(.*)(\\\&{1})(.*)",
	"i");
    }
    // Will match com,de,es, jp etc.
    else if (/video\.google\./i.test(window.location.hostname))
    {
	link_re = new RegExp (
	    "videourl=(.*)\\\&(thumbnailurl)=(.*)" ,
	    "i");
    }
    else
    {
	// FIXME: Regular expressions need rework to match
	// flv|mp4|other|something_else|...mp3|audio
	// 26.02.2011 added streamer| before |file. Fixes
	// jwak.net. The file part matches resource on 8081 port which
	// is not accessible.
	link_re = new RegExp (
	    "\\\{{0}.*(video|flv_ur|streamer|file|moviepath|videourl|"+
		"mediaurl|sdurl|videopath|flv|url|ms|nextmovie|flvaddress)"+
		"(\\\"|\\\')*\\\s*(\\\=|\\\:|\\\,)\\\s*(\\\"|\\\')*"+
		(/clipovete\.com/i.test(window.location.hostname)
		 ? "(.*)\\\&(video_id)=(.*)" :
	  	 "(.*\\\."+
		 // Metacafe switched to mp4 for some videos.
		 // FIXME: We need a general way to match mp4 and other stuff
		 (/metacafe\.com/i.test(window.location.hostname) ?
		  "(mp4|flv)" :"flv")+"((\\\?|\\\&)?\\\w+\\\=[A-Za-z0-9_\\\-]+"+
		 "\\\&?)*)(?!\\\.)"),
	    "i");
    }

    var link = unescape(data).match(link_re);

    // Extra debug for metacafe, because it changes often
    if (/metacafe\.com/i.test(window.location.hostname))
    {
    	this.log("LinternaMagica.extract_link:\n"+
    		 "Unescaped metacafe.com data: "+unescape(data),5);
    }

    if (link && link[link.length-3])
    {
	if (!/metacafe\.com/i.test(window.location.hostname))
	{
	    link = unescape(link[link.length-3]);
	}
	else
	{
	    link = unescape(link[link.length-4]);
	}

	// Used in Metacafe. Unescape is not helping.
	link = link.replace(/\\\//g, "/");

	if (/facebook\.com/i.test(window.location.hostname))
	{
	    // For som reason they use Unicode escape character, that
	    // could not be converted by decodeURIComponent or
	    // unescape directly. This workaround might break
	    // non-ASCII strings in the link
	    link = unescape(link.replace(/\\u0025/g, "%"));
	}

	if (/metacafe\.com/i.test(window.location.hostname))
	{
	    if (/flv/i.test(link))
	    {
		link = link.replace(/&gdaKey/i, "?__gda__");
	    }
	    else
	    {
		var key_re = new RegExp(
		    link.slice(link.length-15).replace(/\\\./g,"\\\\\\.")+
			"\\\"\\\,\\\"key\\\"\\\:\\\"([0-9A-Za-z\\\_]+)\\\"",
		    "i");
		var key = unescape(data).match(key_re);

		// Set the key
		link = link+"?__gda__="+key[key.length-1];
	    }

	    // Escape. We cannot use escape()
	    // because it will break the link and we have to
	    // fix manualy characters like = : ?
	    link = link.replace("[", "%5B").
		replace(" ", "%20").replace("]", "%5D");
	}

	if (/clipovete\.com/i.test(window.location.hostname))
	{
	    link =  "http://storage.puiako.com/clipovete.com/videos/"+
		link +".flv";
	}

	// The link is not a full path and is missing a slash.
	if (/tv7\.bg/i.test(window.location.hostname))
	{
	    link = "/"+link;
	}
	
	// Must be just the path part othe link
	if (/mqsto\.com/i.test(window.location.hostname) &&
	    !/^http/i.test(link))
	{
	    link = "http://mqsto\.com/video/"+link;
	}

	// The link is not full path
	if (/friends\.bg/i.test(window.location.hostname))
	{
	    link = "/files/video/flv/"+link;
	}

	// Amps are not required everywhere
	var keep_amp_in_hosts_re = new RegExp (
	    // Will match com de etc.
	    "video\\\.google\\\.|"+
		".*facebook\\\.",
	    // this used to be cleared. now the logic is reverse
	    // "i-kat\\\.org|video\\\.fensko\\\.com|mqsto\\\.com"+
	    // 	"|fun-6\\\.com|videoclipsdump\\\.com|boomclips\\\.com"+
	    // 	"|lucidclips\\\.com|reuters\\\.com|failo\\\.bg|5min\\\.com|"+
	    // 	"mediashare\\\.bg|ted\\\.com",
	    "i");

	if (!keep_amp_in_hosts_re.exec(window.location.hostname))
	{
	    // The parameters are for the player and with them the
	    // video is no accessible
	    link = link.split("&")[0];

	    this.log("LinternaMagica.extract_link:\n"+
		     " Link split at the first ampersand",3);

	    // Abrowser/Firefox is not loading i-kat.org link
	    // with two slashes. Strange.
	    link = link.replace(/[^:]\/\//, "/");
	}

	if (/ted\.com/i.test(window.location.hostname))
	{
	    link = this.create_tedcom_link(link);
	}

	this.log("LinternaMagica.extract_link:\n"+
		 " Extracted link: "+link,1);

	return link;
    }
    else
    {
	this.log("LinternaMagica.extract_link:\n"+
		 "No link found.",4);
    }

    return null;
}

// Extract video id from string passed as argument.  This is used to
// request a document (usually XML) containing the video link
LinternaMagica.prototype.extract_video_id = function()
{

    if (!this.extract_video_id_data)
    {
	return null;
    }

    var data = this.extract_video_id_data;

    // Fix vbox7.com (flashvars="id=...")
    data = "&"+data;

    var video_id_re = null;

    if (/blip\.tv/i.test(window.location.hostname) ||
	/blip\.tv/i.test(data))
    {
	// Blip.tv has a JSONP API that could be used in remote
	// sites. That is why we cant search for blip.tv directly in
	// the data.
	// http://wiki.blip.tv/index.php/Extract_metadata_from_our_embed_code
	video_id_re = new RegExp(
	    "blip\\\.tv\\\/(play|rss\\\/flash)\\\/([0-9A-Za-z_%-]+)&*",
	    "i");
    }
    else
    {
	// 06.07.2010 Update  for vidoemo.com video3 and \\\/
	// slashes before and after might create bugs
	// 18.12.2010 Update is for vimeo.com : vimeo_clip_
	// 12.02.2011 Update for myvideo.de. php&ID and \\\. This migth break
	// 25.02.2011 Update for videoclipsdump.com
	// player_config\\\.php\\\ must be after vid|
	// 11.06.2011 Update for theonion.com 
	// \\\/video_embed\\\/...
	video_id_re = new RegExp (
	    "(\\\"|\\\'|\\\&|\\\?|\\\;|\\\/|\\\.|\\\=)(itemid|clip_id|video_id|"+
		"vid|player_config\\\.php\\\?v|"+
		"videoid|media_id|vkey|video3|_videoid|"+
		"vimeo_clip_|php&ID|\\\/video_embed\\\/\\\?id)"+
		"(\\\"|\\\')*(\\\=|\\\:|,|\\\/)\\\s*(\\\"|\\\')*"+
		"([a-zA-Z0-9\\\-\\\_]+)",
	"i");
    }

    var video_id =data.match(video_id_re);

    if (video_id)
    {
	video_id = video_id[video_id.length-1];

	this.log("LinternaMagica.extract_video_id:\n"+
		 "Extracted video id : "+video_id,1);

	return video_id;
    }
    else
    {
	this.log("LinternaMagica.extract_video_id:\n"+
		 "No video_id found. ",4);
    }

    return null;
}
