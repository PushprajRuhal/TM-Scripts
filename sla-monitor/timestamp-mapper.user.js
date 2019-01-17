// ==UserScript==
// @name         Timestamp mapper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds local time hint to UTC timestamp in ticket fields(description and notes)
// @author       Pushpraj
// @match        https://support.sitecore.net/client/viewitem*
// @match        https://support.sitecore.net/client/ViewItem*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addLocalTime(){
        //debugger;
        $('.field').html(function(i, html) {
            //extra groups in regex, would use later
            return html.replace(/Edited\sby\s((?:[\w\s])+?)\son\s(\w+),\s((\w+)\s(\d+),\s(\d+)\sat\s(\d+):(\d+)\s(AM|PM)\s\(UTC\))/g, function(match, p1, p2, p3) {
                //debugger;
                console.log(match);
                var localTime = new Date(p3.replace("at ","").replace("(UTC)","UTC"));
                var localTimeStr = localTime.toDateString() + ", "+ localTime.toLocaleTimeString();
                return "<span title='" + localTime + "'>" + match + " <em style='color:gray'>:: " + localTimeStr + "</em></span>";
            });
        });
    }

    function waitForFields(){
        if($('.field').length>0){
            addLocalTime();
            return;
        }
        setTimeout(waitForFields, 100);
    }

    setTimeout(waitForFields, 100);

})();