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

// Create web controls
LinternaMagica.prototype.create_controls = function(object_data)
{
    var id= object_data.linterna_magica_id;

    var controls = document.createElement("div");
    controls.setAttribute("class", "linterna-magica-controls");

    var self =this;

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

    var stop = this.create_stop_button(object_data);

    var stop_click_function = function(ev)
    {
	var el = this;
	self.stop_button_click_event.apply(self, [ev, el]);
    };

    stop.addEventListener("click", stop_click_function, false);
    controls.appendChild(stop);

    var time_slider = this.create_time_slider(object_data);

    // User agent sniffing is ugly and not recommended. Is it there a
    // better way?
    var mouse_scroll = /WebKit/i.test(navigator.userAgent) ?
	"mousewheel" : "DOMMouseScroll";

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

    controls.appendChild(time_slider);

    var volume_slider  = this.create_volume_slider(object_data);
    var volume_text = volume_slider.getElementsByTagName("span")[0];

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

    var volume_knob = volume_slider.getElementsByTagName("a")[0];

    volume_knob.addEventListener("mousedown", function(ev)
				 {
				     ev.preventDefault();
				     self.slider_control.apply(self, [ev]);
				 }, false);

    controls.appendChild(volume_slider);

    var mute = this.create_mute_button(object_data);

    var mute_click_function = function(ev)
    {
	var el = this;
	self.mute_button_click_event.apply(self, [ev, el]);
    };

    mute.addEventListener("click", mute_click_function, false);
    controls.appendChild(mute);

    var fullscreen = this.create_fullscreen_button(object_data);

    var fullscreen_click_function = function(ev)
    {
	var el = this;
	self.fullscreen_button_click_event.apply(self, [ev, el]);
    };
    				
    fullscreen.addEventListener("click",
				fullscreen_click_function, false);
    controls.appendChild(fullscreen);

    return controls;
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

// Create stop button
LinternaMagica.prototype.create_stop_button = function(object_data)
{
    var lm_id = object_data.linterna_magica_id;

    var stop = document.createElement("a");
    stop.setAttribute("class", "linterna-magica-controls-buttons "+
		      "linterna-magica-controls-buttons-stop");
    stop.setAttribute("id", "linterna-magica-controls-button-stop-"+lm_id);
    stop.setAttribute("href", "#");

    // TRANSLATORS: This is showed as a tooltip when the mouse cursor
    // is above the stop button.
    stop.setAttribute("title", this._("Stop"));
    stop.textContent ="St";
    
    return stop;
}

// The function executed on DOM click event for the stop button
LinternaMagica.prototype.stop_button_click_event = function(event, element)
{
    event.preventDefault();

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-button-stop-/,"");

    // Hide pause button.
    var pause = 
	document.getElementById("linterna-magica-controls-button-pause-"+id);
    pause.style.setProperty("display", "none", "important");

    // this.previousSibling.style.setProperty("display", 
    // 					   "none", "important");
    // play button
    var play =
	document.getElementById("linterna-magica-controls-button-play-"+id);
    // var play = this.previousSibling.previousSibling;
    play.style.removeProperty("display");

    var self = this;
    this.player.stop.apply(self, [id]);

    // Stop the time ticker
    clearInterval(self.player_timers[id]);
    delete this.player_timers[id];
}

// Create time slider
LinternaMagica.prototype.create_time_slider = function(object_data)
{
    var lm_id = object_data.linterna_magica_id;
    var self = this;

    var time_slider = document.createElement("div");

    time_slider.setAttribute("title", this._("Time"));

    time_slider.setAttribute("class",
			     "linterna-magica-controls-horizontal-slider");
    time_slider.setAttribute("id",
			     "linterna-magica-controls-time-slider-"+lm_id);

    // The slider width is calculated from the object width.
    // 
    // We have 6 buttons (width + border +padding + margin).
    //
    // Remove the padding, margin, border for each slider (2): 2*x
    // (padding + border + margin)
    //
    // The time slider uses 3/4 of the space
    var time_width = parseInt(((object_data.width - (4 * 21)) * 3/4)-12);
    time_slider.style.setProperty("width", time_width+"px", "important");

    time_slider.style.setProperty("position", "relative", "important");

    var time_knob_move = null;

    if (this.languages[this.lang].__direction == "ltr" ||
	this.languages[this.lang].__direction !== "rtl")
    {
	time_knob_move = "left";
    }
    else if (this.languages[this.lang].__direction == "rtl")
    {
	time_knob_move = "right";
    }

    var time_knob = document.createElement("a");
    time_knob.setAttribute("title", this._("Time"));
    time_knob.setAttribute("class", "linterna-magica-controls-slider-knob");
    time_knob.setAttribute("id", "linterna-magica-controls-"+
			   "time-slider-knob-"+lm_id);

    time_knob.style.setProperty(time_knob_move, "0px", "important");

    time_knob.setAttribute("href", "#");

    time_slider.appendChild(time_knob);

    var time_text = document.createElement("span");
    time_text.style.display = "none";
    time_text.setAttribute("class", "linterna-magica-controls-slider-text");
    time_text.setAttribute("id", "linterna-magica-controls-"+
			   "time-slider-text-"+lm_id);

    time_text.textContent="--:--:--";
    time_text.style.setProperty("left",
				parseInt(time_width/2)+"px",
				"important");

    time_slider.appendChild(time_text);

    return time_slider;
}

