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


// Set lm_player_name property
// This is used to know wchich API to use
// navigator.plugins[x].name:
// Tototem:  VLC Multimedia Plugin (compatible Totem 2.30.1)
// gecko-mediaplayer: mplayerplug-in is now gecko-mediaplayer 0.9.9.2
// vlc: VLC Multimedia Plug-in
// xine-plugin: Xine Plugin
// NOTE:
// navigator.mimeTypes["video/flv"].enabledPlugin.name is not
// reliable if more than one plugin is installed.
// This is done once, and all the other functions just check a string.
LinternaMagica.prototype.player.set_player_name = function(id)
{
    var name = null;
    var video_object = this.get_video_object(id);

    if (!video_object)
    {
	return null;
    }

    var mimeTypes = navigator.mimeTypes;

    var mime = mimeTypes[video_object.getAttribute("type")];

    if (mime && mime.enabledPlugin && mime.enabledPlugin.name)
    {
	name =mime.enabledPlugin.name;
    }
    else
    {
	name = "unknown";
    }

    if(name)
    {
	this.log("LinternaMagica.player.set_player_name:\n"+
		 "Name set to "+name,3);
	video_object.lm_player_name = name;
    }

    return name;
}

// Return the name ofthe plugin that will play the video.
LinternaMagica.prototype.get_player_name = function(id)
{
    var name = null;
    var video_object = this.get_video_object(id);

    if (video_object)
    {
	name = video_object.lm_player_name;
    }

    return name;
}

// Returns an object with
//  video duration
//  current position,
//  current position as formated string
//  state as string
//  time in percentage
// {
//   position: seconds
//   duration: seconds
//   string: hh:mm:ss (post) / hh:mm:ss (dur)
//   state: string (Buffering , loading )
// }
LinternaMagica.prototype.player.state = function(id)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if (!video_object || !player_name)
    {
	return null;
    }

    var time = new Object();
    time.duration = null;
    time.position = null;
    time.string = "--:--:--";

    if (/gecko-mediaplayer/.test(player_name))
    {
	switch(video_object.playState)
	{
	case 0:
	    time.state = this._("Loading");
	    break;
	case  6:
	    time.state = this._("Buffering");
	    break;

	}

	if (!time.state)
	{
	    // Fix exception when switching between
	    // Linterna Mágica and flash plugin
	    try
	    {
		time.position = video_object.getTime();
		time.duration = video_object.getDuration();
		time.percent = video_object.getPercent();
	    }
	    catch(e)
	    {
		return null;
	    }
	}
    }
    else if (/vlc/i.test(player_name))
    {
	// There is some problem here
	// the browser throws and error
	// that video_object.input is not and
	// object (no .input.state)
	// but video_object.input.length && video_object.time
	// are OK
	if (video_object.input)
	{
	    switch (video_object.input.state)
	    {
	    case 0:
		time.state = this._("Loading");
		break;
	    case 2:
		time.state = this._("Buffering");
		break;
	    }
	}

	if (!time.state && video_object.input)
	{
	    // Fixes exception when switching between
	    // Linterna Mágica and flash plugin
	    try
	    {
		// in seconds
		time.position = video_object.input.time/1000;
		// in seconds
		time.duration = video_object.input.length/1000;
		// return the same format as getPercent() in
		// gecko-mediaplayer
		time.percent = (time.position/time.duration);
 		// Fix NaN result (division by 0)
		time.percent = time.percent ? time.percent : 0;
	    }
	    catch(e)
	    {
		return null;
	    }
	}
    }
    else if (/xine/i.test(player_name))
    {
	try
	{
	    // Xine supports only playing (3) and paused (4)
	    var state = video_object.controls.GetPlayState();
	    if (state !== 4 && state !== 3)
		time.state = this._("Loading");
	}
	catch(e)
	{
	    return null;
	}

	if (!time.state)
	{
	    // Fixes exception when switching between
	    // Linterna Mágica and flash plugin
	    try
	    {
		time.position = video_object.controls.GetPosition()/1000;
		time.duration = video_object.controls.GetLength()/1000;
		// Xine does not have percent
		time.percent =  (time.position/time.duration);
 		// Fixes NaN result (division by 0)
		time.percent = time.percent ? time.percent : 0;
	    }
	    catch(e)
	    {
		return null;
	    }
	}
    }
    else if (/quicktime plug-in/i.test(player_name))
    {
	var status;
	try
	{
	   status = video_object.GetPluginStatus();
	}
	catch(e)
	{
	    status ="NOT_READY";
	}

	switch(status)
	{
	case "Loading":
	case "Waiting":
	    time.state = this._("Loading");
	    break;
	case "NOT_READY":
	    time.state = this._("Waiting plugin");
	    break;
	}

	if (!time.state)
	{
	    // Fixes exception when switching between
	    // Linterna Mágica and flash plugin
	    try
	    {
		time.position = video_object.GetTime()/1000;
		time.duration = video_object.GetDuration()/1000;

		// return the same format as getPercent() in
		// gecko-mediaplayer
		time.percent = (time.position/time.duration);
 		// Fixes NaN result (division by 0)
		time.percent = time.percent ? time.percent : 0;
	    }
	    catch(e)
	    {
		return null;
	    }
	}
    }
    // Add some moving text
    if (time.state)
    {
	var dots = Math.random()*10;
	for (var d=0; d <dots ; d ++)
	{
	    time.state += ".";
	}
    }

    var sec_pos = Math.round(time.position) % 60;
    var min_pos = Math.floor(time.position / 60) % 60;
    var hour_pos = Math.floor(time.position / 3600);

    var sec_dur = Math.round(time.duration) % 60;
    var min_dur = Math.floor(time.duration / 60) % 60;
    var hour_dur = Math.floor(time.duration / 3600);

    time.string = (hour_pos ?
		   (hour_pos+":") : "")+
	(min_pos+":")+
	((sec_pos<10)?"0"+sec_pos:sec_pos) +"/"+
	(hour_dur ? (hour_dur+":") : "") +
	(min_dur+":")+
	((sec_dur<10)?"0"+sec_dur:sec_dur);

    return time;
}

