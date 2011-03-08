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

// Detect facebook flash upgrade warning This is called withing
// setInterval. It is needed because when the elements with the
// warning are inserted all our data that has been added before that
// is removed.
LinternaMagica.prototype.detect_facebook_flash_upgrade = function(object_data)
{
    this.facebook_flash_upgrade_counter++;

    var child = object_data.parent.firstChild;
    var insert_object = null;

    // 10 seconds with 500ms interval
    if (this.facebook_flash_upgrade_counter >= 20 ||
	// Gnash is installed and we have DOM object
	(child &&  /embed|object/i.test(child.localName)) ||
	// We found a warning
	(child && /flash|player/i.test(child.textContent)))
    {
	clearInterval(this.facebook_flash_upgrade_timeout);

	this.log("LinternaMagica.detect_facebook_flash_upgrade:\n"+
		 "Removing plugin install warning.",2);

	this.remove_plugin_install_warning(object_data.parent);

	this.log("LinternaMagica.detect_facebook_flash_upgrade:\n"+
		 "Creating video object.",2);

	this.create_video_object(object_data);
    }
}
