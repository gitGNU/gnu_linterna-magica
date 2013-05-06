//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2013 Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Create web controls
LinternaMagica.prototype.create_controls = function(object_data)
{
    var id = object_data.linterna_magica_id;
    var controls_wrapper = document.createElement("div");

    if (this.controls)
    {
	// setTimout timers for the volume slider hide function
	this.volume_slider_timers[id] = new Array();

	var controls_time_slider = document.createElement("div");
	controls_time_slider.setAttribute("class", "linterna-magica-controls-time-slider");
	controls_time_slider.setAttribute("id", "linterna-magica-controls-time-slider-wrapper-"+id);
	controls_time_slider.style.setProperty("width",
					       ((parseInt(object_data.width))+"px"),
					       "important");

	// User agent sniffing is ugly and not recommended. Is it there a
	// better way?
	var mouse_scroll = /WebKit/i.test(navigator.userAgent) ?
	    "mousewheel" : "DOMMouseScroll";

	var time_slider = this.create_time_slider(object_data);

	var time_slider_scroll_function = function(ev)
	{
	    var el = this;
	    self.time_slider_scroll_event.apply(self, [ev, el]);
	};

	time_slider.addEventListener(mouse_scroll, 
				     time_slider_scroll_function, false);

	var time_slider_click_function =  function(ev)
	{
	    var el = this;
	    self.time_slider_click_event.apply(self, [ev, el]);
	};

	time_slider.addEventListener("click", time_slider_click_function, false);

	var time_knob = time_slider.getElementsByTagName("a")[0];

	time_knob.addEventListener("mousedown", function(ev)
				   {
				       ev.preventDefault();
				       // Stop the time ticker
				       clearInterval(self.player_timers[id]);
				       delete self.player_timers[id];

				       self.slider_control.apply(self, [ev]);
				   }, false);

	controls_time_slider.appendChild(time_slider);
	
	controls_wrapper.appendChild(controls_time_slider);
    }

    var controls = document.createElement("div");
    controls.setAttribute("class", "linterna-magica-controls");
    controls.setAttribute("id", "linterna-magica-controls-"+id);
    controls.style.setProperty("width",
			     ((parseInt(object_data.width))+"px"),
			     "important");

    if (this.controls)
    {
	var self = this;

	var started_clip = this.find_started_clip();

	var play = this.create_play_button(object_data);

	// Only pause button should be visible on autostart
	// Auto start only if no other clip is playing.
	if (this.autostart && started_clip == null)
	{
	    play.style.setProperty("display", "none", "important");
	}

	var play_click_function = function(ev)
	{
	    var el = this;
	    self.play_button_click_event.apply(self, [ev, el]);
	};

	play.addEventListener("click", play_click_function, false);
	controls.appendChild(play);

	var pause = this.create_pause_button(object_data);

	// Only play button should be visible if !autostart or another
	// clip is strated.
	if (!this.autostart || started_clip !== null)
	{
	    pause.style.setProperty("display", "none", "important");
	}

	var pause_click_function = function(ev)
	{
	    var el = this;
	    self.pause_button_click_event.apply(self, [ev, el]);
	};

	pause.addEventListener("click", pause_click_function, false);
	controls.appendChild(pause);

	var mute = this.create_mute_button(object_data);

	var mute_click_function = function(ev)
	{
	    var el = this;
	    self.mute_button_click_event.apply(self, [ev, el]);
	};

	mute.addEventListener("click", mute_click_function, false);

	var mute_mouse_over_function = function(ev)
	{
	    var el = this;
	    var id = el.getAttribute("id").split('-');
	    id = id[id.length-1];

	    self.mute_button_mouse_over_event.apply(self, [ev, el]);

	    for(var i=0,l=self.volume_slider_timers[id].length; i<l; i++)
	    {
		clearTimeout(self.volume_slider_timers[id][i]);
		self.volume_slider_timers[id].pop(i);
	    }

	    el.addEventListener("mouseout", volume_slider_hide_function, false);
	}

	mute.addEventListener("mouseover", mute_mouse_over_function, false);
	mute.addEventListener("mousemove", mute_mouse_over_function, false);

	var volume_slider_hide_function = function(ev)
	{
	    var el = this;
	    var id = el.getAttribute("id").split('-');
	    id = id[id.length-1];

	    var volume_slider_hide_timeout_function = function ()
	    {
		self.volume_slider_hide_event.apply(self, [ev, el]);
	    }

	    var time_id = setTimeout(volume_slider_hide_timeout_function, 700);
	    self.volume_slider_timers[id].push(time_id);
	}

	mute.addEventListener("mouseout", volume_slider_hide_function, false);

	controls.appendChild(mute);

	var volume_slider  = this.create_volume_slider(object_data);
 
	var volume_slider_scroll_function = function(ev)
	{
	    var el = this;
	    self.volume_slider_scroll_event.apply(self, [ev, el]);
	};

	volume_slider.addEventListener(mouse_scroll,
				       volume_slider_scroll_function, false);

	var volume_slider_click_function = function(ev)
	{
	    var el = this;
	    self.volume_slider_click_event.apply(self, [ev, el]);
	};

	volume_slider.addEventListener("click",
				       volume_slider_click_function, false);

	volume_slider.addEventListener("mouseover", mute_mouse_over_function, false);
	volume_slider.addEventListener("mousemove", mute_mouse_over_function, false);

	volume_slider.addEventListener("mouseout", volume_slider_hide_function, false);

	var volume_knob = volume_slider.getElementsByTagName("a")[0];

	volume_knob.addEventListener("mousedown", function(ev)
				     {
					 ev.preventDefault();
					 self.slider_control.apply(self, [ev]);
				     }, false);

	controls.appendChild(volume_slider);

	var time_text = document.createElement("span");
	time_text.style.display = "none";
	time_text.setAttribute("class", "linterna-magica-controls-slider-text "+
			       " linterna-magica-controls-time-slider-text");
	time_text.setAttribute("id", "linterna-magica-controls-"+
			       "time-slider-text-"+id);

	time_text.textContent="--:--:--";

	controls.appendChild(time_text);

    }

    // Create HD links
    if (object_data.hd_links)
    {
	var p = 
	    this.compute_preferred_hd_link(object_data.hd_links);
	
	// No link is calculated. Set to lowest.
	if (p == null || isNaN(p))
	{
	    p = object_data.hd_links[object_data.hd_links.length-1];
	}
	
	object_data.preferred_link = p;

	// Set the link for the player and download link.
	object_data.link = object_data.hd_links[p].url;

	var hd_links = this.create_hd_links_button(object_data);
	controls.appendChild(hd_links);
    }


    if (controls) {
	var fullscreen = this.create_fullscreen_button(object_data);

	var fullscreen_click_function = function(ev)
	{
	    var el = this;
	    self.fullscreen_button_click_event.apply(self, [ev, el]);
	};
    	
	fullscreen.addEventListener("click",
				    fullscreen_click_function, false);
	controls.appendChild(fullscreen);
    }


    var dw_link = document.createElement("a");

    dw_link.textContent = this._("Download");
    dw_link.setAttribute("title", this._("Save the video clip"));

    dw_link.setAttribute("id", "linterna-magica-video-download-link-"+id);
    dw_link.setAttribute("class", "linterna-magica-video-download-link");
    dw_link.setAttribute("href", object_data.link);

    if (!object_data.link)
    {
	dw_link.style.setProperty("display", "none", "important");
    }

    controls.appendChild(dw_link);

    var site_html5_player =
	this.find_site_html5_player_wrapper(object_data.parent);

    // Log to web
    if (this.debug_level && this.log_to == "web")
    {
	var log_link  =  this.create_web_log_link();

	log_link.setAttribute("class", 
			      "linterna-magica-web-log-link");
	log_link.setAttribute("id",
			      "linterna-magica-web-log-link-"+id);

	log_link.addEventListener("click",
				  this.show_or_hide_web_log, false);

	controls.appendChild(log_link);
    }

    var self = this;
    var update_notifier = this.create_update_notifier_link(id);

    if (!this.updates_data)
    {
	update_notifier.style.setProperty("display", "none", "important");
    }

    var notifier_click_function = function(ev)
    {
	var el = this;
	self.show_or_hide_update_info.apply(self, [ev, el]);
    };
    
    update_notifier.addEventListener("click",
				     notifier_click_function,
				     false);

    controls.appendChild(update_notifier);

    var about_lm = document.createElement("a");
    about_lm.textContent = "Linterna Mágica";
    about_lm.setAttribute("href", "#");
    about_lm.setAttribute("title", this._("About")+ " Linterna Mágica " +
			     this.version);
    about_lm.setAttribute("id", "linterna-magica-logo-"+id);
    about_lm.setAttribute("class", "linterna-magica-logo");

    var self = this;
    about_lm.addEventListener("click", function(ev)
				 {
				     var el = this;
				     self.about.apply(self, [ev, el]);
				 }, false);

    controls.appendChild(about_lm);


    // For RTL pages and LM translations we order the controls
    // from right to left. 

    // For RTL translations we are using Totem
    // (LANGUAGE=ar_SA.utf8 totem) for reference. Any RTL LANGUAGE
    // should do.

    // For RTL pages it is needed, because otherwise in YouTube
    // the HD links list is rendered at the right end of the
    // screen, where it might not be visible.

    if (this.get_document_direction() == "rtl" || 
	this.languages[this.lang].__direction == "rtl")
    {
	controls.setAttribute("dir", "rtl");

	var children = controls.childNodes;

	var class_b = "linterna-magica-controls-buttons";
	var class_hs = "linterna-magica-controls-horizontal-slider";

	for(var b=0,l=children.length; b<l; b++)
	{
	    var child = children[b];

	    var has_b_class = 
		this.object_has_css_class(child, class_b);

	    var has_hs_class = 
		this.object_has_css_class(child, class_hs);

	    if (has_b_class || has_hs_class)
	    {
		child.style.setProperty("float", "right", "important");
	    }
	}
    }
        
    controls_wrapper.appendChild(controls);

    return controls_wrapper;
}

