// ==UserScript==
// @name         SLA time mapper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Maps and notify SLA time for the timezone
// @author       You
// @include      https://support.sitecore.net/dashboard/Pages/SLAmonitor.aspx*
// @require      https://raw.githubusercontent.com/pushprajruhal/tm-scripts/master/dependencies/style-injector.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //styles
    var styleInjector = getStyleInjector();
    styleInjector.insertRule(["@keyframes toAmber"], '50% {background-color: #F3E6A9;} 100% {background-color: #F3E6A9;}');
    styleInjector.insertRule([".failingSoon"], 'animation: toAmber 1s ease-in infinite alternate;');

    styleInjector.insertRule([".localTime"], 'float:right;');
    styleInjector.insertRule([".week-day"], 'float:left;min-width:2.5rem;text-align:right;margin-right:0.1rem');
    styleInjector.insertRule([".slaFontSize"], 'font-size:0.96em');


    var timeOffsetRegex = /([+-])(?:(\d+)\.)?(\d+):(\d+)/;
    var ordinals = ['','st','nd','rd'];
    function parseSLAOffset(slaOffset)
    {
        var match = timeOffsetRegex.exec(slaOffset);
        var roundTo = 5;
        if(match)
        {
            return {
                isValid: true,
                sign: match[1]=="+"?1:-1,
                days: match[2]?parseInt(match[2]):0,
                hours: parseInt(match[3]),
                mins: 5 * Math.floor(parseInt(match[4]) / roundTo),
                toLocal: function() {
                    var localTime = new Date();
                    localTime.setUTCDate(localTime.getUTCDate() + (this.sign * this.days));
                    localTime.setUTCHours(localTime.getUTCHours() + (this.sign * this.hours));
                    localTime.setUTCMinutes(localTime.getUTCMinutes() + (this.sign * this.mins));
                    var localHour = localTime.getHours();
                    var localMinute = localTime.getMinutes();
                    return {
                        date: localTime,
                        month: localTime.getMonth(),
                        monthName: localTime.toLocaleDateString(window.navigator.languages[0],{ month: 'short' }),
                        day: localTime.getDate(),
                        weekDayName: localTime.toLocaleDateString(window.navigator.languages[0],{ weekday: 'short' }),
                        hour: localHour,
                        hourPadded:  (localHour<10)?"0"+localHour:localHour,
                        minute: localMinute,
                        minutePadded: (localMinute<10)?"0"+localMinute:localMinute,
                        toString: localTime.toString(),
                        dayOrdinal: (function(day) {
                            return ordinals[~~(day/10%10)-1?day%10:0]||'th';
                        })(localTime.getDate())

                    };
                }
            };
        }
        else {
            return {
                isValid:false
            };
        }
    }

    var responses = $(".sorting_1 > .slaTime");
    $.each(responses, function( index, value ) {
        var sla = parseSLAOffset(value.innerText);
        if(sla.isValid)
        {
            var localTime = sla.toLocal();
            if(localTime.hour < 9 || localTime.hour > 18){

                var day = localTime.day + localTime.dayOrdinal + " " + localTime.monthName +" ";
                var slaClass = "failingLater";
                var today = new Date();
                if(today.getDay() > 4) {
                    today.setDate(today.getDate() + 7 - today.getDay());
                }
                today = today.getDate();
                if(localTime.day == today ){
                    day="";
                }
                if(localTime.day <= (today + 1) ) {
                    slaClass = "failingSoon";
                }
                else {
                    return;
                }
                var slaDiv = $(value);
                slaDiv.addClass(slaClass);
                slaDiv.parent().parent().addClass(slaClass);
                slaDiv.parent().parent().attr("title", day + "@"+ localTime.hour + ":" +  localTime.minutePadded);
            }
        }
    });
    var dateToday = new Date().getDate();
    $.each($(".slaTime"), function( index, value ) {
        var sla = parseSLAOffset(value.innerText);
        if(sla.isValid){
            var localTime = sla.toLocal();
            if(localTime.day <= dateToday){
                value.title = localTime.weekDayName+", " + localTime.monthName + " " + localTime.day + localTime.dayOrdinal + ", "+ localTime.hour + ":" +  localTime.minutePadded;
            }
            else{
                value.title = value.innerText;
                value.innerHTML = "<div class='week-day slaFontSize'>"+ localTime.weekDayName + " "+localTime.day+",</div><div class='slaFontSize'>" + localTime.hourPadded + ":" +  localTime.minutePadded+"</div>";
            }
        }
    });
})();
