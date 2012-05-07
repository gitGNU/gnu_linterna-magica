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



// Remove waringings about missing flash plugin, because they are annoying
// and useless now.
LinternaMagica.prototype.remove_plugin_install_warning = function(element)
{

    if (!element || typeof(element) != 'object')
    {
	return;
    }

    // Remove the slide show images behind the object in myvideo.de,
    // because they overlap with Linterna Magica. It is useless now.
    var teaser = document.getElementById("flash_teaser");
    if (teaser)
    {
	teaser.parentNode.removeChild(teaser);
    }

    // Warning/recommendation for newer flash version/update bellow
    // the player in YouTube. Annoying;
    var f10 = document.getElementById("flash10-promo-div");
    if (f10)
    {
	f10.parentNode.removeChild(f10);
    }

    var text_re = new RegExp (
	".*(flash|flash(\\\s*)player|shockwave).*",
	"i");

    var remove;
    var node = element.firstChild;
    var new_node = null;
    while (node)
    {
	remove = false;
	
	// Skip nodes with large sizes. Optimizes YouTube in Abrowser
	// 12.0 See bug #108013:
	// https://savannah.nongnu.org/support/index.php?108013
	var size = null;
	try {
	    size = (new XMLSerializer().serializeToString(node)).length;
	}
	catch(e)
	{
	    continue;
	}

	// Skip nodes larger than 5 KB
	if (size > 5120)
	{
	    node = node.nextSibling || null;
	    continue;
	}
	
	this.log("LinternaMagica.remove_plugin_install_warning:\n"+
		 "elements "+element.childNodes.length+
		 " node "+node,5);

	if (node.nextSibling)
	{
	    new_node = node.nextSibling;
	}
	else
	{
	    new_node = null;
	}

	// The embed/object is removed later
	if ( node.nodeType ==3 ||
	     (node.localName && node.localName.toLowerCase() != "object" &&
	      node.localName.toLowerCase() != "embed" ))
	{
	    this.log("LinternaMagica.remove_plugin_install_warning:\n"+
		     "Cheking node "+node,4);

	    if (node.textContent.match(text_re) ||
		(node.innerHTML && node.innerHTML.match(text_re)) ||
		(node.localName && /br/i.test(node.localName)) ||
		(node.localName && /img/i.test(node.localName)) ||
		(node.href && node.href.match(text_re)) ||
		// Flashblock in Youtube breaks layout
		(node.hasAttribute && 
		 node.hasAttribute("bginactive") &&
		 node.getAttribute("bginactive").match(/flashblock/)))
	    {
		this.log("LinternaMagica.remove_plugin_install_warning:\n"+
			 "Removing node "+node,4);

		// video.fensko.com has ancor and text node that share
		// the text. Leaving it is just irritating
		if (/^a$/i.test(node.localName) &&
		    node.nextSibling &&
		    node.nextSibling.nodeType === 3 &&
		    /player/i.test(node.nextSibling.textContent))
		{
		    this.log("LinternaMagica.remove_plugin_install_warning:\n"+
			     "Removing node's sibling sharing"+
			     " half the text "+node.nextSibling,4);

		    // Skip the next one because it is now deleted
		    new_node = node.nextSibling.nextSibling;
		    node.parentNode.removeChild(node.nextSibling);
		}

		node.parentNode.removeChild(node);
	    }
	}

	var self = this;
	var val = this.call_site_function_at_position.apply(self,[
	    "plugin_install_warning_loop",
	    window.location.hostname, node]);

	if (val && typeof(val) != "boolean")
	{
	    // Useless for now. The place where it is used
	    // (lm_site_bliptv.js) just removes the node on condition. 
	    node = val;
	}

	node = new_node;
    }

    var self = this;
    var val = this.call_site_function_at_position.apply(self,[
	"plugin_install_warning",
	window.location.hostname, node]);

    if (val && typeof(val) != "boolean")
    {
	// Useless for now. The place where it is used
	// (lm_site_clipovetecom.js) does not change the node.
	node = val;
    }
}