// Create play button
LinternaMagica.prototype.create_play_button = function(object_data)
{
    var lm_id = object_data.linterna_magica_id;

    var play = document.createElement("a");
    play.setAttribute("class", "linterna-magica-controls-buttons "+
		      "linterna-magica-controls-buttons-play");
    play.setAttribute("id", "linterna-magica-controls-button-play-"+lm_id);
    play.setAttribute("href", "#");

    // TRANSLATORS: This showed as tooltip when the mouse cursor is
    // above the play button.
    play.setAttribute("title", this._("Play"));
    play.textContent = "Pa";
   
    return play;
}

// The function executed on DOM click event for the play button
LinternaMagica.prototype.play_button_click_event = function(event, element)
{
    event.preventDefault();

    element.style.setProperty("display", "none", "important");

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-button-play-/,"");

    // Show pause button.
    var pause = document.getElementById("linterna-magica-controls-button-pause-"+id);
    pause.style.removeProperty("display");

    var self = this;
    this.player.play.apply(self, [id]);

    // Start the time ticker
    this.player_timers[id] = setInterval(
	function()
	{
	    self.ticker.apply(self, [id]);
	}, 500);
}

// Create pause button
LinternaMagica.prototype.create_pause_button = function(object_data)
{
    var lm_id = object_data.linterna_magica_id;

    var pause = document.createElement("a");
    pause.setAttribute("class", "linterna-magica-controls-buttons "+
		       "linterna-magica-controls-buttons-pause");

    pause.setAttribute("id", "linterna-magica-controls-button-pause-"+lm_id);

    pause.setAttribute("href", "#");

    // TRANSLATORS: This is showed as tooltip when the mouse cursor is
    // above the pause button.
    pause.setAttribute("title", this._("Pause"));
    pause.textContent ="Pa";

    return pause;
}

