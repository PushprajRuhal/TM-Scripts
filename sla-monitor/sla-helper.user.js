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

    var format = function date2str(x, y) {
        var z = {
            M: x.getMonth() + 1,
            d: x.getDate(),
            h: x.getHours(),
            m: x.getMinutes(),
            s: x.getSeconds()
        };
        y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
            return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2);
        });

        return y.replace(/(y+)/g, function(v) {
            return x.getFullYear().toString().slice(-v.length);
        });
    };

    //styles
    var styleInjector = getStyleInjector();
    //styleInjector.insertRule(["@keyframes toRed"], '75% {background-color: #F4BDBD;} 100% {background-color: #F4BDBD;}');
    styleInjector.insertRule(["@keyframes toAmber"], '50% {background-color: #F3E6A9;} 100% {background-color: #F3E6A9;}');
    styleInjector.insertRule([".failingSoon"], 'animation: toAmber 1s ease-in infinite alternate;');
    //styleInjector.insertRule([".failingLater"], 'animation: toAmber 1s ease infinite alternate;');

    styleInjector.insertRule([".localTime"], 'float:right;');

    var timeOffsetRegex = /([+-])(?:(\d+)\.)?(\d+):(\d+)/;
    var ordinals = ['','st','nd','rd'];
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
                    return {
                        date: localTime,
                        month: localTime.getMonth(),
                        monthName: localTime.toLocaleDateString(window.navigator.languages[0],{ month: 'short' }),
                        day: localTime.getDate(),
                        weekDayName: localTime.toLocaleDateString(window.navigator.languages[0],{ weekday: 'short' }),
                        hour: localTime.getHours(),
                        minute: localTime.getMinutes(),
                        minutePadded: (localTime.getMinutes()<10)?"0"+localTime.getMinutes():localTime.getMinutes(),
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
            if(localTime.hour > 5 && localTime.hour < 9){

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

     $.each($(".slaTime"), function( index, value ) {
         var sla = parseSLAOffset(value.innerText);
         if(sla.isValid){
             var localTime = sla.toLocal();
             value.title = "Expiring: " + localTime.weekDayName+", " + localTime.monthName + " " + localTime.day + localTime.dayOrdinal + ", "+ localTime.hour + ":" +  localTime.minutePadded;
         }
     });
})();