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

// Create web controls
LinternaMagica.prototype.create_controls = function(object_data)
{
    var id= object_data.linterna_magica_id;

    var controls = document.createElement("div");
    controls.setAttribute("class", "linterna-magica-controls");

    var self =this;

    var play = document.createElement("a");
    play.setAttribute("class", "linterna-magica-controls-buttons "+
		      "linterna-magica-controls-buttons-play");
    play.setAttribute("href", "#");
    play.setAttribute("title", _("Play"));
    play.textContent ="Pl";
    // Only pause button should be visible on autostart
    // Auto start only the firs object in the page
    if (this.autostart && id == 0)
    {
	play.style.setProperty("display", "none", "important");
    }

    play.addEventListener("click", function(ev)
    			  {
    			      ev.preventDefault();

			      this.style.
			       	  setProperty("display",
			       		      "none", "important");

			      this.nextSibling.style.
				  removeProperty("display");

    			      self.player.play.apply(self, [id]);

			      // Start the time ticker
			      self.player_timers[id] =
				  setInterval(
				      function()
				      {
					  self.ticker.apply(self, [id]);
				      }, 500);
    			  }, false);
    controls.appendChild(play);

    var pause = document.createElement("a");
    pause.setAttribute("class", "linterna-magica-controls-buttons "+
		       "linterna-magica-controls-buttons-pause");
    pause.setAttribute("href", "#");
    pause.setAttribute("title", _("Pause"));
    pause.textContent ="Pa";
    // Only play button should be visible if !autostart (and
    if (!this.autostart || id !=0)
    {
	pause.style.setProperty("display", "none", "important");
    }

    pause.addEventListener("click", function(ev)
    			   {
    			       ev.preventDefault();
			       this.style.
			       	   setProperty("display",
			       		       "none", "important");

			       this.previousSibling.style.
				   removeProperty("display");

    			       self.player.pause.apply(self, [id]);

			       // Stop the time ticker
			       clearInterval(self.player_timers[id]);
			       delete self.player_timers[id];
    			   }, false);
    controls.appendChild(pause);

    var stop = document.createElement("a");
    stop.setAttribute("class", "linterna-magica-controls-buttons "+
		      "linterna-magica-controls-buttons-stop");
    stop.setAttribute("href", "#");
    stop.setAttribute("title", _("Stop"));
    stop.textContent ="St";
    stop.addEventListener("click", function(ev)
    			  {
    			      ev.preventDefault();
			      // pause
			      this.previousSibling.style.
			       	  setProperty("display",
			       		      "none", "important");
			      // play
			      this.previousSibling.previousSibling.
			       	  style.removeProperty("display");

    			      self.player.stop.apply(self, [id]);

			      // Stop the time ticker
			      clearInterval(self.player_timers[id]);
			      delete self.player_timers[id];
    			  }, false);
    controls.appendChild(stop);


    // var seek_b = document.createElement("a");
    // seek_b.setAttribute("class", "linterna-magica-controls-buttons");
    // seek_b.setAttribute("href", "#");
    // seek_b.setAttribute("title", _("Seek 10 seconds backwards"));
    // seek_b.textContent ="Rw";
    // seek_b.addEventListener("click", function(ev)
    // 			    {
    // 				ev.preventDefault();
    // 				self.player.rewind.apply(self, [id]);
    // 			    }, false);
    // controls.appendChild(seek_b);

    // var seek_f = document.createElement("a");
    // seek_f.setAttribute("class", "linterna-magica-controls-buttons");
    // seek_f.setAttribute("href", "#")
    // seek_f.setAttribute("title", _("Seek 10 seconds forward"));
    // seek_f.textContent ="Fw";
    // seek_f.addEventListener("click", function(ev)
    // 			    {
    // 				ev.preventDefault();
    // 				self.player.forward.apply(self, [id]);
    // 			    }, false);
    // controls.appendChild(seek_f);


    var time_slider = document.createElement("div");
    time_slider.setAttribute("title", _("Time"));

    time_slider.setAttribute("class",
			     "linterna-magica-controls-horizontal-slider");

    // The slider width is calculated from
    // the object width.  We have 6 buttons
    // (width + border +padding +
    // margin). Remove the padding, margin,
    // border for each slider (2) : 2*x (
    // padding + border + margin)
    // The time slider uses 3/4 of the space
    var time_width = parseInt(((object_data.width - (4 * 21)) * 3/4)-12);
    time_slider.style.setProperty("width",
				  time_width+"px",
				  "important");

    time_slider.style.setProperty("position", "relative", "important");

    var mouse_scroll = /WebKit/i.test(navigator.userAgent) ?
	"mousewheel" : "DOMMouseScroll";

    time_slider.addEventListener(mouse_scroll, function(ev)
				 {
				     ev.preventDefault();
				     var pos = self.slider_control.
					 apply(self, [ev]);

				     if (pos.direction > 0)
				     {
					 self.player.forward.
					     apply(self,[id,pos.val])
				     }
				     else
				     {
					 self.player.rewind.
					     apply(self,[id,pos.val])
				     }

				 }, false);

    time_slider.addEventListener("click", function(ev)
				 {
				     ev.preventDefault();
				     // Stop the time ticker
				     clearInterval(self.player_timers[id]);
				     delete self.player_timers[id];

				     var pos =
					 self.slider_control.
					 apply(self, [ev]);

				     if (pos.direction > 0)
				     {
					 self.player.forward.
					     apply(self,[id,pos.val])
				     }
				     else
				     {
					 self.player.rewind.
					     apply(self,[id,pos.val])
				     }

				     self.player_timers[id] =
					 setInterval(
					     function()
					     {
						 self.ticker.apply(self,[id]);
					     }, 500);
				 }, false);


    var time_knob = document.createElement("a");
    time_knob.setAttribute("title", _("Time"));
    time_knob.setAttribute("class", "linterna-magica-controls-slider-knob");
    time_knob.setAttribute("id",
			   "linterna-magica-controls-time-slider-knob-"+id);
    time_knob.style.setProperty("left", "0px", "important");

    time_knob.setAttribute("href", "#");
    time_knob.addEventListener("mousedown", function(ev)
			       {
				   ev.preventDefault();
				   // Stop the time ticker
				   clearInterval(self.player_timers[id]);
				   delete self.player_timers[id];

				   self.slider_control.apply(self, [ev]);
			       }, false);

    time_slider.appendChild(time_knob);

    var time_text = document.createElement("span");
    time_text.style.display = "none";
    time_text.setAttribute("class", "linterna-magica-controls-slider-text");
    time_text.setAttribute("id",
			   "linterna-magica-controls-time-slider-text-"+id);
    time_text.textContent="--:--:--";
    time_text.style.setProperty("left",
				parseInt(time_width/2)+"px",
				"important");

    time_slider.appendChild(time_text);
    controls.appendChild(time_slider);


    // Appended after volume_knob. See below
    var volume_text = document.createElement("span");

    var volume_slider = document.createElement("div");
    volume_slider.setAttribute("class",
			       "linterna-magica-controls-horizontal-slider");
    volume_slider.setAttribute("title", _("Volume control"));

    // The slider width is calculated from
    // the object width.  We have 6 buttons
    // (width + border +padding +
    // margin) Remove the padding, margin,
    // border for each slider (2) : 2 * x (
    // padding + border + margin)
    // The volume slider uses 1/4 of the space
    var volume_width = parseInt(((object_data.width - (4 * 21)) * 1/4)-12);
    volume_slider.style.setProperty("width",
				    volume_width+"px",
				    "important");

    volume_slider.addEventListener(mouse_scroll, function(ev)
				   {
				       ev.preventDefault();
				       var pos =
					   self.slider_control.
					   apply(self, [ev]);

				       self.player.set_volume.
					   apply(self, [id, pos.val]);

				       volume_text.textContent = pos.val;
				   }, false);

    volume_slider.addEventListener("click", function(ev)
				   {
				       ev.preventDefault();
				       var pos =
					   self.slider_control.
					   apply(self, [ev]);

				       self.player.set_volume.
					   apply(self, [id, pos.val]);

				       volume_text.textContent = pos.val;
				   }, false);

    var volume_knob = document.createElement("a");
    volume_knob.setAttribute("class", "linterna-magica-controls-slider-knob");
    volume_knob.setAttribute("id",
			     "linterna-magica-controls-volume-slider-knob-"+id);
    // If this is enabled it crops the css image
    // Fixes the knob width for small object widths
    // volume_knob.style.setProperty("width",
    // 				  parseInt(volume_width*10/100)+"px",
    // 				  "important");
    volume_knob.style.setProperty("left", "0px", "important");
    volume_knob.setAttribute("href", "#");
    volume_knob.setAttribute("title", _("Volume control"));
    volume_knob.addEventListener("mousedown", function(ev)
				 {
				     ev.preventDefault();
				     self.slider_control.apply(self, [ev]);
				 }, false);

    volume_slider.appendChild(volume_knob);

    controls.appendChild(volume_slider);

    volume_text.setAttribute("class", "linterna-magica-controls-slider-text");

    volume_text.style.setProperty("left",
				  parseInt(volume_width/3)+"px",
				  "important");

    volume_text.textContent = "--";
    volume_slider.appendChild(volume_text);

    var mute = document.createElement("a");
    mute.setAttribute("class", "linterna-magica-controls-buttons "+
		      "linterna-magica-controls-buttons-mute");
    mute.setAttribute("href", "#");
    mute.setAttribute("title", _("Mute"));
    mute.textContent ="M";

    mute.addEventListener("click", function(ev)
			  {
			      ev.preventDefault();
			      var volume =
				  self.player.toggle_mute.apply(self,[id]);

			      if (/M/i.test(mute.textContent))
			      {
				  mute.textContent = "U";
				  mute.setAttribute("title", _("Unmute"));

				  mute.setAttribute(
				      "class",
				      "linterna-magica-controls-buttons "+
					  "linterna-magica-controls-"+
					  "buttons-unmute");
				  volume_text.textContent = "0%";
				  volume_text.setAttribute("title",
							   _("Muted"));
				  volume_slider.setAttribute("title",
							     _("Muted"));
				  volume_knob.setAttribute("title",
							   _("Muted"));
			      }
			      else
			      {
				  mute.textContent = "M";
				  mute.setAttribute("title", _("Mute"));
				  volume_text.textContent = volume;

				  volume_text.removeAttribute("title");
				  mute.setAttribute(
				      "class",
				      "linterna-magica-controls-buttons "+
					  "linterna-magica-controls-"+
					  "buttons-mute");

				  volume_slider.
				      setAttribute("title",
						   _("Volume control"));
				  volume_knob.
				      setAttribute("title",
						   _("Volume control"));
			      }


			  },false);
    controls.appendChild(mute);

    var fullscreen = document.createElement("a");
    fullscreen.setAttribute(
	"class", "linterna-magica-controls-buttons "+
	    "linterna-magica-controls-buttons-fullscreen");
    fullscreen.setAttribute("href", "#");
    fullscreen.setAttribute("title", _("Fullscreen"));
    fullscreen.textContent ="Fs";
    fullscreen.addEventListener("click", function(ev)
    				{
    				    ev.preventDefault();
    				    self.player.fullscreen.apply(self, [id]);
    				}, false);
    controls.appendChild(fullscreen);

    return controls;
}