// The function executed on DOM click event for the pause button
LinternaMagica.prototype.pause_button_click_event = function(event, element)
{
    event.preventDefault();

    element.style.setProperty("display", "none", "important");

    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-button-pause-/,"");

    var play = document.getElementById("linterna-magica-controls-button-play-"+id);
    play.style.removeProperty("display");

    var self = this;
    this.player.pause.apply(self, [id]);

    // Stop the time ticker
    clearInterval(self.player_timers[id]);
    delete this.player_timers[id];
}


// Create time slider
LinternaMagica.prototype.create_time_slider = function(object_data)
{
    var lm_id = object_data.linterna_magica_id;
    var self = this;

    var time_slider_outer = document.createElement("div");
    time_slider_outer.setAttribute("title", this._("Time"));

    time_slider_outer.setAttribute("class",
			     "linterna-magica-controls-time-slider-outer-frame");
    time_slider_outer.setAttribute("id",
			     "linterna-magica-controls-time-slider-outer-frame-"+lm_id);

    var time_slider = document.createElement("div");

    time_slider.setAttribute("title", this._("Time"));

    time_slider.setAttribute("class",
			     "linterna-magica-controls-horizontal-slider");
    time_slider.setAttribute("id",
			     "linterna-magica-controls-time-slider-"+lm_id);

    var time_knob_move = null;

    var doc_dir = this.get_document_direction();

    if (doc_dir == "rtl" ||
	this.languages[this.lang].__direction == "rtl")
    {
	time_knob_move = "right";
    }
    else
    {
	time_knob_move = "left";
    }
 
    var progress_bar = document.createElement("div");
    progress_bar.setAttribute("title", this._("Time"));
    progress_bar.setAttribute("class", "linterna-magica-controls-horizontal-"+
			   "slider-progress-bar");
    progress_bar.setAttribute("id", "linterna-magica-controls-"+
			   "time-slider-progress-bar-"+lm_id);
 

    var time_knob = document.createElement("a");
    time_knob.setAttribute("title", this._("Time"));
    time_knob.setAttribute("class", "linterna-magica-controls-slider-knob");
    time_knob.setAttribute("id", "linterna-magica-controls-"+
			   "time-slider-knob-"+lm_id);

    time_knob.style.setProperty(time_knob_move, "0px", "important");

    time_knob.setAttribute("href", "#");

    time_slider.appendChild(time_knob);

    time_slider_outer.appendChild(progress_bar);

    time_slider_outer.appendChild(time_slider);

    return time_slider_outer;
}

