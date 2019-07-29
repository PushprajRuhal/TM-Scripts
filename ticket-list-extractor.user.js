// ==UserScript==
// @name         Extract ticket list
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copies to clipboard
// @author       You
// @match        https://support.sitecore.net/dashboard/Pages/SLAmonitor.aspx*
// @require      https://raw.githubusercontent.com/pushprajruhal/tm-scripts/master/dependencies/style-injector.js
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    var styleInjector = getStyleInjector();
    styleInjector.insertRule([".copyLinkContainer"], 'margin-right: 360px;margin-top: 3px;cursor: pointer;position: relative;');
    styleInjector.insertRule([".copyLink+.copyLink:before"], 'content: " | "');
    styleInjector.insertRule([".float"], 'float:left');
    styleInjector.insertRule([".filter"], 'margin-top:-2px;margin-left:4px');

    window.generateTable = function (maxRows){

        if(!maxRows)
        {
            maxRows = parseInt(prompt("Max rows?", "10"));
            if(maxRows<1){
                maxRows=10;
            }
        }

        var columns = [
            {
                pri:1
            },
            {
                pri:2,
                sec:[5],
                proc:function(dataPri, dataSec){
                    dataSec = dataSec[5];
                    dataSec = dataSec.replace(/\-[\s\w]*/gm,"");
                    return "["+dataSec.replace(/([A-Z]+)[a-z|\s|-]*/gm,"$1")+"] " + dataPri;
                }
            },
            {
                pri:13,
                sec:[9],
                proc:function(dataPri, dataSec){
                    dataSec = dataSec[9];
                    dataSec = dataSec.replace(/(\w+)[$|\s|\w]{0,}/,"$1");
                    if(dataSec === "Standard"){
                        return dataPri;
                    }
                    else{
                        return dataPri + ", " + dataSec.slice(0,4);
                    }
                }
            },
            {
                pri:17,
                html:false
            }];

        var getCellData = function(tableRow, cellIndex, html)
        {
            var cell = tableRow.find('> td:nth-child('+cellIndex+')');
            if(html){
                return cell.html();
            }
            else{
                return cell.text().trim();
            }
        }

        var output = '<table>';
        var rowCount = 0;
        $.each($("#ctl00_body_gvSLAdetails_gvBlock > tbody > tr"), function(rowKey, row ) {
            if(rowKey == maxRows){
                return false;
            }
            var tableRow = $(row);
            output += '<tr>';
            $.each(columns, function(colKey, col) {
                output += '<td>';
                var cellData = getCellData(tableRow, col.pri, col.html);
                if(col.proc && col.sec)
                {
                    var secCellData = [];
                    $.each(col.sec, function(secColKey, secCol) {
                        secCellData[secCol] = getCellData(tableRow, secCol);
                    });
                    output += col.proc(cellData, secCellData)
                }
                else
                {
                    output += cellData;
                }
                output += '</td>';
            });
            output += '</tr>';

        });
        output += '</table>';
        var table = $(output);
        $('body').append(table);
        var source = table;
        var range = document.createRange();
        var selection = window.getSelection();
        range.selectNodeContents(source[0]);
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            var successful = document.execCommand('copy');
            var callback = successful ? 'Copy Success' : 'Copy Error';
            if(successful)
            {
                alert("Copied");
            }
            else{
                alert("Failed");
            }
            console.log(callback);
        } catch (err) {
            console.log(err);
            alert("Failed");
        }
        selection.removeAllRanges();
        table.remove();

    };

    var functionGroups = [
        {
            name: "Ticket copy functions",
            functions: [
                {
                    text: "Copy All",
                    onClick: "generateTable(1000)"
                },
                {
                    text: "Copy 10",
                    onClick: "generateTable(10)"
                },
                {
                    text: "Copy n",
                    onClick: "generateTable()"
                }
            ]
        }
    ];
    var toAppend = "<div class='dataTables_filter copyLinkContainer'>";
    $.each(functionGroups, function(groupKey, group) {
        toAppend+="<div title='"+group.name+"' class='float'>";
        $.each(group.functions, function(functionKey, func) {
            toAppend+= "<a onclick='"+func.onClick+"' class='copyLink'>"+func.text+"</a>";
        });
        toAppend+="</div>";
    });
    toAppend += "<div class='float filter'>| Regex search: <input type='text' name='regexFilter' onkeyup=\"$('#ctl00_body_gvSLAdetails_gvBlock').DataTable().fnFilter($('#regexFilter').val(),null,true,true);\"></div></div>";

    var container = $( "#ctl00_body_gvSLAdetails_gvBlock_wrapper > div.fg-toolbar.ui-toolbar.ui-corner-tl.ui-corner-tr.ui-helper-clearfix" );
    //container.append($("<div class='dataTables_filter copyLinkContainer'><a onclick=generateTable(1000) class='copyLink'>Copy All</a><a onclick=generateTable(10) class='copyLink'>Copy 10</a><a onclick=generateTable() class='copyLink'>Copy n</a></div>"));
    container.append($(toAppend));

})();