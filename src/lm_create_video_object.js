//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
//  Copyright (C) 2013, 2014  Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Uses the extracted object data (width, link, placement ...)
// to create the video object playable by totem/vlc/gecko-mediaplayer
LinternaMagica.prototype.create_video_object = function(object_data)
{
    if (typeof(object_data) !== "object")
    {
	return;
    }

    // Decrease the size for the object, so it all fits in the space
    // allocated by the website
    // height of all controls + borders
    // 36 = 12 + 22 + 2
    // 12 - time slider
    // 22 - control barr
    // 2 - borders 
    // -1 = bottom border of the object
    object_data.outer_height = object_data.height-1;
    object_data.height -= this.controls ? 36 : 24;

    var id = object_data.linterna_magica_id;
    this.log("LinternaMagica.create_video_object:\n"+
	     "Creating video object with linterna_magica_id "+id,2);

    // Check if another object is created already there and skip.
    if (((id-1) >= 0))
    {
	// Will break if the there is object that is not created just
	// before this one.
	var lm_instance = 
	    document.getElementById("linterna-magica-"+(id-1));
	if (lm_instance && lm_instance.parentNode &&
	    lm_instance.parentNode == object_data.parent)
	{
	     this.log("LinternaMagica.create_video_object:\n"+
		      "It seems object with linterna_magica_id "+id+
		      " will be created at the same place where object "+
		      "with linterna_magica_id "+(id-1)+" already exists. "+
		      "Not creating object with id #"+id,1);
	    return null;
	}
    }

    var toggle_plugin = this.create_toggle_plugin_link(id);

    var container = document.createElement("div");
    var object_tag_wrapper = document.createElement("div");
    var object_tag = document.createElement("object");
    var message_wrapper = document.createElement("div");
    var message = document.createElement("p");
    var param = document.createElement("param");

    container.setAttribute("id", "linterna-magica-"+id);
    container.setAttribute("class", "linterna-magica");

    if (object_data.width < this.min_width) {
	container.setAttribute("class", "linterna-magica-lower");
    }

    // Fix for rtl languages. See
    // https://savannah.nongnu.org/bugs/?32740
    // https://savannah.nongnu.org/task/?11056
    container.setAttribute("dir", this.languages[this.lang].__direction);

    var lang_code = this.lang.split("_")[0];
    if (!lang_code)
    {
	// The locale is C
	lang_code = "en";
    }

    container.setAttribute("xml:lang", lang_code);
    container.setAttribute("lang", lang_code);

    container.style.setProperty("width",
				(object_data.width+"px"), "important");

    container.style.setProperty("height",
				(object_data.outer_height+"px"), "important");

    object_tag_wrapper.setAttribute("id", "linterna-magica-video-object-wrapper-"+id);
    object_tag_wrapper.setAttribute("class", "linterna-magica-video-object-wrapper");

    object_tag_wrapper.style.setProperty("height", object_data.height+"px",
				 "important");

    object_tag_wrapper.style.setProperty("width", object_data.width+"px",
				 "important");

    object_tag_wrapper.style.setProperty("display", "block",
					 "important");

    var site_html5_player =
	this.find_site_html5_player_wrapper(object_data.parent);

    object_tag.setAttribute("width", object_data.width);
    object_tag.setAttribute("height", object_data.height);
    object_tag.setAttribute("id","linterna-magica-video-object-"+id);
    object_tag.setAttribute("class","linterna-magica-video-object");
    object_tag.setAttribute("standby", this._("Loading video..."));

    if (object_data.link)
    {
	var mime = object_data.mime ? object_data.mime : "video/flv";

 	// Fix for video/mp4 (and other QuickTime clips) for
	// totemNarrowSpace plugin. Fixes these issues of
	// totemNarrowSpace plugin:
	// - No API for fullscreen. 
	// - The UA it sends is different from the browser, Vimeo does
	// not load.
	// With video/flv totemCone plugin will load.
	if (/mp4|m4v|quicktime/i.test(object_data.mime))
	{
	    var mp4 = navigator.mimeTypes["video/mp4"];
	    if (mp4 && mp4.enabledPlugin && mp4.enabledPlugin.name &&
		/totem/i.test(mp4.enabledPlugin.description))
	    {
		mime = "video/flv";
	    }
	}

	object_tag.setAttribute("type", mime);
	object_tag.setAttribute("data", object_data.link);
    }

    message.textContent = this._("Waiting for video plugin to load ...");
    message_wrapper.setAttribute("class",
				 "linterna-magica-video-object-messages");
    message_wrapper.style.setProperty("height", object_data.height+"px",
				 "important");

    message_wrapper.style.setProperty("width", object_data.width+"px",
				 "important");

    message_wrapper.appendChild(message);


    // Firefox Mixed Content blocker
    // https://savannah.nongnu.org/bugs/?39726
    if(/https:/i.test(window.location.protocol) &&
       /http:/i.test(object_data.link))
    {
	var message_mixed = document.createElement("p");
	message_mixed.textContent =
	    this._("It seems that the page is serving mixed ")+
	    this._("content and Linterna M\u00e1gica ")+
	    this._("might not be able to play the video, because ")+
	    this._("of mixed content blocking.");

	message_wrapper.appendChild(message_mixed);

	var mixed_content = document.createElement("a");
	mixed_content.textContent =
	    this._("Read about mixed content blocking in Firefox (forks and clones as well)");
	mixed_content.setAttribute("href", 
		       "https://blog.mozilla.org/tanvi/2013/04/10/"+
		       "mixed-content-blocking-enabled-in-firefox-23/");

	message_mixed = document.createElement("p");
	message_mixed.appendChild(mixed_content);

	message_wrapper.appendChild(message_mixed);


	message_mixed = document.createElement("p");
	var mixed_addon = document.createElement("a");
	mixed_addon.setAttribute("href",
				 "https://addons.mozilla.org/en-us/firefox/"+
				 "addon/toggle-mixed-active-content/");

	mixed_addon.textContent = 
	    this._("Check out the Toggle Mixed Active Content addon");

	message_mixed.appendChild(mixed_addon);
	message_wrapper.appendChild(message_mixed);

	var no_https = document.createElement("a");

	var http_link =  window.location.href.replace("https:", "http:");
	if (window.location.pathname == '/' &&
	    (/vimeo/i.test(window.location.host) ||
	     /vimeo/i.test(window.location.hostname)))
	{
	    http_link = object_data.video_id;
	}
	no_https.setAttribute("href", http_link);


	no_https.textContent =
	    this._("View the page without encryption on your own risk");

	message_mixed = document.createElement("p");
	message_mixed.appendChild(no_https);
	message_wrapper.appendChild(message_mixed);
    }

    // Bug 39402. Some links have the signature in the s=<SIG>
    // format. For example when they are oppened from Canada
    if (this.sites['youtube.com'].encrypted_signature)
    {
	object_tag.setAttribute("data", "#");
	object_tag.setAttribute("type", "#fake");

	var message_enc_sig = document.createElement("p");
	message_enc_sig.textContent =
	    this._("It seems that the signatures for this ")+
	    thhis._("video are encrypted or missing.");

	message_wrapper.appendChild(message_enc_sig);

	message_enc_sig = document.createElement("p");
	message_enc_sig.textContent =
	    this._("Linterna M\u00e1gica is not able to play such clips.");

	message_wrapper.appendChild(message_enc_sig);

	message_enc_sig = document.createElement("p");
	message_enc_sig.textContent =
	    this._("Sorry for the inconvenience.");

	message_wrapper.appendChild(message_enc_sig);

	var enc_sig_bug = document.createElement("a");
	enc_sig_bug.textContent =
	    this._("Read the bug report about encrypted signatures");
	enc_sig_bug.setAttribute("href",
				     "https://savannah.nongnu.org/bugs/?39402");

	message_enc_sig = document.createElement("p");
	message_enc_sig.appendChild(enc_sig_bug);

	message_wrapper.appendChild(message_enc_sig);
    }

    param.setAttribute("name", "autoplay");
    // Find if a clip is already playing.
    var started_clip = this.find_started_clip();

    param.setAttribute("value",
		       (started_clip !== null) ? "false" : this.autostart);

    object_tag.appendChild(param);

    param = document.createElement("param");
    param.setAttribute("name", "showcontrols");
    // controls = true is for our web controls. Reverse logic for the plugin
    param.setAttribute("value", (this.controls ? "false": "true"));
    object_tag.appendChild(param);

    // VLC uses toolbar
    param = document.createElement("param");
    param.setAttribute("name", "toolbar");
    param.setAttribute("value", (this.controls ? "false": "true"));
    object_tag.appendChild(param);

    // totemNarrowspace (QuickTime) uses controller
    param = document.createElement("param");
    param.setAttribute("name", "controller");
    param.setAttribute("value", (this.controls ? "false": "true"));
    object_tag.appendChild(param);

    param = document.createElement("param");
    param.setAttribute("name", "cache");
    param.setAttribute("value",  true);
    object_tag.appendChild(param);

    object_tag.appendChild(message_wrapper);

    object_tag_wrapper.appendChild(object_tag);
    container.appendChild(object_tag_wrapper);

    var about_box = this.create_about_box(id);
    // 40 = padding
    about_box.style.setProperty("height", (object_data.height-40)+"px",
				"important");

    container.appendChild(about_box);
    
    // Mark the object, so it is not processed and chacked after
    // insertion. The function mark_flash_object will use new id and
    // that might not be a good idea (object count, XHRs, duplicate
    // objects ... ). The linterna_magica_id property is set ot a
    // float, so it is not the same as the one of the flash object.
    object_tag.linterna_magica_id =
	parseFloat(object_data.linterna_magica_id+".1");

    if (this.plugin_is_installed || site_html5_player)
    {
	this.add_css_class(object_data.parent, "linterna-magica-ws-video-parent");
    }

    if (this.updates_data)
    {
	var update_info = this.create_update_info_box(id, object_data.height);
	container.appendChild(update_info);
    }

    var controls = this.create_controls(object_data);
    // Set the link if an HD preferred link was computed in the
    // controls code.
    object_tag.setAttribute("data", object_data.link);
    container.appendChild(controls);

    var site_player =  this.get_flash_video_object(id);

    if (!site_player)
    {
	site_player = site_html5_player;
    }

    // Install flash warning in YT
    var yt_flash_warning = null;

    if (/youtube/i.test(window.location.host) ||
	/youtube/i.test(window.location.hostname))
    {
	yt_flash_warning = document.querySelector(".ytp-error");
    }

    var dm_media_warning = null;

    if (/dailymotion/i.test(window.location.host) ||
	/dailymotion/i.test(window.location.hostname))
    {
	// Detect if mp4 is supported. If not Dailymotion should
	// display a warning. The warning is inside an iframe, so it
	// is not accessible. We want to replace the site player when
	// it is not able to start. This is kind of heuristic!
	var v = document.createElement("video");
	var mp4_support =
	    v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	dm_media_warning = mp4_support ? false : true;
    }

    // Remove/hide the object if it is in DOM
    if (site_player &&
	// The object is still in DOM some scripts remove it
	site_player.parentNode)
    {
	if(site_player.nextSibling)
	{
	    object_data.use_sibling = site_player.nextSibling;
	}

	if (this.priority || yt_flash_warning || dm_media_warning ||
	    this.is_swf_object(site_player))
	{
	    if(this.is_swf_object(site_player) || yt_flash_warning ||
	       dm_media_warning)
	    {
		// Ensure it is hidden, not playing and not loadable
		// if removing from DOM does not work.
		site_player = this.hide_flash_video_object(site_player);
		site_player.parentNode.removeChild(site_player);
	    }
	    else
	    {
		this.pause_site_html5_player(site_player);
		site_player.style.setProperty("display","none", "important");
	    }
	}
    }

    if (object_data.use_sibling)
    {
	object_data.parent.insertBefore(
           container,
           object_data.use_sibling);
    }
    else if (object_data.parent)
    {
	object_data.parent.appendChild(container);
    }


    if (!this.priority && !this.is_swf_object(site_player) &&
	!yt_flash_warning && !dm_media_warning)
    {
	// Increase the site player space to fit the LM toggle button
	object_data.parent.
	    style.setProperty("height",
			      object_data.outer_height+27+"px",
			      "important");

	object_data.parent.appendChild(toggle_plugin);

	this.hide_lm_interface(object_data.linterna_magica_id);
    }


    // Objects extracted from script usually does not have cloned object
    // For example youtube
    if (site_player)
    {
	// Prevent the object to fill the container at 100% (if set)
	// This way the toggle plugin link after the object is not
	// overlaping elements.
	site_player.style.setProperty("height", object_data.outer_height+"px",
				      "important");


	// Render site player above Linterna Mágica's button
	site_player.style.setProperty("position", "relative", "important");
	site_player.style.setProperty("z-index", "9999999", "important");
	site_player.style.setProperty("background-color",
				      "black", "important");
	site_player.style.setProperty("border",
				     "1px solid #36393E", "important");
    }

    // Prevent the video object to fill the area at 100% and overlap
    // other elements. This happends if the site CSS sets this
    object_tag.style.setProperty("height", object_data.height+"px",
				 "important");

    object_tag.style.setProperty("width", object_data.width+"px",
				 "important");

    if (this.plugin_is_installed)
    {
	// Remove backrounds so the toggle plugin link is visible
	// (for example youtube)
	object_data.parent.style.
	    setProperty("background-color", "transparent",
			"important");

	// Fixes script crash in vimeo.com with firefox. if
	// parent.parentNode is not an object
	if (object_data.parent.parentNode)
	{
	    object_data.parent.parentNode.
		style.setProperty("background-color", "transparent",
				  "important");
	}
    }

    // Init the web controls functions
    if (this.controls)
    {
	this.player.init.apply(this,[id]);
    }

    // The player name is needed for the this.player.stop function,
    // which is called when LM is hidden. It is used in the toggle
    // plugin button's function to stop the audio when LM is not
    // visible to work-around dual playback. If the video plugin
    // controls are used the this.player.init function is not called
    // and the player name is not set. We need to set it manually. 
    if (!this.controls && !this.get_player_name(id))
    {
	this.player.set_player_name.apply(this,[id]);
    }


    // Various CSS fixes
    var self = this;
    var val = this.call_site_function_at_position.apply(self,[
	"css_fixes",
	window.location.hostname, object_data]);

    return null;
}
