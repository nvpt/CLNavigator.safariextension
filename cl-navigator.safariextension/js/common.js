
var CL_ALI_UID = 'yVF2rZRRj';           
var ALI_CLEAR = 'aliexpress.com';       
var ALI_COOKIE = 'aeu_cid';             
var AUTHORISATION_UPDATE_TIME = 10800000;
var PARTNERS_UPDATE_TIME = (86400000 - (Math.random() * 7200000)); 
var TIMER_LIFE = 86400000;              


var partnersData = {};                  
var partnersDataCustom = {};            
var partnersDataAdmitad = {};           
var partnersVisited = {};               
var modalMarkers = [0];                 
var timers = {};                        
var modalShowed = false;                
var remodalShowed = false;              

var loginData = {default_start: 1};     
var authIdentifier = 0;                 
var authCookie = 0;                     


function _getAliClear() {
    return ALI_CLEAR;
}

function _getRemodalShowed() {
    return remodalShowed;
}

function _setRemodalShowed(val) {
    remodalShowed = val;
}

function _getModalMarkers() {
    return modalMarkers;
}

function _setModalMarkers(val) {
    modalMarkers = val;
}

function _setModalShowed(val) {
    modalShowed = val;
}

function _addToTimers(el, val) {
    return timers[el] = val;
}

function _getTimers() {
    return timers;
}

function _getLoginData() {
    return loginData;
}

function _setLoginData(val) {
    return loginData = val;
}

function _getPartnersData() {
    return partnersData;
}

function _getPartnersVisited() {
    return partnersVisited;
}

function getClearUrl(val) {
    if(val) { 

        if (/(.com\.br)\//.test(val)) {
            val = val.match(/\/\/.*?(www\.|)(([\w\d_\-\.]+)\.(com\.br))\//)
        } else {
            val = val.match(/(.+\.)?(([а-яА-ЯёЁ\w\d_\-]+)\.([а-яА-ЯёЁ\w\d_\-]+))\//);
        }
    }
    if ((val) && (val[2])) {
        return punycode.toUnicode((val[2]));
    } else {
        return false;
    }
}


function checkSafeResponse(obj) {

    safeResponse = function () {

        var validAttrs = ["class", "id", "href", "style"];

        this.__removeInvalidAttributes = function (target) {
            var attrs = target.attributes, currentAttr;

            for (var i = attrs.length - 1; i >= 0; i--) {
                currentAttr = attrs[i].name;

                if (attrs[i].specified && validAttrs.indexOf(currentAttr) === -1) {
                    target.removeAttribute(currentAttr);
                }

                if (
                    currentAttr === "href" &&
                    /^(#|javascript[:])/gi.test(target.getAttribute("href"))
                ) {
                    target.parentNode.removeChild(target);
                }
            }
        };

        this.__cleanDomString = function (data) {
            var parser = new DOMParser;
            var tmpDom = parser.parseFromString(data, "text/html").body;

            var list, current, currentHref;

            list = tmpDom.querySelectorAll("script,img");

            for (var i = list.length - 1; i >= 0; i--) {
                current = list[i];
                current.parentNode.removeChild(current);
            }

            list = tmpDom.getElementsByTagName("*");

            for (i = list.length - 1; i >= 0; i--) {
                parent.__removeInvalidAttributes(list[i]);
            }

            return tmpDom.innerHTML;
        };

        return {
            cleanDomString: function (html) {
                return parent.__cleanDomString(html)
            }
        }
    }();


    for (var key in obj) {
        if ((obj.hasOwnProperty(key)) && obj[key]) {
            if ((obj[key].length > 0) && (!isNaN(obj[key]))) {
                obj[key] = parseFloat(obj[key]);
            } else if (obj[key].constructor === Array) {
                obj[key].length > 0 ? checkSafeResponse(obj[key]) : obj[key] = []
            } else {
                switch (typeof(obj[key])) {
                    case 'string':
                        obj[key] = safeResponse.cleanDomString(obj[key]);
                        break;
                    case 'number':
                        obj[key] = parseFloat(obj[key]);
                        break;
                    case 'object':
                        checkSafeResponse(obj[key]);
                        break;
                    default:
                        obj[key] = safeResponse.cleanDomString(obj[key]);
                        break;
                }
            }
        }
    }
}






function checkTimers(el) {
    if (timers.hasOwnProperty(el)) {
        var currentTime = new Date().getTime();
        if ((currentTime - timers[el]) > TIMER_LIFE) {
            delete timers[el];
            modalMarkers = [0];
        }
    }
}