// Pause the video
LinternaMagica.prototype.player.pause = function(id)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if (!video_object || !player_name)
    {
	return null;
    }

    if (/gecko-mediaplayer/.test(player_name))
    {
    	video_object.Pause();
    }
    else if (/vlc/i.test(player_name))
    {
	video_object.playlist.togglePause();
    }
    else if (/xine/i.test(player_name))
    {
	video_object.controls.pause();
    }
    else if (/quicktime plug-in/i.test(player_name))
    {
	// totemNarrowspace plugin (quicktime)
	// executes TOTEM_COMMAND_PAUSE
	video_object.Stop();
    }
}

// Play the video
LinternaMagica.prototype.player.play = function(id)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if (!video_object || !player_name)
    {
	return null;
    }

    if (/gecko-mediaplayer/.test(player_name) ||
	/totem/.test(player_name))
    {
	video_object.Play();
    }
    else if (/vlc/i.test(player_name))
    {
	video_object.playlist.play();
    }
    else if (/xine/i.test(player_name))
    {
	video_object.controls.play();
    }
    else if (/quicktime plug-in/i.test(player_name))
    {
	// totemNarrowspace plugin (quicktime)
	video_object.Play();
    }
}

// Stop video playback
LinternaMagica.prototype.player.stop = function(id)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if(!video_object || !player_name)
    {
	return null;
    }

    if (/gecko-mediaplayer/.test(player_name))
    {
	video_object.Stop();
    }
    else if (/vlc/i.test(player_name))
    {
	video_object.playlist.stop();
    }
    else if (/xine/i.test(player_name))
    {
	video_object.controls.stop();
    }
    else if (/quicktime plug-in/i.test(player_name))
    {
	// totemNarrowspace plugin (quicktime)
	// executes TOTEM_COMMAND_STOP
	video_object.Rewind();
    }
}

