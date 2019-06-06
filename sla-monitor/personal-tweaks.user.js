// ==UserScript==
// @name         Personal tweaks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  For sla monitor
// @author       Pushpraj
// @include      https://support.sitecore.net/dashboard/Pages/SLAmonitor.aspx*
// @require      https://raw.githubusercontent.com/pushprajruhal/tm-scripts/master/dependencies/style-injector.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var styleInjector = getStyleInjector();
    styleInjector.insertRule(["#ctl00_body_gvSLAdetails_gvBlock > tbody > tr > td:nth-child(1) > a:visited"], 'color: #F4BDBD;');
    /*styleInjector.insertRule(["#ctl00_body_gvSLAdetails_gvBlock > tbody > tr > td:nth-child(6)",
                              "#ctl00_body_gvSLAdetails_gvBlock > thead > tr > th:nth-child(6)",
                              "#ctl00_body_gvSLAdetails_gvBlock > tbody > tr > td:nth-child(11)",
                              "#ctl00_body_gvSLAdetails_gvBlock > thead > tr > th:nth-child(11)"],'display:none');*/

    var match = /selected[^>]*>Priority\s=\s([^\s]*)\s(?:and|or)\sPlan\s=\s([^<|\s]*)/.exec($(".filterArea").html());
    if(match)
    {
        var titlePrefix = "";
        if(match[1] === "Any" && match[2] === "Any"){
            //nothing
        }
        else if(match[1] === "Any"){
            titlePrefix = match[2];
        }
        else if(match[2] === "Any"){
            titlePrefix = match[1];
        }
        else{
            titlePrefix = match[2] + " (" + match[1] + ")";
            titlePrefix = titlePrefix.replace("Standard/Partner", "Std/Part");
        }
        if(titlePrefix !== ""){
            document.title = titlePrefix + " - " +document.title;
        }
    }

    function extractDataSourceLoadTime(){
        var match  = /Open:[^\d]*?(\d+|a)[^(|\n]*\((\d{2}:\d{2}\sUTC)/.exec(document.body.innerText);
        if(match)    {
            return{
                minsAgo: parseInt(match[1]==='a'?0:match[1]),
                utcTime: match[2]
            };
        }
        throw("Data source load time not found");
    }
//debugger;
    var loadTime = extractDataSourceLoadTime().minsAgo;
    var refreshTime = 300-(loadTime*60);
    if(refreshTime > 59 && refreshTime < 300)
    {
        $('meta[http-equiv=refresh]').remove();
        $('head').append( '<meta http-equiv="refresh" content="'+ refreshTime +'">' );
    }
})();