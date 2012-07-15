//  @licstart The following is the entire license notice for the
//  JavaScript code in this page (or file).
//
//  This file is part of Linterna Mágica
//
//  Copyright (C) 2012 Ivaylo Valkov <ivaylo@e-valkov.org>
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

// Commented so it is not included in build userscript. This way there
// is no need to set the file in the Makefile in the excluded files
// reule.

LinternaMagica.prototype.sites["viddler.com"] = new Object();

// Reference
LinternaMagica.prototype.sites["www.viddler.com"] = "viddler.com";

LinternaMagica.prototype.sites["viddler.com"].prepare_xhr =
function(object_data)
{
    var result = new Object();

    result.address = "/videos/"+object_data.video_id+
	"/lightbox?tab=download&view_video=0";

    return result;
}

LinternaMagica.prototype.sites["viddler.com"].process_xhr_response =
function(args)
{
    var object_data = args.object_data;
    var client = args.client;
    var xml = client.responseXML;

    if (!xml)
    {
	var html = '<html xmlns="http://www.w3.org/1999/xhtml">'+
            '<body><div>'+client.responseText+'</div></body></html>';
	
	if (window.DOMParser)
        {
	    try
	    {
		xml = (new DOMParser()).
                    parseFromString(html, "application/xml");
	    }
	    catch(e)
	    {
		this.log('LinternaMagica.sites["viddler.com"].'+
			 'process_xhr_response:\n'+
			 "Unable to parse XML string created"+
			 "from client.responseText.",4);
	    }
        }
    }

    if (!xml)
    {
	return null;
    }

    var file_desc = xml.querySelectorAll(".file-desc");

    if (!file_desc)
    {
	return null;
    }

    var hd_links = new Array();

    for (var i=0, l=file_desc.length;i<l; i++)
    {
	var link = new Object();

	// The data for every link has the following format
	// <tr class="">
	//   <td class="file-desc">_file type/container_</td>
	//   <td class="center">_width x height_</td>
	//   <td class="center file-size">_SIZE_</td>
	//   <td class="rjust"><a href="_URL_">Download</a></td>
	// </tr>

	var td = file_desc[i].parentNode.getElementsByTagName('td');

	link.label = td[1].textContent.
	    replace(/[0-9]+\s*x\s*/,'').replace(/$/, 'p')+" "+
	    td[0].textContent.replace(/Source\s*/,'');

	link.more_info = td[1].textContent.replace(/\s/g,'') + " "+
	    td[0].textContent+", "+
	    td[2].textContent;

	var url = td[3].getElementsByTagName('a');

	url =  (url && url[0]) ? url[0].getAttribute('href') : null;

	link.url = url;

	// Used locally for sorting. See sort_fun bellow.
	link.file_size = td[2].textContent.replace(/\s*MB\s*$/i,'');
	link.video_width = td[1].textContent.replace(/x.*/,'');

	hd_links.push(link);
    }

    // Sort the array by video width and file size, so the links show
    // properly in the HD links list with the highest quality at the
    // top.
    var sort_fun = function (a, b)
    {
	if (parseInt(a.video_width) > parseInt(b.video_width))
	{
	    return -1;
	}
	else if (parseInt(a.video_width) < parseInt(b.video_width))
	{
	    return 1;
	}
	else
	{
	    if (parseFloat(a.file_size) > parseFloat(b.file_size))
	    {
		return -1;
	    }
	    else if (parseFloat(a.file_size) <  parseFloat(b.file_size))
	    {
		return 1;
	    }
	    else
	    {
		return 0;
	    }

	    // This should never be reached, but anyhow.
	    return 0;
	}
    }

    hd_links.sort(sort_fun);

    object_data.link = (hd_links.length > 0) ? hd_links[0].url : null;
    object_data.hd_links = (hd_links.length > 1) ? hd_links : null;

    return object_data;
}
 
// See bug #108013:
// https://savannah.nongnu.org/support/index.php?108013
LinternaMagica.prototype.sites["viddler.com"].
skip_script_processing = function()
{
    // Skip script procerssing at all.
    return false;
}


LinternaMagica.prototype.sites["viddler.com"].css_fixes = function(object_data)
{
    object_data.parent.style.setProperty("overflow", 
					 "visible", "important");

    object_data.parent.
	parentNode.style.setProperty("overflow", "visible", "important");

    // With the default value of 16% the list is too wide.
    var hd_links = document.getElementById('linterna-magica-hd-links-list-'+
					   object_data.linterna_magica_id);

    if(hd_links)
    {
	hd_links.style.setProperty("width", "8%", "important");
    }

    return false;
}