// Seek forward
LinternaMagica.prototype.player.forward = function(id,time)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if (!video_object || !player_name)
    {
	return null;
    }

    // 10 seconds
    if (!time)
    {
	time = 10000;
    }

    if (/gecko-mediaplayer/.test(player_name) ||
	/quicktime plug-in/i.test(player_name))
    {
	if (/%/.test(time))
	{
	    time = parseInt((parseInt(time)* (
		    /quicktime/i.test(player_name) ?
		    video_object.GetDuration() :
		    video_object.getDuration())/100));
	}
	else
	{
	    // gecko-mediaplayer does not use uS
	    time = ((/quicktime/i.test(player_name) ?
		     video_object.GetTime() :
		     video_object.getTime())
		    +time/1000);
	}
	if (/gecko-mediaplayer/.test(player_name))
	{
	    // BUG: gecko in Iceweasel is not seeking (PlayAt also does
	    // not work)
	    video_object.Seek(time);
	}
	else if (/quicktime plug-in/i.test(player_name))
	{
	    video_object.SetTime(time);
	}
    }
    else if (/vlc/i.test(player_name))
    {
	if (/%/.test(time))
	{
	    time = parseInt((parseInt(time)*video_object.input.length)/100);
	}
	else
	{
	    time = video_object.input.time+time;
	}
	video_object.input.time = time;
    }
    else if (/xine/i.test(player_name))
    {
	if (/%/.test(time))
	{
	    time = parseInt((parseInt(time)*
			     video_object.controls.GetPosition())/100);
	}
	else
	{
	    time = video_object.controls.GetPosition() + time;
	}
	// FIXME
	// This should work, but XINE detects most of the streams as
	// non-seekable and could not seek
	video_object.controls.SetPosition(time);
    }
}

// Seek reverse
LinternaMagica.prototype.player.rewind = function(id,time)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if (!video_object || !player_name)
    {
	return null;
    }

    if (!time)
	time = 10000;

    if (/gecko-mediaplayer/.test(player_name)
	|| /quicktime plug-in/i.test(player_name))
    {
	if (/%/.test(time))
	{
	    time = parseInt((parseInt(time)* (
		    /quicktime/i.test(player_name) ?
		    video_object.GetDuration() :
		    video_object.getDuration())/100));
	}
	else
	{
	    // gecko-mediaplayer does not use uS
	    time = ((/quicktime/i.test(player_name) ?
		     video_object.GetTime() :
		     video_object.getTime())
		    +time/1000);
	}
	if (/gecko-mediaplayer/.test(player_name))
	{
	    // BUG: gecko in Iceweasel is not seeking (PlayAt also does
	    // not work)
	    video_object.Seek(time);
	}
	else if (/quicktime plug-in/i.test(player_name))
	{
	    video_object.SetTime(time);
	}
    }
    else if (/vlc/i.test(player_name))
    {
	if (/%/.test(time))
	{
	    time = parseInt((parseInt(time)*video_object.input.length)/100);
	}
	else
	{
	    time = video_object.input.time-time;
	}
	video_object.input.time = time;
    }
    else if (/xine/i.test(player_name))
    {
	if (/%/.test(time))
	{
	    time = parseInt((parseInt(time)*
			     video_object.controls.GetPosition())/100);
	}
	else
	{
	    time = video_object.controls.GetPosition() - time;
	}

	video_object.controls.SetPosition(time);
    }
}

// Go to fullscreen mode
LinternaMagica.prototype.player.fullscreen = function(id)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if (!video_object || !player_name)
    {
	return null;
    }

    if (/gecko-mediaplayer/.test(player_name))
    {
	video_object.fullscreen = true;
	video_object.ShowControls = true;
	// FIXME
	// We must hide them after the user leaves fullscreen
    }
    else if (/vlc/i.test(player_name))
    {
	// totemCone (VLC compatible) plugin has fs controls
	// There is a hack to show fullscreen controls
	// with  VLC but the plugin crashes the browser
	// when second  copy is created:
	// get the time, stop the player, remove the object
	// tag, set the toolbar param to true, insert the object
	// in the same place, set the time start playing, go
	// to fullscreen.
	video_object.video.toggleFullscreen();
    }
}

