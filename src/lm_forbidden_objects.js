//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2010, 2011, 2012  Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Array of regulgar expressions for objects to be skipped
// For example objects that have video id but are not the
// video object (ads and other)
LinternaMagica.prototype.skip_objects =
    [ "brozar[a-z0-9]+_.*_scroll",
      "flashRateObject", "VideoCharts", 
      // Facebook iframes in blip.tv
      "^f[0-9]+[a-z]+",
      // Facebook frame at Indieflix.com
      "^fb[0-9]+[a-z]+",
      // Blip.tv objects
      "easyXDM_DISQUS_net_default[0-9]+_provider",
      // livestream.com
      "twitterIframe"];

// Skip objects that has id matching a regex (see above array)
LinternaMagica.prototype.skip_object_if_id = function(id_string)
{
    if (!id_string)
	return false;

    if (!this.skip_objects_re)
    {
	this.skip_objects_re = new RegExp (
	    this.skip_objects.join("|"),
	    "i");

	this.log("LinternaMagica.skip_object_if_id:\n"+
		 "No skip_objects regular expression. Creating : "+
		 this.skip_objects_re,5);

    }

    if (id_string.match(this.skip_objects_re))
    {
	this.log("LinternaMagica.skip_object_if_id:\n"+
		 "Skipping forbiden object with id "+id_string,1);

	return true;
    }

    return false;
}

// Array of regular expressions for object to be removed. For example
// object that are overlaping linterna magica. (reuters.com)
LinternaMagica.prototype.delete_objects = [ "videosync", "videoad" ];

// Delete objects that has id matching a regex (see above array)
LinternaMagica.prototype.delete_object_if_id = function(id_string)
{
    if (!id_string)
	return false;

    if (!this.delete_objects_re)
    {
	this.delete_objects_re = new RegExp (
	    this.delete_objects.join("|"),
	    "i");

	this.log("LinternaMagica.delete_object_if_id:\n"+
		 "No delete_objects regular expression. Creating : "+
		 this.delete_objects_re,5);

    }

    if (id_string.match(this.delete_objects_re))
    {
	this.log("LinternaMagica.delete_object_if_id:\n"+
		 "Deleting forbiden object with id "+id_string,1);

	return true;
    }

    return false;
}
