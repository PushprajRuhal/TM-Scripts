// ==UserScript==
// @name         Work logs Helper
// @namespace    http://tampermonkey.net/
// @version      0.2
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

    var dateTime = new Date();
    var weekDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dateTime.getDay()];
    var startTime = $.cookie('startTime');
    var currTime = dateTime.getHours();
    currTime += dateTime.getMinutes()/60.0;
    currTime = Math.ceil(currTime * 10) / 10;

    if(startTime == undefined)
    {
        startTime = dateTime.getHours();
        startTime += dateTime.getMinutes()/60.0;
        startTime = Math.ceil(startTime * 10) / 10;

        dateTime.setHours(23,59,59,0);
        $.cookie('startTime', startTime , { expires: dateTime });
    }
    else
    {
        startTime = parseFloat(startTime);
    }



    //styles
    var styleInjector = getStyleInjector();
   // styleInjector.insertRule(["#ctl00_body_gvActiveEngineersStatus_gvBlock > tbody > tr > td", "#ctl00_body_gvActiveEngineersStatus_gvBlock th[scope='col']"], 'padding:4px; !important');
    styleInjector.insertRule(["#ctl00_body_gvActiveEngineersStatus_divBlock table"], 'width:100%; table-layout: fixed;');
    //styleInjector.insertRule(["#ctl00_body_gvActiveEngineersStatus_divBlock table td"], 'border-right: 1px solid #ccc;');
    styleInjector.insertRule([".left, .right"], 'padding: 0 5%; width:40%');
    styleInjector.insertRule([".right"], 'float:right; text-align:left; color: #bbb;');
    styleInjector.insertRule([".left"], 'float:left; text-align:right;');
    styleInjector.insertRule([".total"], 'text-align:center;');
    styleInjector.insertRule([".todaysLog"], 'font-weight: bold;');
    styleInjector.insertRule([".lessLogs"], 'color:red;');
    styleInjector.insertRule([".moreLogs"], 'color:yellow;');
    styleInjector.insertRule([".goodLogs"], 'color:green;');
    styleInjector.insertRule([".activeEngineersStatus .flexGroup"],'display: inline-flex;');
    styleInjector.insertRule([".activeEngineersStatus .flexItem"],'');
    styleInjector.insertRule([".activeEngineersStatus .flexGroup table td"],'padding: 0;         margin: 0;            text-align: center;');
    styleInjector.insertRule([".activeEngineersStatus .flexGroup table"],'width: 100%;            border: none;            table-layout: fixed;');
    styleInjector.insertRule([".activeEngineersStatus .yellow"],'background-color: #F3E6A9;');
    styleInjector.insertRule([".activeEngineersStatus .red"],'background-color: #F4BDBD;');


    function injectWorkLogs(worklogSummary){
        //debugger;
        worklogSummary=$(worklogSummary);
        var divForTimeSlector = "#ctl00_body_gvActiveEngineersStatus_gvBlock > tbody > tr > td.workLogsForPeriodByDays > div > div:nth-child(2) > table > tbody > tr > td:nth-child("+ (dateTime.getDay()+1) +") > div";
        var loggedHours = worklogSummary.find(divForTimeSlector + " > div.left").text();
        loggedHours=parseFloat(loggedHours);
        var requiredHours = (currTime-startTime).toFixed(1);
        requiredHours = requiredHours>8?8:requiredHours;
        var logClass = "goodLogs";
        var startHour = Math.floor(startTime);
        var title = "Check-in: " + startHour +":"+Math.ceil((startTime-startHour)*60);
        var deviation =  0.5;

        if(loggedHours < 8)
        {
            if(Math.abs(requiredHours - loggedHours) > deviation)
            {
                if((requiredHours - loggedHours) > 0)
                {
                    logClass = "lessLogs";
                }
                else
                {
                    logClass = "moreLogs";
                }
                title += ", Expected hrs: " + requiredHours+"(Needed: "+ ((requiredHours - loggedHours)*60).toFixed(0)+"mins)";
            }
        }
        worklogSummary.find(divForTimeSlector).addClass("todaysLog " + logClass).attr("title",title);
        worklogSummary.insertAfter("#ctl00_body_gvSLAdetails_divBlock");
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
    var workLogsUrl = "https://support.sitecore.net/dashboard/Pages/PSS/Worklogs.aspx?engineer=" + selectedUser + "&type=All+tasks&viewMode=BiWeekly";
    $.get(workLogsUrl, function(data) {
        var myWorkLogSummary = $(data).find("#ctl00_body_gvActiveEngineersStatus_divBlock");
        myWorkLogSummary.find("#ctl00_body_gvActiveEngineersStatus_lHeader").text("Worklog Summary");
        sessionStorage.setItem("page_lastUpdated", lastUpdated);
        sessionStorage.setItem(selectedUser+"_worklogSummary", myWorkLogSummary[0].outerHTML);
        injectWorkLogs(myWorkLogSummary);
    });
})();