// Set the volume
// id - video_object id
// volume - volume value in percentage
LinternaMagica.prototype.player.set_volume = function (id, volume)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if (!video_object || !player_name)
    {
	return null;
    }

    // The slider control function returns values as string with % in
    // them.
    volume  = parseInt(volume.replace(/%/,""));

    if (/gecko-mediaplayer/.test(player_name))
    {
	video_object.SetVolume(volume);
    }
    else if (/vlc/i.test(player_name))
    {
	// Multiply by 2 ?
	// VLC uses  values from 0 to 200
	video_object.audio.volume = volume;
    }
    else if (/quicktime plug-in/i.test(player_name))
    {
	// totemNarrowspace plugin (quicktime)
	// max is  255
	video_object.SetVolume(parseInt(255*volume/100));
    }
    // FIXME
    // XINE does not have volume control methods in its API
}

// Toggle mute
// return the current volume percent
LinternaMagica.prototype.player.toggle_mute = function (id)
{
    var video_object = this.get_video_object(id);
    var player_name = this.get_player_name(id);

    if (!video_object || !player_name)
    {
	return null;
    }

    var vol = null;

    if (/gecko-mediaplayer/.test(player_name) ||
	// totemNarrowspace plugin (quicktime)
	/quicktime plug-in/i.test(player_name))
    {
	// totemNarrowspace has get/set mute but
	// can not make it work
	// gecko do not have mute method in the API
	// Mute
	if (!video_object.lm_player_volume)
	{
	    vol = video_object.GetVolume();
	    video_object.lm_player_volume = vol;
	    video_object.SetVolume(0);
	}
	// unMute
	else
	{
	    vol = video_object.lm_player_volume;
	    video_object.SetVolume(parseInt(vol));
	    delete video_object.lm_player_volume;
	    // totemNarrowspace uses 255 as max value
	    // calculcate as 100
	    if (/quicktime/i.test(player_name))
		vol = parseInt(vol * 100/255);
	}
    }
    else if (/vlc/i.test(player_name))
    {
	video_object.audio.toggleMute();
	vol = video_object.audio.volume;
    }
    // FIXME
    // XINE does not have volume control methods in its API

    return vol ? vol+"%" : "--" ;
}

