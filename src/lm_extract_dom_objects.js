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

// Searches in the DOM (or in an html element)
// for flash objects. For every found object with video link
// a clean video object is created
LinternaMagica.prototype.extract_objects_from_dom = function(element)
{
    if (!element)
	var element = document;

    var objects = this.create_object_list(element);

    for (var i=0, l=objects.length; i< l ; i++)
    {
	var object = objects[i];

	if (object.hasAttribute("linterna_magica_id"))
	{
	    this.log("LinternaMagica.extract_objects_from_dom:\n"+
		     "Skipping processed object with linterna_magica_id:"+
		     object.getAttribute("linterna_magica_id"),2);
	    continue;
	}

	var object_data = new Object();

	if (this.skip_object_if_id(object.getAttribute("id")))
	{
	    continue;
	}

	if (this.delete_object_if_id(object.getAttribute("id")))
	{
	    // If it disappears or we have deleted it.  Occured in
	    // reuters.com while trying to remove it several
	    // times. Loop somewhere?
	    if (object &&
		document.getElementById(object.getAttribute("id")) &&
		object.parentNode)
	    {
		object.parentNode.removeChild(object);
	    }

	    continue;
	}

     	if (this.is_swf_object(object)
     	    || (this.is_swf_object(object)
     		&& !this.is_swf_object(object.parentNode)))
     	{
	    if (/dailymotion\.com/i.test(window.location.hostname))
	    {
		var extracted_data = new Object();
		extracted_data.video_id = window.location.pathname;
	    }
	    else
	    {
		this.create_param_list(object);
		var extracted_data = this.extract_link_from_param_list();
	    }


	    object_data.remote_site_link = extracted_data.remote_site_link;
	    object_data.link = extracted_data.link;
	    object_data.video_id = extracted_data.video_id;
	    object_data.hd_links =
		extracted_data.hd_links || null;

	   

	    if (!object_data.link && !object_data.video_id && 
		!object_data.remote_site_link)
	    {
		this.log("LinternaMagica.extract_objects_from_dom:\n"+
			 "No video_id, link or remote site link"+
			 " found. Not creating video oject or remote"+
			 " video button.",1);
		continue;
	    }

	    if (/myvideo\.de/i.test(window.location.hostname) &&
		object_data.video_id)
	    {
		// See the comments for this function
		object_data.link = this.create_myvideode_link();
		// Now that we have a link remove the video_id
		// so it is not processed
		if (object_data.link)
		{
		    object_data.video_id = null;
		}
	    }

	    var parent = object.parentNode.localName.toLowerCase();
	    // Remove all the junk.
	    if (parent === "object" ||
		parent === "embed")
	    {
		this.log("LinternaMagica.extract_objects_from_dom:\n"+
			 "Using <"+object.localName+"> parentNode: <"+
			 object.parentNode.localName+">.",1);

	
		this.dirty_objects.push(object.parentNode);

		// Mark the parent object as procressed because it will
		// be detected again when the video object is
		// insterted/created
		object.parentNode.setAttribute("linterna_magica_id",
					       (this.dirty_objects.length-1));

		object_data.parent = object.parentNode.parentNode;

		// We need to use parent object/emebd so if data is
		// missing it can be extracted from parent wrapper
		// element (div/span)
		object_data.width = this.extract_object_width(
		    object.parentNode);

		object_data.height = this.extract_object_height(
		    object.parentNode);
	    }
	    else
	    {
		// Do not process objects without parent.  This bug
		// showed up at i-kat.org. The site uses an object inline
		// in another one and both have video link. When the
		// parent object is processed and replaced with a video
		// object, the second (child of the first) looses its
		// parent and Linterna Mágica crashes. There might be a
		// better solution to this. It acctualy crashes just
		// before/after calling remove_plugin_install_warning.
		if (!object.parentNode)
		{
		    this.log("LinternaMagica.extract_objects_from_dom:\n"+
			     "Object's parent node dissapeared."+
			     " No link found (yet) in this object.",1);
		    return null;
		}

		this.dirty_objects.push(object);
		object_data.parent = object.parentNode;

		object_data.width = this.extract_object_width(object);
		object_data.height = this.extract_object_height(object);
	    }

	    // Prevent second processing of this object
	    object.setAttribute("linterna_magica_id",
				(this.dirty_objects.length-1));

	    this.log("LinternaMagica.extract_objects_from_dom:\n"+
		     "Object linterna_magica_id set to: "+
		     object.getAttribute("linterna_magica_id"),2);

	    object_data.linterna_magica_id =
		object.getAttribute("linterna_magica_id");

	    if (object_data.remote_site_link)
	    {
		this.log("LinternaMagica.extract_objects_from_dom:\n"+
			 "Link to remote site found."+
			 " Adding redirect button.",1);
		
		var remote_site = 
		    this.create_remote_site_link(object_data);
		var lm_id = object_data.linterna_magica_id;
		var before =  this.dirty_objects[lm_id].nextSibling;

		if (before)
		{
		    object_data.parent.insertBefore(remote_site, before);
		    }
		else
		{
		    object_data.parent.appendChild(remote_site);
		}
		// We only need:
		// * linetrna_magica_id attribute set;
		// * object_data.parent set;
		// * the <object><embed/><object> detected.
		continue;
	    } 
	    else if (object_data.link)
	    {
		this.log("LinternaMagica.extract_objects_from_dom:\n"+
			 "Removing plugin install warning.",2);

		// Do not process objects without parent.  This bug
		// showed up at i-kat.org. The site uses an object
		// inline in another one and both have video
		// link. When the parent object is processed and
		// replaced with a video object, the second (child of
		// the first) looses its parent and Linterna Mágica
		// crashes. There might be a better solution to this.
		if (!object_data.parent)
		{
		    this.log("LinternaMagica.extract_objects_from_dom:\n"+
			     "Object's parent node dissapeared."+
			     "A link is found for this object.",1);

		    return null;
		}

		this.remove_plugin_install_warning(object_data.parent);

		this.log("LinternaMagica.extract_objects_from_dom:\n"+
			 "Creating video object.",1);
		this.create_video_object(object_data);
	    }
	    else if (object_data.video_id)
	    {
		this.log("LinternaMagica.extract_objects_from_dom:\n"+
			 "Requesting video link via video_id "+
			 object_data.video_id,1);

		// Wait a while for Dailymotion At the beginning it
		// seemed that cookies are not set for few seconds.
		if (/dailymotion\.com/i.test(window.location.hostname))
		{
		    var data = object_data;
		    var self = this;
		    setTimeout(function() {
			self.request_video_link.apply(self,[data]);
		    }, this.wait_dailymotion);
		}
		else
		{
		    this.request_video_link(object_data);
		}
	    }
	}
	else
	{
	    this.log("LinternaMagica.extract_objects_from_dom:\n"+
		     "Skipping object #"+i,1);

	    // +
	    // ". Parent node HTML: "+
	    // objects[i].parentNode.innerHTML,5);

	}
    }
}