// The function executed on DOM scroll event for the time slider
LinternaMagica.prototype.time_slider_scroll_event = function (event, element)
{
    event.preventDefault();
    var self = this;

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-time-slider-outer-frame-/,"");

    var pos = this.slider_control.apply(self, [event]);
    
    if (pos.direction > 0)
    {
	this.player.forward.apply(self,[id,pos.val]);
    }
    else
    {
	this.player.rewind.apply(self,[id,pos.val]);
    }
}

// The function executed on DOM click event for the time slider
LinternaMagica.prototype.time_slider_click_event = function (event, element)
{
    event.preventDefault();
    var self = this;

    // Linterna Magica object id
    var raw_id = element.getAttribute("id");
    var id = raw_id.split('-');
    id = id[id.length-1];

    if (!id)
    {
	return;
    }

    // Stop the time ticker
    clearInterval(this.player_timers[id]);
    delete this.player_timers[id];

    var pos =  this.slider_control.apply(self, [event]);

    if (pos.direction > 0)
    {
	this.player.forward.apply(self,[id,pos.val]);
    }
    else
    {
	this.player.rewind.apply(self,[id,pos.val]);
    }

    this.player_timers[id] =
	setInterval(
	    function()
	    {
		self.ticker.apply(self,[id]);
	    }, 500);
}

