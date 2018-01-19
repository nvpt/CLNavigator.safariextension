/**
 * Created by CityLife on 23.12.16.
 */
// console.log('--common--');

/*
* Константы
* */
let CL_ALI_UID = 'yVF2rZRRj';           //идентификатор в алиэкспресс
let ALI_CLEAR = 'aliexpress.com';       //чистый урл Aliexpress.com
let ALI_COOKIE = 'aeu_cid';             //кука Aliexpress
let AUTHORISATION_UPDATE_TIME = 10800000;//10800000 = 3 часа. Раз в три часа проверяем авторизацию
let PARTNERS_UPDATE_TIME = (86400000 - (Math.random() * 7200000)); //86400000 =  сутки. Интервал обновления Данных партнеров от 22 часов до 24 часов
let TIMER_LIFE = 86400000;              //86400000 =  сутки. Время жизни отображения активного кэшбка
//let MODAL_MARKERS_LIFE = 3600000;     //3600000 = 1 час. Интервал повторного отображения модалок ("ремодалок")


/*
* Исходные значения изменяющихся данных
* */
let partnersData = {};                  //рабочий объект данных партнеров .
let partnersDataCustom = {};            //промежуточный объект данных партнеров с ссылками на сайт
let partnersDataAdmitad = {};           //промежуточный объект данных партнеров с кэшбэк-ссылками
let partnersVisited = {};               //объект посещенных партнеров
let modalMarkers = [0];                 // для отслеживания ПОЯВЛЕНИЯ модалок внутри страниц. Первый элемент массива не проходит, поэтому ставим пустой элемент
let timers = {};                        //время запуска активных кэшбэков. Продолжительность жизни = TIMER_LIFE
let modalShowed = false;                //маркер, отображалась ли ремодалка. Исопльзуется для ремодалки, которая должна отобразиться, только если до этого появлялась модалка. Работает только для али.
let remodalShowed = false;              //маркер, отображалась ли ремодалка

let loginData = {default_start: 1};     //данные пользователя
let authIdentifier = 0;                 // 0 - не авторизован , >0 (id) - авторизован.
let authCookie = 0;                     // текущее значение куки авторизации. Необходима для сравнения иденттификатора со значением куки


/*
* Геттеры-сеттеры
* */
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

/**
 * Регулярка для отображения требуемого вид урла
 *
 * Учитываются кириллические домены (punicode)
 * @param val
 * @returns {*}
 */
function getClearUrl(val) {
    if(val) { //если урл не указан, пропускаем

        if (/(.com\.br)\//.test(val)) {//регулярка для доменов типа ... .com.br/
            val = val.match(/\/\/.*?(www\.|)(([\w\d_\-\.]+)\.(com\.br))\//)
        } else {
            val = val.match(/(.+\.)?(([а-яА-ЯёЁ\w\d_\-]+)\.([а-яА-ЯёЁ\w\d_\-]+))\//);
        }
    }
    if ((val) && (val[2])) {
        return punycode.toUnicode((val[2]));
    } else {
        // console.error(e);
        return false;
    }
}


/**
 * There we use check for all parameters of all objects to safe response (for partnersData array)
 * Проверяем ответ сервера согласно требованиям Opera
 * @param obj
 */
function checkSafeResponse(obj) {

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
}






/**
 * Проверка времени жизни активного кэшбэка
 * @param el
 */
function checkTimers(el) {
    if (timers.hasOwnProperty(el)) {
        let currentTime = new Date().getTime();
        if ((currentTime - timers[el]) > TIMER_LIFE) {
            delete timers[el];
            modalMarkers = [0];//TODO настроить индивидуально для каждой модалки
        }
    }
}
