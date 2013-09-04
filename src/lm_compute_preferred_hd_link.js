//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2011  Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Compute which HD link should be used for playback according to user
// preferences.
LinternaMagica.prototype.compute_preferred_hd_link = function(hd_links)
{
    var preferred_link_index = null;

    if (this.preferred_hd_quality > 0)
    {
	// Link number
	if (hd_links[this.preferred_hd_quality])
	{
	    // Exact match
	    preferred_link_index = this.preferred_hd_quality;
	}
	else
	{
	    // Must be higher then the total number of links. Choose
	    // highest.
	    preferred_link_index = hd_links.length;
	}
    }
    else if (this.preferred_hd_quality < 0)
    {
	// In Percents
	// See https://savannah.nongnu.org/task/index.php?11085

	// This is negative on purpose, so it could be detected in
	// this if block.
	var quality = Math.abs(this.preferred_hd_quality);
	preferred_link_index = Math.floor(((hd_links.length)*quality));
    }
    else if (/^[0-9]+p$/i.test(this.preferred_hd_quality))
    {
	var match = this.preferred_hd_quality.split(/p/)[0];
	var width_re = new RegExp(
	    match);
	var width_format_re = new RegExp(
	    match+".*"+this.format,
	"i");


	var hd_index = -1;
	for (var i=0,l=hd_links.length; i<l; i++)
	{
	    if (width_re.test(hd_links[i].label))
	    {
		hd_index = hd_links.length - i;
	    }

	    if (width_format_re.test(hd_links[i].label))
	    {
		hd_index = hd_links.length - i;
		break;
	    }

	}

	preferred_link_index = (hd_index >=0) ? hd_index : 0;
    }

    // Ensure correct index. The hd_links.length is greater by one
    // then the number of links.
    if (preferred_link_index == 0)
    {
	preferred_link_index = 1;
    }

    // Special case for two links and quality > 50%. The rounding
    // makes the second link available after 75%. That is not what we
    // want.
    if (Math.abs(this.preferred_hd_quality) > 0.5 &&
	hd_links.length == 2)
    {
	preferred_link_index = hd_links.length;
    }

    return Math.abs(hd_links.length-preferred_link_index);
}
