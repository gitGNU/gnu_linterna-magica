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
	this.name+_(" version: ")+this.version);
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

    // Info
    p = document.createElement("p");
    text = document.createTextNode(this.description);
    p.appendChild(text);
    box.appendChild(p);

    // License
    p = document.createElement("p");
    text = document.createTextNode(this.license);
    p.appendChild(text);
    box.appendChild(p);

    // The links are wrapped in object with data: URI scheme. This
    // will not send referrer. The page where the user was is not
    // sent.
    var license_and_home_page = document.createElement("object");

    // Duplication in lm_check_for_updates.js:
    // LinternaMagica.create_update_info_box();
    var script_data = function(){
	var a =  document.getElementsByTagName("a");
	// Simulate the click as if it was in the parent
	// window. Otherwise it is opened in the <object>
	var click = function(ev)
	{
	    // Don't mess with middle button clicks.  Epiphany for
	    // example has an extension that opens new tabs with
	    // middle click. Same with FF.
	    if (ev.button == 1)
	    {
		return true;
	    }

	    ev.preventDefault();
	    window.parent.location = this.href;
	}
	for (var i=0; i<a.length; i++)
	{
	    // WebKit crashes with translated text.
	    // encode and then decode the text
	    a[i].textContent = decodeURI(a[i].textContent);
	    a[i].addEventListener("click", click, false);
	}
    };

    // FIXME: Style will be different with changes in the stylesheet.
    var data = "<html><head></head><body>"+
	"<a href='"+this.license_link+"' >"+
	this.license_link+"</a>"+
	"<a href='"+this.homepage+"' style='margin-top: 10px !important;' >"+
	// WebKit crashes with translated text.
	// encode and then decode the text
	encodeURI(_("Linterna Mágica Home page"))+"</a>"+
	"<style>"+
	"a { color:#bbbbbb; text-decoration: uderline; "+
	"font-style:none; font-family: 'Liberation Sans',"+
	" 'Arial', sans-serif  !important; "+
	"display: block !important; "+
	"font-size: 12px !important;"+
	 "line-height: 1.3em !important;"+
	"font-weight: normal !important;"+
	"}"+
	"</style>"+
	"<script type='text/javascript'>"+
	"("+script_data.toString()+")();"+
	"</script>"+
	"</body></html>";

    license_and_home_page.data = 
	"data:text/html;charset=UTF-8;base64,"+btoa(data);

    box.appendChild(license_and_home_page);

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
