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

    // Translators 
    if (this.languages[this.lang] &&
	this.languages[this.lang].__translators)
    {
	var transl = null;
	if (typeof (this.languages[this.lang].__translators) == "object")
	{
	    transl = this.languages[this.lang].__translators;
	}
	else
	{
	    transl = new Array();
	    transl.push(this.languages[this.lang].__translators);
	}

	p = document.createElement("p");
	text = document.createTextNode(this._("Translation")+":");
	p.appendChild(text);
	box.appendChild(p);

	for (var l=0, length=transl.length; l< length; l++)
	{
	    p = document.createElement("p");
	    text = document.createTextNode(transl[l]);
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

    p = document.createElement('p');
    p.appendChild(license_link);
    box.appendChild(p);

    var homepage = this.pack_external_link(this.homepage,
					   this._("Linterna Mágica Home page"));

    p = document.createElement('p');
    p.appendChild(homepage);
    box.appendChild(p);

    // We want this for small objects. Scroll bars will be visible and
    // license and home page links accessible.
    if (!/youtube\.com/i.test(window.location.hostname))
    {
	box.style.setProperty("overflow", "auto", "important");
    }

    return box;
}

// Information for the script.
LinternaMagica.prototype.about = function(event, element)
{
    event.preventDefault();

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

    var local_log = 
	document.getElementById("linterna-magica-web-log-clone-"+id);

    if (about)
    {
	// Ensure that the updates box is hidden.
	if (updates && !updates.style.display)
	{
	    updates.style.setProperty("display","none", "important");
	}

	// Ensure that the web log  box is hidden/removed.
	if (local_log)
	{
	    obj.parentNode.removeChild(local_log);
	}

	if(about.style.display)
	{
	    about.style.removeProperty("display");
	    obj.style.setProperty("display","none", "important");
	}
	else
	{
	    about.style.setProperty("display","none", "important");
	    obj.style.removeProperty("display");
	}
    }
}
