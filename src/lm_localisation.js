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

// Localization
var languages =
    {
	"bg":
	{
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
	    "Aug":"авг",
	    "Sep": "сеп",
	    "Oct": "окт",
	    "Noe":"ное",
	    "Dec":"дек",
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

// Localization function
// Checks if there is translation for the default browser language and
// then if the string is translated into that language. If no translation
// is found the string is returned as-is (en);
function _(string)
{
    var lang = navigator.language.substring(0,2);

    return languages[lang] ? languages[lang][string] ?
    	languages[lang][string] : string : string ;
}