// Find the flash object width
LinternaMagica.prototype.extract_object_width = function(element)
{
    if (!/HTML(embed|object)element/i.test(element))
	return null;
    // Bug see comments in is_swf_object
    // if (typeof(element) !== "object")
    // 	return null;

    var width = null ;

    if (element.hasAttribute("width")
	&& !/\%/.test(element.getAttribute("width")))
    {
	width = element.getAttribute("width");
    }
    else if (element.clientWidth)
    {
	width = element.clientWidth;
    }
    else if (element.offsetWidth)
    {
	width = element.offsetWidth;
    }
    else if(element.parentNode.clientWidth)
    {
	width = element.parentNode.clientWidth;
    }
    else
    {
	width = element.parentNode.offsetWidth;
    }


    if (!width)
    {
	width = 300;
    }

    return width;
}

// Find the flash object height
LinternaMagica.prototype.extract_object_height = function(element)
{
    if (!/HTML(embed|object)element/i.test(element))
	return null;
    // Bug see comments in is_swf_object
    // if (typeof(element) !== "object")
    // 	return null;

    var height = null ;

    if (element.hasAttribute("height")
	&& !/\%/.test(element.getAttribute("height")))
    {
	height = element.getAttribute("height");
    }
    else if (element.clientHeight)
    {
	height = element.clientHeight;
    }
    // Fix small height in Google Video with IceCat, Abrowser etc.
    // Skip to parent height. The object has embed child node with
    // valid height. Because the parent is object we use it instead.
    else if (element.offsetHeight && !/video\.google\./i.test(window.location.href))
    {
	height = element.offsetHeight;
    }
    else if (element.parentNode.clientHeight)
    {
	height = element.parentNode.clientHeight;
    }
    else if(element.parentNode.clientHeight)
    {
	height = element.parentNode.clientHeight;
    }
    else
    {
	height = element.parentNode.offsetHeight;
    }

    if (!height)
    {
	height = 150;
    }

    return height;
}

