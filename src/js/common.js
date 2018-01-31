/**
 * Created by CityLife on 23.12.16.
 */
/* ============= CONSTANTS, VARIABLES ============= */
/* реактивация кэшбэка *///TODO переделать
var CL_ALI_UID = '3Vby3rfe6';             // our new identifier in AliE
var ALI_CLEAR = 'aliexpress.com';         // clear url of Aliexpress.com
var ALI_COOKIE = 'aeu_cid';               // need cookie name of Aliexpress


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
