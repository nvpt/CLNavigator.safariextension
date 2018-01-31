/**
 * Created by CityLife on 23.12.16.
 */
/* testurl!!! */
let MAIN_URL = "https://cl.world/";
// let MAIN_URL = "http://front.zato.clcorp/";

let serverRequestKey = true;            // allow repeated request for server response checking

/* (languages) */
let languages = [];                     // available translation languages
let defaultLanguage = 'en';
let currentLanguage = defaultLanguage;
let languagesRequestKey = true;         // allow repeated request for available languages

/* (recommended) */
let recommendedObj = {};                // recommended partners in object format
let RECOMMENDED_QUANTITY = 25;        // recommended partners quantity
let recommendedRequestKey = true;       // allow repeated request for recommended

/* (links) */
let links = {};                         // partners links in object format (links)
let linksRequestKey = true;             // allow repeated request for partners links


/* work with aggregate data of extension (languages, recommended, links) */
let extensionDataTimestamp = null;                  // time of last update aggregate data
let EXTENSION_DATA_UPDATE_INTERVAL = 86400000;    // 86400000 = 24h. Update period for aggregate data


/* profile */
let profileData = {default_start: 1};                   // profile data object
let authIdentifier = 0;                 // authorisation identifier  for compare with cookie authorisation; 0 - not
                                        // authorised , >0 (=id) - authorised
let authCookie = 0;                     // current value of cookie authorisation. Will get in our site pages
let profileTimeUpdate = null;           // time of last update profile dta. null - not authorised or not updated yet
let profileRequestKey = true;           //  allow repeated request for profile data
let PROFILE_UPDATE_INTERVAL = 900000; // 900000 = 15min //10800000 = 3h. Update period for profile data


/* детальные данные партнеров */
let detailed = {};                       // detailed partners data (detailed)
let detailedRequestKey = true;           // allow repeated request for detailed data
let DETAILED_LIVE_TIME = 172800000;    //172800000 =  48h. Update period for detailed (not for timestamps)


/* кэшбэк */
let CASHBACK_LIVE_TIME = 86400000;                // 86400000 = 24h. Cashback time update.
let MODAL_LIVE_TIME = 43200000;                   // 43200000 = 12h. Update period for repeated showing modal window.
let MODAL_TIMESTAMPS_CHECK_INTERVAL = 3600000;    // 3600000 = 1h. Interval of repeated checking cashback


/* реактивация кэшбэка *///TODO переделать
let CL_ALI_UID = '3Vby3rfe6';             // our new identifier in AliE
let ALI_CLEAR = 'aliexpress.com';         // clear url of Aliexpress.com
let ALI_COOKIE = 'aeu_cid';               // need cookie name of Aliexpress


/* ============= GET, SET ============= */

function _getProfileData() {
    return profileData;
}

function _setProfileData(val) {
    return profileData = val;
}


function _getLanguages() {
    return languages;
}

function _getCurrentLanguage() {
    return currentLanguage;
}

function _setCurrentLanguage(val) {
    currentLanguage = val;
}


function _getDetailed() {
    return detailed;
}


function _getRecommended() {
    return recommendedObj;
}


function _setActivated(clearUlr, time) {
    /* маркеру активции кэшбэка прописываем время активации */
    return detailed[clearUlr]['activatedTimestamp'] = time;
}


function _setShowModalTimestamp(clearUlr, time) {
    /* in the marker showModalTimestamp write the time of activation or specified value */
    return detailed[clearUlr]['showModalTimestamp'] = time;
}


function _getTranslate() {
    return translate;
}

function _setTranslate(lang, name, val) {
    translate[lang][name] = val;
}


function _getLinks() {
    return links
}


/**
 * Get clear url without http:// and parameters
 * With punycode get cirillic domains
 * @param val
 * @returns {*}
 */

function getClearUrl(val) {
    if (val) {

        if (/(.com\.br)\//.test(val)) {//регулярка для доменов типа ... .com.br/
            val = val.match(/\/\/.*?(www\.|)(([\w\d_\-\.]+)\.(com\.br))\//)
        } else {
            val = val.match(/(http(s)?:\/\/)?(?:www)?([^\/]+\.)?(([а-яА-ЯёЁ\w\d_\-]+)\.([а-яА-ЯёЁ\w\d_\-]+))([\/\?].*)?/);
        }
    }
    if ((val) && (val[4])) {
        return punycode.toUnicode((val[4]));
    } else {
        // console.error(e);
    }
}

/**
 * Safe-response Opera's method
 * https://github.com/operatester/safeResponse/blob/1.1/safeResponse.js
 * @type {{cleanDomString}}
 */
safeResponse = function () {

    let validAttrs = ["class", "id", "href", "style"];

    this.__removeInvalidAttributes = function (target) {
        let attrs = target.attributes, currentAttr;

        for (let i = attrs.length - 1; i >= 0; i--) {
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
        let parser = new DOMParser;
        let tmpDom = parser.parseFromString(data, "text/html").body;

        let list, current, currentHref;

        list = tmpDom.querySelectorAll("script,img");

        for (let i = list.length - 1; i >= 0; i--) {
            current = list[i];
            current.parentNode.removeChild(current);
        }

        list = tmpDom.getElementsByTagName("*");

        for (let i = list.length - 1; i >= 0; i--) {
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

/**
 * There we use check for all parameters of all objects to safe response (for partnersData array)
 * Проверяем ответ сервера согласно требованиям Opera
 * @param obj
 */
function checkSafeResponse(obj) {




    for (let key in obj) {//перебираем все свойства объекта
        if ((obj.hasOwnProperty(key)) && obj[key]) {
            if ((obj[key].length > 0) && (!isNaN(obj[key]))) {//если число и не пустое значение
                obj[key] = parseFloat(obj[key]);
            } else if (obj[key].constructor === Array) {//массив как объект, если не пустой
                obj[key].length > 0 ? checkSafeResponse(obj[key]) : obj[key] = []
            } else {
                switch (typeof(obj[key])) {
                    case 'string'://строки прогоняем через saferesponce
                        obj[key] = safeResponse.cleanDomString(obj[key]);
                        break;
                    case 'number'://доп. проверка на число
                        obj[key] = parseFloat(obj[key]);
                        break;
                    case 'object'://если вложенный объект. то рекурсивно проверяем
                        checkSafeResponse(obj[key]);
                        break;
                    default:
                        obj[key] = safeResponse.cleanDomString(obj[key]);
                        break;
                }
            }
        }
    }
    return obj;
}





/**
 * Get random value in interval, borders including
 * @param min
 * @param max
 */
function getRandomValue(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



/**
 * Round float numbers
 * @param val {number} - rounded number
 * @param afterComa {number} - quantity of numbers after comma
 * @returns {number}
 */
function roundNumber(val, afterComa) {

    if (val % 1 > 0 && afterComa > 0) {
        return parseFloat(( Math.round(val * Math.pow(10, afterComa)) / Math.pow(10, afterComa) ));
    } else return parseInt(val);

}