// Control the slider knob for time and volume according to click,
// mousedown, mousescroll and mousemove (drag) events
// returns the knob position in percentage according to the slider
LinternaMagica.prototype.slider_control = function(event)
{
    var knob  = null;
    var slider = null;

    // find the konb and the slider
    if (event.target.nodeType == 3)
    {
	// Mouse scroll event on the span element is triggered with
	// target the textNode inside

	// The slider div is two levels above
	slider = event.target.parentNode.parentNode;
	knob = slider.getElementsByTagName("a")[0];
    }

    if (/span/i.test(event.target.localName))
    {
	// slider text event
	slider = event.target.parentNode;
	knob =  slider.getElementsByTagName("a")[0];
    }
    else if (/a/i.test(event.target.localName))
    {
	// slider knob event
	knob = event.target;
	slider = knob.parentNode;
    }
    else if (/div/i.test(event.target.localName))
    {
	// Slider event
	knob = event.target.
	    getElementsByTagName("a")[0];
	slider = event.target;
    }

    if (!knob)
    {
	return null;
    }

    var move = null;

    var doc_dir =  this.get_document_direction();

    if (doc_dir == "rtl" ||
	this.languages[this.lang].__direction == "rtl")
    {
	move = "right";
    }
    else
    {
	move = "left";
    }

    var old_position = parseInt(knob.style.getPropertyValue(move));
    var direction = 0;
    var position = old_position;

    // Calculate the absolute offsetLeft
    // of the slider so the position of the knob is correct
    var offset_left = 0;
    var obj = slider;

    if (obj.offsetParent) {
	do {
	    offset_left += obj.offsetLeft;
	} while (obj = obj.offsetParent);
    }


    // Get wheel direction
    if (event.type == "mousewheel")
    {
	direction = event.wheelDelta;
    }
    else if(event.type == "DOMMouseScroll")
    {
	direction = -event.detail;
    }

    // set position according to mouse wheel movement
    if (direction < 0)
    {
	position = parseInt(old_position - (slider.clientWidth*10/100));
    }
    else if (direction > 0)
    {
	position = parseInt(old_position + (slider.clientWidth*10/100));
    }

    // Set position according to cursor coordinates
    if (event.type == "click" ||
	event.type == "mousemove")
    {
	// Match only <a> (not sp*a*n)
	if (/^a$/i.test(event.target.localName))
	{
	    position = old_position;
	}
	else
	{
	    position = event.pageX -
		offset_left-
		knob.clientWidth/2;

	    // When the direction is rtl the knob starts at
	    // slider.clientWidth, and moves to 0.
	    if (move == "right")
	    {
		position = Math.abs(position- slider.clientWidth);
	    }

	    if (position > old_position)
	    {
		direction = 1;
	    }
	    else
	    {
		direction = -1;
	    }
	}
    }
    else if (event.type == "mousedown" &&
	     /a/i.test(event.target.localName))
    {
	var self = this;
	// remove move and up event listeners
	var mouse_up_listener = function(ev)
	{
	    slider.removeEventListener(
		"mousemove",
		mouse_move_listener,
		false);

	    knob.removeEventListener(
		"mouseup",
		mouse_up_listener,
		false);
	};

	// move the knob on mosemove
	var mouse_move_listener = function(ev)
	{
	    self.slider_control.apply(self,[ev]);
	};

	slider.addEventListener("mousemove",mouse_move_listener,false);
	// remove move and up event listeners
	knob.addEventListener("mouseup",mouse_up_listener, false);
    }

    // Limit position
    if ((position+knob.clientWidth) >= slider.clientWidth)
    {
	position = slider.clientWidth - knob.clientWidth;
    }

    if (position < 0)
    {
	position = 0;
    }

    knob.style.setProperty(move,
			   position +"px",
			   "important");

    var return_data = new Object();
    return_data.val = (parseInt((position/slider.clientWidth) *100))+"%";
    return_data.direction = direction;
    return return_data;
}

// Time ticker
// Extract and set the current time of the video
// in the time slider
LinternaMagica.prototype.ticker = function(id)
{
    var self = this;
    var time_and_state = self.player.state.
	apply(self,[id]);

    // FIXME: Without
    // !time_and_state ||
    // firefox throws an error for missing video_object functions
    // while the plugin is starting.
    // With it the logic kills the ticker before  the plugin starts

    if (!time_and_state)
    {
	return;
    }

    // Prevent clearing before the clip starts
    // Clear when the video end is reached
    // or null returned (no video_object found)
    if ((time_and_state.position && time_and_state.duration) &&
	(time_and_state.position >= time_and_state.duration))
    {
	clearInterval(self.player_timers[id]);
	delete self.player_timers[id];
	return;
    }

    var time_text = document.
	getElementById("linterna-magica-controls-time-slider-text-"+id);

    if (!time_and_state.state)
    {
	time_text.textContent =time_and_state.string;
    }
    else
    {
	time_text.textContent = time_and_state.state;
    }


    // Move the knob while playing
    var knob  = document.
	getElementById("linterna-magica-controls-time-slider-knob-"+id);

    if (knob)
    {
	var move = null;

	if (this.languages[this.lang].__direction == "ltr" ||
	    this.languages[this.lang].__direction !== "rtl")
	{
	    move = "left";
	}
	else if (this.languages[this.lang].__direction == "rtl")
	{
	    move = "right";
	}

	var slider = knob.parentNode;
	var pos = parseInt(slider.clientWidth *
			   time_and_state.percent);

	if (pos >= slider.clientWidth)
	    pos = slider.clientWidth - knob.clientWidth;;

	knob.style.setProperty(move,
			       pos+"px",
			       "important");
    }
}