// The function executed on DOM scroll event for the time slider
LinternaMagica.prototype.time_slider_scroll_event = function (event, element)
{
    event.preventDefault();
    var self = this;

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-time-slider-/,"");

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
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-time-slider-/,"");

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

    var volume_slider = document.createElement("div");

    volume_slider.setAttribute("class",
			       "linterna-magica-controls-horizontal-slider");
    volume_slider.setAttribute("id", "linterna-magica-controls-"+
			       "volume-slider-"+lm_id);
    volume_slider.setAttribute("title", this._("Volume control"));

    // The slider width is calculated from the object width.
    // 
    // We have 6 buttons (width + border +padding + margin)
    // 
    // Remove the padding, margin, border for each slider (2): 2 * x
    // (padding + border + margin)
    //
    // The volume slider uses 1/4 of the space
    var volume_width = parseInt(((object_data.width - (4 * 21)) * 1/4)-12);
    volume_slider.style.setProperty("width",
				    volume_width+"px",
				    "important");

    var volume_knob_move = null;

    if (this.languages[this.lang].__direction == "ltr" ||
	this.languages[this.lang].__direction !== "rtl")
    {
	volume_knob_move = "left";
    }
    else if (this.languages[this.lang].__direction == "rtl")
    {
	volume_knob_move = "right";
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

    var volume_text = document.createElement("span");
    volume_text.setAttribute("class",
			     "linterna-magica-controls-slider-text");
    volume_text.setAttribute("id", "linterna-magica-controls-"+
			     "volume-slider-text-"+lm_id);
    volume_text.style.setProperty("left",
				  parseInt(volume_width/3)+"px",
				  "important");

    volume_text.textContent = "--";
    volume_slider.appendChild(volume_text);

    return volume_slider;
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

    var volume_text =
	document.getElementById("linterna-magica-controls-"+
				"volume-slider-text-"+id);

    volume_text.textContent = pos.val;
}

// The function executed on DOM click event for the volume slider
LinternaMagica.prototype.volume_slider_click_event = function (event, element)
{
    event.preventDefault();
    var self = this;

    // Linterna Magica object id
    var id = element.getAttribute("id").
	replace(/linterna-magica-controls-volume-slider-/,"");
    
    event.preventDefault();
    var pos = self.slider_control.apply(self, [event]);

    this.player.set_volume.apply(self, [id, pos.val]);

    var volume_text =
	document.getElementById("linterna-magica-controls-"+
				"volume-slider-text-"+id);
    volume_text.textContent = pos.val;
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

    var volume_text =
	document.getElementById("linterna-magica-controls-"+
			    "volume-slider-text-"+id);

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
	// cursor is above the text in volume slider and the sound is
	// muted.
	volume_text.setAttribute("title", this._("Muted"));

	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the volume slider and the sound is muted.
	volume_slider.setAttribute("title",this._("Muted"));

	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the volume slider knob and the sound is
	// muted.
	volume_knob.setAttribute("title",this._("Muted"));
	volume_text.textContent = "0%";
    }
    else
    {
	// TRANSLATORS: This is showed as tooltip when the mouse
	// cursor is above the mute button and the sound is *not*
	// muted.
	mute.setAttribute("title", this._("Mute"));
	mute.textContent = "M";

	volume_text.textContent = volume;

	volume_text.removeAttribute("title");
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
    }
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