//  Searches through array of param and attributes
// for video link or id pointing to the link
LinternaMagica.prototype.extract_link_from_param_list = function()
{
    // create_param_list was not called.
    if (!this.param_list)
    {
	return null;
    }

    var params = this.param_list;
    var extracted = new Object();

    for(var p=0, lenp=params.length; p < lenp; p++)
    {
	var param = params[p];

	if(/flashvars|movie|data|src/i.test(param.name))
	{

	    this.log("LinternaMagica.extract_objects_from_dom:\n"+
	     	     "Checking if param "+param.name+
		     " is matching remote site.",1);
    
	    this.detect_remotely_embeded = param.value;
	    extracted.remote_site_link = this.detect_object_in_remote_site();

	    if (extracted.remote_site_link)
	    {
		// No point to match other
		break;
	    }

	    // This bloats FF in youtube:
	    // LinternaMagica.extract_link_from_param_list: Trying
	    // to extract a link from param/attribute "flashvars"
	    // at www.youtube.com time: ***14:58:59:999***
	    // LinternaMagica.extract_link: No link found. at
	    // www.youtube.com time: ***15:12:21:356***
	    if (!/youtube\.com/i.test(window.location.hostname) &&
		!/youtube-nocookie\.com/i.test(window.location.hostname))
	    {
		this.log("LinternaMagica.extract_link_from_param_list:\n"+
			 "Trying to extract a link from"+
			 " param/attribute \""+param.name+"\"",4);

		if (!extracted.link)
		{
		    this.extract_link_data = param.value;
		    extracted.link = this.extract_link();
		}
	    }

	    if (!extracted.link)
	    {
		this.log("LinternaMagica.extract_link_from_param_list:\n"+
			 "Trying to extract video_id from"+
		     	 " param/attribute \""+param.name+"\"",4);

		if (!extracted.video_id)
		{
		    this.extract_video_id_data = param.value;
		    extracted.video_id = this.extract_video_id();
		}
	    }
	}

	if (/ted\.com/i.test(window.location.hostname))
	{
	    if (extracted.link)
	    {
		this.log("LinternaMagica.extract_link_from_param_list:\n"+
			 "Trying to extract ted.com HD links ",1);
		extracted.hd_links =
		    this.extract_tedcom_hd_links(param.value);
		break;
	    }
	}
	else
	{
	    if (extracted.link || extracted.video_id)
		break;
	}
    }

    return extracted;
}

// Search for embed && object elements
// and return an array with found elements
LinternaMagica.prototype.create_object_list = function(element)
{
    if (!element)
	var element = document;

    var o = element.getElementsByTagName("object");
    var e = element.getElementsByTagName("embed");
    // Support for remotely embedded clips. Some sites use iframe to
    // embed.
    var ifr = element.getElementsByTagName("iframe");

    var objects = new Array();

    for (var i=0, l=e.length; i <l; i++)
    {
	objects.push(e[i]);
    }

    for (var i=0, l=o.length; i <l; i++)
    {
	objects.push(o[i]);
    }

    for (var i=0, l=ifr.length; i <l; i++)
    {
	objects.push(ifr[i]);
    }

    return objects;
}

// Make an array of possible locations to find the flash object
// paramaeters (<param> elements and arguments attribute)
LinternaMagica.prototype.create_param_list = function(element)
{
    if (!element)
	return null;

    var par = element.getElementsByTagName("param");
    var params = new Array();

    for  (var p=0, lenp=par.length; p <lenp; p++)
    {
	params.push(par[p]);
    }

    for  (var p =0, lenp=element.attributes.length; p <lenp; p++)
    {
	params.push(element.attributes[p]);
    }

    this.param_list = params;
}
