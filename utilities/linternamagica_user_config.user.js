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

// ==UserScript==
// @name           Linterna Mágica user config
// @namespace Linterna Mágica
// @description  Useful if you want to keep your configuration intact when new version of Linterna Mágica is installed.
// @include        http://*
// @include        https://*

// ==/UserScript==

// This userscript is not updated on purpose. You will have to add
// newer options from future versions manually. If an option is
// missing, the one provided by the main userscript will be used.

var linterna_magica_user_config = {
    "debug": 0,
    "log_to": "web",
    "updates": "1w",
    "priority": "html5, self, plugin",
    "autostart": "on",
    "controls": "self",
    "locale": "auto",
    "cookies": "restore",
    "wait_xhr": "off",
};

// Do NOT edit past this line.

var script = document.createElement("script");
var script_data = "window.linterna_magica_user_config = {" ; 
for (var o in linterna_magica_user_config)
{
    script_data += "'"+o+ "' : '"+linterna_magica_user_config[o]+"',";
}

script_data += "};";

script.textContent = script_data;

var head = document.getElementsByTagName("head")[0];
script.setAttribute("type", "text/javascript");
head.appendChild(script);

head.removeChild(script);
script_data = undefined;
script = undefined;
