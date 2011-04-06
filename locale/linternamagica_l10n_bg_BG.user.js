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

// ==UserScript==
// @name           Linterna Mágica l10n bg_BG
// @namespace Linterna Mágica
// @description  Bulgarian localisation for Linterna Mágica.
// @include        http://*
// @include        https://*

// ==/UserScript==

var LM_L10N  =
    {
	"bg_BG": 
	{
	    __translators: ["Ивайло Вълков <ivaylo@e-valkov.org>",],
	    __direction: "ltr",
	    "Translation": "Превод",
	    "Download": "Запазване",
	    "Save the video clip": "Запазване на видео клипа",
	    "Loading video...": "Зареждане на клипа…",
	    "Plugin": "Приставка",
	    "Switch between flash plugin and Linterna Mágica":
	    "Превключване между приставката за флаш и Linterna Mágica",
	    "Waiting for video plugin...":
	    "Изчакване на приставката за видео клипове…",
	    "About": "Относно",
	    "Linterna Mágica Home page":
	    "Уеб страница на Linterna Mágica",
	    "Stop": "Спиране",
	    "Play": "Изпълнение",
	    "Pause": "Пауза",
	    "Time": "Време",
	    "Volume control": "Сила на звука",
	    "Mute": "Заглушаване",
	    "Muted": "Заглушен",
	    "Unmute": "Премахване на заглушаването",
	    "Fullscreen": "На цял екран",
	    "Loading": "Зареждане",
	    "Buffering": "Буфериране",
	    "Higher quality": "Високо качество",
	    " version: ": " версия: ",
	    "This program is free software; ":
	    "Тази програма е свободен софтуер. ",
	    "you can redistribute it and/or ":
	    "Можете да я разпространявате и/или ",
	    "modify it under the terms of the ":
	    "променяте под условията на ",
	    "GNU  General Public License (GNU GPL)":
	    "Общия публичен лиценз на GNU (GNU GPL)",
	    " version 3 (or later). ":
	    " — версия 3 на лиценза или по-късна. ",
	    "A copy of the license can be downloaded from ":
	    "Копие на лиценза можете да изтеглите от ",
	    "Watch video on the web ": "Гледайте уеб видео клипове ",
	    "in a brand new way: ":"по напълно нов начин: ",
	    "You don't need a glint, ":"Нямате нужда от проблясъци, ",
	    "the magic lantern is ignited!":"вълшебният фенер е разпален!",
	    "New version": "Нова версия",
	    "Date":"Дата",
	    "Update": "Обновление",
	    "Jan": "яну",
	    "Feb": "фев",
	    "Mar": "мар",
	    "Apr": "апр",
	    "May": "май",
	    "Jun": "юни",
	    "Jul": "юли",
	    "Aug": "авг",
	    "Sep": "сеп",
	    "Oct": "окт",
	    "Noe": "ное",
	    "Dec": "дек",
	    "New version is available.":"Налична е нова версия.",
	    "released at":"публикувана на",
	    "Read the news section at the home page":
	    "Прочетете новините на уеб страницата",
	    "Linterna Mágica error and debug messages":
	    "Съобщения за отстраняване на грешки в Linterna Mágica",
	    "Debug messages": "Отстраняване на грешки",
	    "Remove log": "Премахване на обекта",
	    "Show/hide debug messages": 
	    "Показване/скриване на съобщенията за отстраняване на грешки",
	    "Watch this video at it's original site with Linterna Mágica":
	    "Гледайте този видео клип на неговата уеб страница с Linterna Mágica",
	},
    };

// Do NOT edit past this line.

var head = document.getElementsByTagName("head")[0];
var script = document.createElement("script");

script.setAttribute("type", "text/javascript");

var script_data = 
    "if (window.LinternaMagica_L10N == undefined)"+
    "{"+
    "window.LinternaMagica_L10N = new Object();"+
    "}; ";

for (var o in LM_L10N)
{
    script_data += "window.LinternaMagica_L10N['"+o+ "'] = "; 
    if (typeof(LM_L10N[o]) == 'object')
    {
	script_data += "{";
	for (var oo in LM_L10N[o])
	{
	    if (oo == "__translators" &&
		typeof(LM_L10N[o][oo]) == "object")
	    {
		console.log("DIBIBIBI ");
		script_data += '"'+oo+ '" : ["' +
		    LM_L10N[o][oo].join('","')+'"],';
	    }
	    else
	    {
		// String or number
		script_data += '"'+oo+ '" : "' +LM_L10N[o][oo]+'",';
	    }
	}
	script_data += "};";
    }
    else
    {
	script_data += '"'+LM_L10N[o]+'"';
    }
}

script_data += ";";

script.textContent = script_data;

head.appendChild(script);

head.removeChild(script);
LM_L10N = undefined;