// Create volume slider
LinternaMagica.prototype.create_volume_slider = function(object_data)
{
    var lm_id = object_data.linterna_magica_id;
    var self = this;

    var volume_slider_outer = document.createElement("div");

    volume_slider_outer.setAttribute("class", "linterna-magica-controls-volume-"+
				     "slider-outer-frame");
    volume_slider_outer.setAttribute("id", "linterna-magica-controls-"+
			       "volume-slider-outer-frame-"+lm_id);
    volume_slider_outer.setAttribute("title", this._("Volume control"));

    volume_slider_outer.style.setProperty("display", "none", "important");


    var volume_slider = document.createElement("div");

    volume_slider.setAttribute("class",
			       "linterna-magica-controls-horizontal-slider "+
			       "linterna-magica-controls-volume-slider");
    volume_slider.setAttribute("id", "linterna-magica-controls-"+
			       "volume-slider-"+lm_id);
    volume_slider.setAttribute("title", this._("Volume control"));


    var progress_bar = document.createElement("div");
    progress_bar.setAttribute("title", this._("Volume"));
    progress_bar.setAttribute("class", "linterna-magica-controls-horizontal-"+
			   "slider-progress-bar");
    progress_bar.setAttribute("id", "linterna-magica-controls-"+
			   "volume-slider-progress-bar-"+lm_id);
 
    var volume_knob_move = null;

    var doc_dir = this.get_document_direction();
    if (doc_dir == "rtl" ||
	this.languages[this.lang].__direction == "rtl")
    {
	volume_knob_move = "right";
    }
    else
    {
	volume_knob_move = "left";
    }

    var volume_knob = document.createElement("a");
    volume_knob.setAttribute("class", "linterna-magica-controls-slider-knob");
    volume_knob.setAttribute("id",
			     "linterna-magica-controls-"+
			     "volume-slider-knob-"+lm_id);

    volume_knob.style.setProperty(volume_knob_move, "0px", "important");
    volume_knob.setAttribute("href", "#");
    volume_knob.setAttribute("title", this._("Volume control"));

    volume_slider.appendChild(volume_knob);

    volume_slider_outer.appendChild(progress_bar);
    volume_slider_outer.appendChild(volume_slider);

    return volume_slider_outer;
}

// The function executed on DOM scroll event for the volume slider
LinternaMagica.prototype.volume_slider_scroll_event = function (event, element)
{
    event.preventDefault();
    var self = this;

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-volume-slider-/,"");

    event.preventDefault();
    var pos = self.slider_control.apply(self, [event]);

    this.player.set_volume.apply(self, [id, pos.val]);
}

// The function executed on DOM click event for the volume slider
LinternaMagica.prototype.volume_slider_click_event = function (event, element)
{
    event.preventDefault();
    var self = this;

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-volume-slider-outer-frame-/,"");
    
    event.preventDefault();
    var pos = self.slider_control.apply(self, [event]);

    this.player.set_volume.apply(self, [id, pos.val]);
}

// Create mute button
LinternaMagica.prototype.create_mute_button = function(object_data)
{
    var lm_id = object_data.linterna_magica_id;

    var mute = document.createElement("a");
    mute.setAttribute("class", "linterna-magica-controls-buttons "+
		      "linterna-magica-controls-buttons-mute");
    mute.setAttribute("id", "linterna-magica-controls-button-mute-"+lm_id);
    mute.setAttribute("href", "#");

    // TRANSLATORS: This is showed as a tooltip when the mouse cursor
    // is above the mute button.
    mute.setAttribute("title", this._("Mute"));
    mute.textContent ="M";

    return mute;
}

LinternaMagica.prototype.mute_button_mouse_over_event = function (event, element)
{
    var self = this;
    var mute = element;

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-button-mute-/,"");

    var id_string = "linterna-magica-controls-volume-slider-outer-frame-"+id;

    var volume_slider = 
	document.getElementById(id_string);


    if (!volume_slider)
    {
	return null;
    }

    volume_slider.style.removeProperty("display");
}


