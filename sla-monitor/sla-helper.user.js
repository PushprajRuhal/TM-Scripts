// ==UserScript==
// @name         SLA time mapper
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Maps and notify SLA time for the timezone
// @author       You
// @include      https://support.sitecore.net/dashboard/Pages/SLAmonitor.aspx*
// @require      https://raw.githubusercontent.com/pushprajruhal/tm-scripts/master/dependencies/style-injector.js
// @downloadURL  https://raw.githubusercontent.com/PushprajRuhal/tm-scripts/master/sla-monitor/sla-helper.user.js
// @updateURL    https://raw.githubusercontent.com/PushprajRuhal/tm-scripts/master/sla-monitor/sla-helper.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //styles
    var styleInjector = getStyleInjector();
    styleInjector.insertRule(["@keyframes toRed"], '50% {background-color: #F4BDBD;} 100% {background-color: #F4BDBD;}');
    styleInjector.insertRule(["@keyframes toAmber"], '50% {background-color: #F3E6A9;} 100% {background-color: #F3E6A9;}');
    styleInjector.insertRule([".failingSoon"], 'animation: toRed 1s ease-in infinite alternate;');

    styleInjector.insertRule([".localTime"], 'float:right;');
    styleInjector.insertRule(["#ctl00_body_gvSLAdetails_gvBlock > thead > tr > th:nth-child(16), #ctl00_body_gvSLAdetails_gvBlock > thead > tr > th:nth-child(15)"], 'width: 95px !important;');
    styleInjector.insertRule([".slaTime"], 'text-align:center;');
    styleInjector.insertRule([".followup"], 'background:PaleTurquoise !important; ');



    var timeOffsetRegex = /([+-])(?:(\d+)\.)?(\d+):(\d+)\s?(\*?)/;
    var ordinals = ['','st','nd','rd'];
    function parseSLA(sla)
    {
        var match = timeOffsetRegex.exec(sla.innerText);
        var roundTo = 5;
        if(match)
        {
            //debugger;
            return {
                isValid: true,
                sign: match[1]=="+"?1:-1,
                days: match[2]?parseInt(match[2]):0,
                hours: parseInt(match[3]),
                mins: parseInt(match[4]),
                ignored: match[5] && match[5]=="*",
                isFollowUp: sla.title?sla.title.indexOf("Follow Up")==0:false,
                toLocal: function() {
                    var localTime = new Date();
                    localTime.setUTCDate(localTime.getUTCDate() + (this.sign * this.days));
                    localTime.setUTCHours(localTime.getUTCHours() + (this.sign * this.hours));
                    localTime.setUTCMinutes(localTime.getUTCMinutes() + (this.sign * this.mins));
                    var localHour = localTime.getHours();
                    var localMinute = localTime.getMinutes();
                    localMinute = 5 * Math.floor(parseInt(localMinute) / roundTo);
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
    var today = new Date();
    var dateToday = today.getDate();
    var monthToday = today.getMonth();
    $.each($(".slaTime"), function( index, value ) {
        var sla = parseSLA(value);
        if(sla.isValid){
            var localTime = sla.toLocal();

            var slaClass;
            if( sla.ignored ) {
                //slaClass = "failingSoon";
                //ignored sla
            }

            if(sla.sign === -1) {
                value.title = localTime.weekDayName+", " + localTime.monthName + " " + localTime.day + localTime.dayOrdinal + ", "+ localTime.hour + ":" + localTime.minutePadded;
                // return;
            }
            else {
                var prefix = "Today, ";
                if(localTime.day === dateToday+1)
                {
                    prefix = "Tmrw., ";
                }
                else if(localTime.day > dateToday+1 || localTime.month != monthToday)
                {
                    prefix = localTime.weekDayName +" "+ localTime.day +", ";
                }

                if(sla.isFollowUp)
                {
                    slaClass = "followup";
                }
                if(localTime.day === dateToday && (localTime.date.getTime() - today.getTime()) < 3600000) //millis in 1 hour
                {
                    slaClass += " failingSoon";
                }
                value.innerHTML = prefix + localTime.hourPadded + ":" + localTime.minutePadded;
            }

            if(slaClass){
                var slaDiv = $(value);
                slaDiv.addClass(slaClass);
            }

        }
    });
})();
