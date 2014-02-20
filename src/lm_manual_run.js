//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2014 Ivaylo Valkov <ivaylo@e-valkov.org>
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

LinternaMagicaManualRun = function(config)
{
    this.lm_config = config;
    this.create_manual_start_button();
}

LinternaMagicaManualRun.prototype.create_manual_start_button = function()
{
    var side_button = document.createElement("p");
    side_button.setAttribute('class', 'linterna-magica-manual-start-button-wrap');
    side_button.setAttribute('id', 'linterna-magica-manual-start-button-wrap');

    var logo = this.create_manual_start_link();
    logo.textContent = '';
    logo.setAttribute('class',
		      'linterna-magica-manual-start-button');
    
    side_button.appendChild(logo);

    var play_icon = document.createElement('span');
    play_icon.setAttribute('class', 'linterna-magica-manual-start-'+
			     'button-play-icon');

    var self = this;
    var start_click_fn = function(ev)
    {
	ev.preventDefault();
	var el = this;
	self.start_linterna_magica.apply(self, [ev, el]);
    }

    logo.addEventListener("click", start_click_fn, false);

    logo.appendChild(play_icon);

    var close = this.create_manual_start_close_link();

    side_button.appendChild(close);

    close.addEventListener("click", this.remove_manual_start, false);

    document.body.appendChild(side_button);
}

LinternaMagicaManualRun.prototype.create_manual_start_link = function()
{
    var text = this._("Start Linterna M\u00e1gica");
    var link = document.createElement("a");
    link.setAttribute("href","#");
    link.textContent = text;
    link.setAttribute("title", text);

    return link;
}

LinternaMagicaManualRun.prototype.create_manual_start_close_link = function()
{
    var close = document.createElement("a");
    close.textContent="x";
    close.setAttribute("href", "#");
    close.setAttribute("class", "linterna-magica-manual-start-"+
		       "button-close")
    close.setAttribute("title", this._("Remove this button"));

    return close;
} 


LinternaMagicaManualRun.prototype.start_linterna_magica =
function(event, element)
{
    var larerna_magica = new LinternaMagica(this.lm_config);
    this.remove_manual_start(event,element);
}

LinternaMagicaManualRun.prototype.remove_manual_start =
function(event, element)
{
    event.preventDefault();
    var manual_start = 
	document.getElementById('linterna-magica-manual-start-'+
				'button-wrap');

    if (!manual_start)
    {
	return null;
    }

    manual_start.parentNode.removeChild(manual_start);
}

LinternaMagicaManualRun.prototype._ = function(string)
{
    return LinternaMagica.prototype._(string);
}
