// ==UserScript==
// @name         Work logs Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Show work logs in SLA monitor
// @author       Pushpraj
// @match        https://support.sitecore.net/dashboard/Pages/SLAmonitor.aspx*
// @require      https://raw.githubusercontent.com/pushprajruhal/tm-scripts/master/dependencies/style-injector.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var selectedUser = null;
    $.each($(".filterItem"),function( index, value ) {
        var filter = $(value);
        if(filter.find(".filterItemTitle").text() === "AssignedTo:"){
            selectedUser = filter.find("select option:selected").text().replace(" ","+");
            if(selectedUser === "Unassigned" || selectedUser === "All"){
                selectedUser = "none";
            }
        }
    });
    if(selectedUser === "none"){
        return;
    }
    //styles
    var styleInjector = getStyleInjector();
    styleInjector.insertRule(["#ctl00_body_gvActiveEngineersStatus_gvBlock > tbody > tr > td", "#ctl00_body_gvActiveEngineersStatus_gvBlock th[scope='col']"], 'padding:4px; !important');
    styleInjector.insertRule(["#ctl00_body_gvActiveEngineersStatus_divBlock table"], 'width:100%; table-layout: fixed;');
    styleInjector.insertRule(["#ctl00_body_gvActiveEngineersStatus_divBlock table td"], 'border-right: 1px solid #ccc;');
    styleInjector.insertRule([".left, .right"], 'padding: 0 5%; width:40%');
    styleInjector.insertRule([".right"], 'float:right; text-align:left; color: #bbb;');
    styleInjector.insertRule([".left"], 'float:left; text-align:right;');
    styleInjector.insertRule([".total"], 'text-align:center;');

    function injectWorkLogs(worklogSummary){
        $(worklogSummary).insertAfter("#ctl00_body_gvSLAdetails_divBlock");
    }

    var lastUpdated = "";
    function extractDataSourceLoadTime(){
        var match  = /(\d+|a)[^(\n]*\((\d{2}:\d{2}\sUTC)/.exec(document.body.innerText);
        if(match)    {
            return{
                minsAgo: parseInt(match[1]==='a'?1:match[1]),
                utcTime: match[2]
            };
        }
        throw("Data source load time not found");
    }

    lastUpdated = extractDataSourceLoadTime().utcTime;
    if(lastUpdated === sessionStorage.getItem("page_lastUpdated"))    {
        var worklogSummary = sessionStorage.getItem(selectedUser+"_worklogSummary");
        if(worklogSummary){
            injectWorkLogs(worklogSummary);
            return;
        }
    }

    //logic to get work logs from url
    var workLogsUrl = "https://support.sitecore.net/dashboard/Pages/PSS/Worklogs.aspx?engineer=" + selectedUser + "&type=All+tasks";
    $.get(workLogsUrl, function(data) {
        var myWorkLogSummary = $(data).find("#ctl00_body_gvActiveEngineersStatus_divBlock");
        myWorkLogSummary.find("#ctl00_body_gvActiveEngineersStatus_lHeader").text("Worklog Summary");
        sessionStorage.setItem("page_lastUpdated", lastUpdated);
        sessionStorage.setItem(selectedUser+"_worklogSummary", myWorkLogSummary[0].outerHTML);
        injectWorkLogs(myWorkLogSummary);
    });
})();