// The function executed on DOM click event for the mute button
LinternaMagica.prototype.mute_button_click_event = function (event, element)
{
    event.preventDefault();

    var self = this;
    var mute = element;

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-button-mute-/,"");

    var volume =
	this.player.toggle_mute.apply(self,[id]);

    var volume_slider =
	document.getElementById("linterna-magica-controls-"+
				"volume-slider-"+id);
						
    var volume_knob = 
	document.getElementById("linterna-magica-controls-"+
			    "volume-slider-knob-"+id);

    var volume_progress =
 	document.getElementById("linterna-magica-controls-"+
				"volume-slider-progress-bar-"+id);

    if (/M/i.test(mute.textContent))
    {
	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the mute button and the sound is muted.
	mute.setAttribute("title", this._("Unmute"));
	mute.textContent = "U";

	mute.setAttribute("class",
			  "linterna-magica-controls-buttons "+
			  "linterna-magica-controls-"+
			  "buttons-unmute");

	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the volume slider and the sound is muted.
	volume_slider.setAttribute("title",this._("Muted"));

	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the volume slider knob and the sound is
	// muted.
	volume_knob.setAttribute("title",this._("Muted"));

	mute.lm_volume_knob_direction = 
	    volume_knob.style.getPropertyValue('left') ? "left" : "right";

	mute.lm_volume_knob_position =
	    volume_knob.style.getPropertyValue(
		mute.lm_volume_knob_direction);

	volume_knob.style.setProperty(mute.lm_volume_knob_direction,
				      "0px", "important");
	volume_progress.style.setProperty("width", "0px", "important");
    }
    else
    {
	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the mute button and the sound is *not*
	// muted.
	mute.setAttribute("title", this._("Mute"));
	mute.textContent = "M";

	mute.setAttribute("class", "linterna-magica-controls-buttons "+
			  "linterna-magica-controls-buttons-mute");

	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the volume slider and the sound is *not*
	// muted.
	volume_slider.setAttribute("title", this._("Volume control"));

	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the volume slider knob and the sound is
	// *not* muted.
	volume_knob.setAttribute("title", this._("Volume control"));

	volume_knob.style.setProperty(mute.lm_volume_knob_direction,
				      mute.lm_volume_knob_position,
				      "important");
	volume_progress.style.setProperty("width", 
					  (mute.lm_volume_knob_position ? 
					   parseInt(mute.lm_volume_knob_position)+3 :
					   0)+"px",
					  "important");
    }
}

LinternaMagica.prototype.volume_slider_hide_event = function(event, element)
{
    if (!element.hasAttribute('id'))
    {
 	return null;
    }

    var id = element.getAttribute("id").split('-');
    id = id[id.length-1];

    var volume_slider = 
	document.getElementById("linterna-magica-controls-"+
				"volume-slider-outer-frame-"+id);

    if (!volume_slider)
    {
	return null;
    }

    volume_slider.style.setProperty("display", "none", "important");
}

// Create fullscreen button
LinternaMagica.prototype.create_fullscreen_button = function(object_data)
{
    var lm_id = object_data.linterna_magica_id;

    var fullscreen = document.createElement("a");
    fullscreen.setAttribute(
	"class", "linterna-magica-controls-buttons "+
	    "linterna-magica-controls-buttons-fullscreen");
    fullscreen.setAttribute("id", 
			    "linterna-magica-controls-button-fullscreen-"+lm_id);
    fullscreen.setAttribute("href", "#");

    // TRANSLATORS: This is showed as a tooltip when the mouse cursor
    // is above the fullscreen button.
    fullscreen.setAttribute("title", this._("Fullscreen"));
    fullscreen.textContent ="Fs";

    return fullscreen;
}

// The function executed on DOM click event for the fullscreen button
LinternaMagica.prototype.fullscreen_button_click_event = function (event, element)
{
    event.preventDefault();

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-button-fullscreen-/,"");

    var self = this;
    this.player.fullscreen.apply(self, [id]);
}
