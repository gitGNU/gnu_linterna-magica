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

LinternaMagica.prototype.sites["video.google.com"] = new Object();

// References to al Google Video domains
// http://en.wikipedia.org/wiki/Google_Videos#International
LinternaMagica.prototype.sites["video.google.com.au"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.com.br"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.ca"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.bg"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.cn"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.fr"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.de"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.it"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.nl"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.pl"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.es"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.co.uk"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.com.ar"] = "video.google.com";
LinternaMagica.prototype.sites["video.google.ru"] = "video.google.com";

// Needet to prevent blocking of the browser in the web search engine
// (images, video) See skip_script_processing().
LinternaMagica.prototype.sites["encrypted.google.com"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.com"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.com.au"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.com.br"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.ca"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.bg"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.cn"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.fr"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.de"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.it"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.nl"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.pl"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.es"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.co.uk"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.com.ar"] = "video.google.com";
LinternaMagica.prototype.sites["www.google.ru"] = "video.google.com";
LinternaMagica.prototype.sites["images.google.com"] = "video.google.com";

// See bug #108013:
// https://savannah.nongnu.org/support/index.php?108013
LinternaMagica.prototype.sites["video.google.com"].
skip_script_processing = function()
{
    // Skip script procerssing at all.
    return false;
}

LinternaMagica.prototype.sites["video.google.com"].set_video_link_regex =
function()
{
    var result = new Object();

    result.link_re = new RegExp (
	"videourl=(.*)\\\&(thumbnailurl)=(.*)" ,
	"i");

    result.link_position = 3;

    return result;
}

LinternaMagica.prototype.sites["video.google.com"].
    do_not_clean_amps_in_extracted_link =
function()
{
    // Just return false (reverse logic)
    return false;
}
