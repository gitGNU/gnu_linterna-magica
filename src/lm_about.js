//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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

// The information show in the place of the video object
LinternaMagica.prototype.create_about_box = function(id)
{
    var box = document.createElement("div");
    box.style.setProperty("display", "none", "important");
    box.setAttribute("id", "linterna-magica-about-box-"+id);
    box.setAttribute("class", "linterna-magica-about-box");

    var p = document.createElement("p");
    var text = document.createTextNode(
	this.name+this._(" version: ")+this.version);
    p.appendChild(text);
    box.appendChild(p);

    // Authors
    for (var l=0, length=this.copyrights.length; l< length; l++)
    {
	p = document.createElement("p");
	text = document.createTextNode(this.copyrights[l]);
	p.appendChild(text);
	box.appendChild(p);
    }

    // Extract translators 
    if (this.languages[this.lang] &&
	this.languages[this.lang].__translators)
    {
	var translation = null;

	if (typeof (this.languages[this.lang].__translators) == "object")
	{
	    translation = this.languages[this.lang].__translators;
	}
	else
	{
	    translation = new Array();
	    translation.push(this.languages[this.lang].__translators);
	}

	p = document.createElement("p");

	// Translated by
	text = document.createTextNode(this._("Translation")+":");
	p.appendChild(text);
	box.appendChild(p);

	for (var l=0, length=translation.length; l< length; l++)
	{
	    p = document.createElement("p");
	    text = document.createTextNode(translation[l]);
	    p.appendChild(text);
	    box.appendChild(p);
	}
    }

    // Info
    p = document.createElement("p");
    text = document.createTextNode(this.description());
    p.appendChild(text);
    box.appendChild(p);

    // License
    p = document.createElement("p");
    text = document.createTextNode(this.license());
    p.appendChild(text);
    box.appendChild(p);

    var license_link = this.pack_external_link(this.license_link,
					  this.license_link);

    license_link.setAttribute("title", this.license_link);
    p = document.createElement('p');
    p.appendChild(license_link);
    box.appendChild(p);

    var homepage = 
	this.pack_external_link(this.homepage,
				this._("Linterna M\u00e1gica Home page"));

    homepage.setAttribute("title", this.homepage);
    p = document.createElement('p');
    p.appendChild(homepage);
    box.appendChild(p);

    var savannah_link = 
	this.pack_external_link(
	    this.savannah_page,
	    this._("Linterna M\u00e1gica project page at Savannah"));

    savannah_link.setAttribute("title", this.savannah_page);
    p = document.createElement("p");
    p.appendChild(savannah_link);
    box.appendChild(p);

    var bug_report_link = 
	this.pack_external_link(
	    this.bug_report_link,
	    this._("Report a bug at our Savannah project page"));

    bug_report_link.setAttribute("title", this.bug_report_link);
    p = document.createElement("p");
    p.appendChild(bug_report_link);
    box.appendChild(p);

    var microblog_link = 
	this.pack_external_link(
	    this.microblog_link,
	    this._("Microblog notices about Linterna M\u00e1gica at Identi.ca"));

    microblog_link.setAttribute("title", this.microblog_link);
    p = document.createElement("p");
    p.appendChild(microblog_link);
    box.appendChild(p);

    p = document.createElement("p");
    var txt =  document.createTextNode(this._("Chat rooms"));
    p.appendChild(txt);
    box.appendChild(p);

    var rooms = this.chat_rooms();

    for (var r=0,l=rooms.length; r<l; r++)
    {
	var room = rooms[r] ;
	p = document.createElement("p");

	var room_link =
	    this.pack_external_link(room.url, room.room);

	room_link.setAttribute("title", room.url);

	var server_url = "http://"+room.server;
	var server_link =
	    this.pack_external_link(server_url, room.server);

	server_link.setAttribute("title", server_url);

	var txt_type = document.createTextNode(room.type+": ");
	var txt_at = document.createTextNode(" "+this._("at")+" ");

	p.appendChild(txt_type);
	p.appendChild(room_link);
	p.appendChild(txt_at);
	p.appendChild(server_link);
	box.appendChild(p);
    }

    return box;
}

// Information for the script.
LinternaMagica.prototype.about = function(event, element)
{
    if (event)
    {
	event.preventDefault();
    }

    // Get by Id. Finding the object by tag name is not good idea when
    // there are other objects in the header.
    var id = element.getAttribute("id");
    // linterna-magica-logo-<integer>
    id = id.split("-");
    id = id[id.length-1];

    var obj =  document.getElementById("linterna-magica-video-object-"+id);

    var about = document.getElementById("linterna-magica-about-box-"+id);
    
    var updates = document.
	getElementById("linterna-magica-update-info-box-"+id);

    if (about)
    {
	// Ensure that the updates box is hidden.
	if (updates && !updates.style.display)
	{
	    updates.style.setProperty("display","none", "important");
	}

	if(about.style.display)
	{
	    about.style.removeProperty("display");
	    this.hide_lm_video_object(id);
	}
	else
	{
	    about.style.setProperty("display","none", "important");
	    this.show_lm_video_object(id);
	}
    }
}
