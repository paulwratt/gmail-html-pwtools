// ==UserScript==
// @name         Multi-select Gmail HTML
// @namespace    paulwratt.gmail
// @version      1.10.3
// @description  add the missing "select all" checkbox from the HTML (fast) version of Gmail
// @author       paul.wratt@gmail.com
// @icon         data:image/gif;base64,R0lGODlhEAAQAPYAAL4nKsceGMYhHMUiH8ciH8kiHsgjIMojINAkIeI6L+U5LPM/LOI7MPM/M+lCNOpDNepANutENuxENe1ENu5ENu9ENvJCN/NENPJFN/JGN/BCONdjL/JmJ/RkJ/BkKZlBZNBFRy+pVS2qWDOnUjCmVDSoUzWpUzWqVDWrVTWsVDWsVTWtVlutQrm1HYOzNfC9B/+7Af2+Av+/A/q8BPy9BP+/BP/CBP/HBHZhpVpwyT+G9z6I+z6L/0GE80GE9EKH90OH90OH+EOI+USI+USI+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEUALAAAAAAQABAAAAd5gEWCg4SFhoeIiYQDCASINDczggEGBwmGHDY1MIIfBQIMGRKCEhoeMTItgjo4AAoRGA4OGBAdLy4kgj48OSAXDxQUDxYbLCIlgj1BO0ULFRMTFQ1FISjIRcpAg8GDJ9bJQdqH3tc9REOIKivXPkI/iCYpI4r09faDgQA7
// @homepage     https://paulwratt.github.io/gmail-pwtools/
// @include      https://mail.google.com/mail/u/*/h/*
// @run-at       document-end
// @grant        GM_addStyle
// ==/UserScript==

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // this GreaseMonkey userscript is ONLY FOR Gmail "HTML view"
  // - tested with TamperMonkey, maybe works with ViolentMonkey too
  // - its ECMAscript v5, so it should work with any GreasyMonkey engine (back to 2005 v1).
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  
(function() {
  'use strict';
  
  var pwt_Code = '';
  var pwt_gmailCSS = '';
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Utilities
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  
  /**
   * Creates  the CSS for the new checkbox
   * @return {null}
   */
  
  function pw_GMaddStyles(){
    pwt_gmailCSS=(<><![CDATA[
body {
  background-color: #121212 !important;
  background-image: url("https://ssl.gstatic.com/ui/v1/icons/mail/themes/graffiti/bg_1680x1050.jpg") !important;
  background-size: cover !important;
  background-attachment: fixed !important;
}
table.h tr {
  background-color: white !important;
}
]]></>).toString();
// thankfully Chromium CSP checks fail to block this, unlike JS script tags and injected element tag JS (onclick)
// oh and yeah, thats my background from the beta of "new" Gmail "standard view", which I still use to this day
  
// workaround for various GreaseMonkey engines
if (typeof GM_addStyle != "undefined") {
	GM_addStyle(pwt_gmailCSS);
} else if (typeof PRO_addStyle != "undefined") {
	PRO_addStyle(pwt_gmailCSS);
} else if (typeof addStyle != "undefined") {
	addStyle(pwt_gmailCSS);
} else {
	var node = document.createElement("style");
	node.type = "text/css";
	node.appendChild(document.createTextNode(pwt_gmailCSS));
	var page = document.getElementsByTagName("body");
	if (page.length > 0) {
		page[0].appendChild(node);
	} else {
		// no head yet, stick it whereever
		document.documentElement.appendChild(node);
	}
}
  }
  
  /**
   * Creates  "checkbox list" ticker
   * @return {null}
   */
  
  pwt_Code = (
  
  function(){
    var t=this.checked;
    var i_t=document.getElementsByName('t');
    for (var i=0; i<i_t.length; i++) {
      i_t[i].checked = t;
    }
    pw_sa0.checked=t;
    pw_sa2.checked=t;
  }
  
).toString();
// because Gmail has a tight CSP, we cant insert a usable JS script tag
// and we cant write element with event JS either, so we inject this in
// the next function, directly into the DOM, by-passing CSP checks.
  
  /**
   * Creates  "select all" checkbox
   * @return {null}
   */
  
  function pw_GMinsertSelectAll(n) {
    var i_f=document.getElementsByName('f')[0];
    var i_t=i_f.getElementsByTagName('table');
    var i_r=null;
    var i_h=null;
    for (var i=0; i<i_t.length; i++) {
      if (i!=1) {
        i_r=i_t[i].getElementsByTagName('td')[0];
        i_h=i_r.innerHTML;
        i_r.innerHTML='<input name=pw_sa'+i+' id=pw_sa'+i+' type="checkbox" alt=" select all " nonce >'+i_h;
// NOTE: name=id thats really important. we dont _need_ 'nonce' since we will by-pass CSP checks
//      setTimeout('pw_sa'+i+'.nonce="'+n+'";pw_sa'+i+'.onclick=function(){console.log("'+i+':"+this.nonce);};',1000)
        setTimeout('pw_sa'+i+'.nonce="'+n+'";pw_sa'+i+'.onclick='+pwt_Code+';',1000)
// NOTE: name=id works through the Forms DOM. we use timeout to wait for browser to (re)create objects
      }
    }
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Main
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  
  var currentPage = window.location.href;
// check if URL is for Gmail HTML view (/mail/u/?number?/h/), not Standard View (/mail/u/?number?/)
  if (currentPage.indexOf('https://mail.google.com/mail/u/') != -1 && currentPage.indexOf('/h/') != -1) {
//   make sure its _also_ not 'source-view:https://mail.google.com/mail/u/'
    if (document.getElementsByClassName('line-number').length == 0) {
//    document.body.style='background-color: #121212 !important;background-image: url("https://ssl.gstatic.com/ui/v1/icons/mail/themes/graffiti/bg_1680x1050.jpg") !important;background-size: cover !important;background-attachment: fixed !important;';
      pw_GMaddStyles();
//     make sure the page only has list of emails
      if (document.getElementsByName('t').length!=0) { pw_GMinsertSelectAll(document.scripts[document.scripts.length-1].nonce); }
    }
  }
  
})();