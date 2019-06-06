// ==UserScript==
// @name         Ontime client styling helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tweaks for ontime client structure/styling
// @author       You
// @include      https://support.sitecore.net/client/viewitem*
// @include      https://support.sitecore.net/client/edititem*
// @require      https://raw.githubusercontent.com/pushprajruhal/tm-scripts/master/dependencies/style-injector.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var pageUrl = location.href;
    var styleInjector = getStyleInjector(true);

    //common styles
    styleInjector.insertRule([".axo-view-item .item-field-table .item-field-inner-full-right"], 'background: white; border: 1px inset #c7c0c0;');
    styleInjector.insertRule(["div.field.form-control.form-control--small"], 'border-style: none; height: 1.4rem; padding: .4rem;');
    styleInjector.insertRule(["div.field.form-control.form-control--small a span"], 'margin-left: .06rem; margin-top: -.18rem;');
    styleInjector.insertRule(["div.item-body-header"], 'background: -webkit-linear-gradient(top, #f6f8f9 0%,#e5ebee 50%,#d7dee3 51%,#f5f7f9 100%);');
    styleInjector.insertRule(["div.item-field-cell-left, div.item-field-cell-right"], 'padding-bottom: 0; padding-top: 0;');
    styleInjector.insertRule(["div.item-field-inner-left, div.item-field-inner-right"], 'padding-bottom: 0; padding-top: 0;');
    styleInjector.insertRule(["label.item-field-label"], 'height: .9rem;');

    //page specific
    if(pageUrl.toLowerCase().includes("viewitem")){
        styleInjector.insertRule(["#editButton.axo-menuitem-button"], 'border-radius: 6px; box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5); pointer-events: all; margin-right: 15px');
        styleInjector.insertRule(["#view-item-title, #view-item-subtitle"], 'display: none;');
        styleInjector.insertRule(["#workflowMenu"], 'margin-right: 15px;');
        styleInjector.insertRule([".axo-menubar-mainmenu > li"], 'float: right; margin-top: 4px; margin-bottom: 4px; pointer-events: all;');
        styleInjector.insertRule(["div.form-header.yui3-helper-clearfix"], 'background: none; border: none; float: right; margin-top: 5px; pointer-events:none; position: relative; top: 0; width: 10%; min-width: 100px; z-index: 1; transition: width .2s linear .5s; -webkit-transition: width .2s linear .5s;');
        styleInjector.insertRule(["div.form-header.yui3-helper-clearfix"], 'transition: width .5s ease-in 1s;');// -webkit-transition: width .2s linear .5s;
        styleInjector.insertRule(["div.form-header.yui3-helper-clearfix:hover"], 'width: 100%; transition-delay: 0s; transition-duration: .1s;');
        //styleInjector.insertRule(["div.item-body-header"], 'padding-left: 70px;');
        styleInjector.insertRule(["div.item-form-body"], 'position: absolute; top: 0;');
        styleInjector.insertRule(["div.item-toolbar"], 'margin-left: -15px; width: 100%;');
        styleInjector.insertRule(["div.toolbar.right"], 'margin-right: 5px; margin-top: -28px; pointer-events: all;');
    }

    //page specific
    if(pageUrl.toLowerCase().includes("edititem")){
        styleInjector.insertRule(["[for='description'], [for='notes']"], 'margin-top: -15px;');
        styleInjector.insertRule(["button.formaction, #generateCloudEmailButton"], 'background: -webkit-linear-gradient(top, #f2f6f8 0%,#d8e1e7 50%,#b5c6d0 51%,#e0eff9 100%); color: black; float: left; font-size: .65rem; transition: color,border-color,background,background-color .4s; transition-timing-function: ease;');
        styleInjector.insertRule(["button.formaction:hover"], 'background: -webkit-linear-gradient(top, #b7deed 0%,#71ceef 50%,#21b4e2 51%,#b7deed 100%);');
        styleInjector.insertRule(["button.saveAndClose.button--basic.button--small"], 'background-color: #337ab7; margin-right: 10%;');
        styleInjector.insertRule(["button.saveAndClose.button--basic.button--small:hover"], 'background-color: #034a97;');
        styleInjector.insertRule(["button.saveAndClose.button--basic.button--small:hover:after"], '-webkit-border-radius: 3px; background: -webkit-linear-gradient(top, #a90329 0%,#8f0222 44%,#6d0019 100%); background-clip: padding-box; border: 1px solid rgba(0,0,0,0.25); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5); color: white; content: "Notify customer?"; cursor: pointer; font-size: 125%; margin-left: -35px; margin-top: -30px; padding: 8px 10px; pointer-events: none; position: absolute; text-align: center; white-space: nowrap; z-index: 1000;');
        styleInjector.insertRule(["div.form-header"], 'background: none; border: none; display: none; float: right; margin-top: 5px; min-width: 200px; position: relative; z-index: 1;');
        styleInjector.insertRule(["div.form-title, div.form-subtitle"], 'display: none;');
        styleInjector.insertRule(["div.item-body-header"], 'height: 60px; left: 0; padding: 0; padding-right: 1rem; position: absolute; right: 0; top: 0;');
        styleInjector.insertRule(["div.item-field-id"], 'padding-left: 1rem; padding-top: .8rem;');
        styleInjector.insertRule(["div.item-field-id::before"], 'content: "Edit Issue: "; font-size: Medium;');
        styleInjector.insertRule(["div.item-field-table"], 'bottom: 38px; top: 61px;');
        styleInjector.insertRule(["div.item-form-footer.formactionfooter"], 'padding-bottom: 4pxpx; padding-left: 40pxpx; padding-right: 40pxpx; padding-top: 4pxpx;');
        styleInjector.insertRule(["div.ontime-form"], 'top: 0;');
    }




})();