/**
 * Created by CityLife on 23.12.16.
 */
console.log('--common--');

/*
* Константы
* */
var CL_ALI_UID = 'yVF2rZRRj';           //идентификатор ситилайф в алиэкспресс
var ALI_CLEAR = 'aliexpress.com';       //"чистый" урл Aliexpress.com
var ALI_COOKIE = 'aeu_cid';             //кука Aliexpress
var SESSION_TIME = 840000;              //840000 = 14 мин. Для обновления сессии пользователя. Чтоб не вылетала
var SERVER_DATA_UPDATE_TIME = (86400000 - (Math.random() * 7200000)); //86400000 =  сутки. Интервал обновления Данных партнеров от 22 часов до 24 часов
var TIMER_LIFE = 86400000;              //86400000 =  сутки. Время жизни отображения активного кэшбка
//var MODAL_MARKERS_LIFE = 3600000;     //3600000 = 1 час. Интервал повторного отображения модалок ("ремодалок")


/*
* Исходные значения изменяющихся данных
* */
var loginData = {'test': 1};//TODO вернуть пустой объект                    //данные пользователя
var partnersData = {};                  //рабочий объект данных партнеров .
var partnersDataCustom = {};            //промежуточный объект данных партнеров с ссылками на сайт
var partnersDataAdmitad = {};           //промежуточный объект данных партнеров с кэшбэк-ссылками
var partnersVisited = {};               //объект посещенных партнеров
var modalMarkers = [0];                 // для отслеживания ПОЯВЛЕНИЯ модалок внутри страниц. Первый элемент массива не проходит, поэтому ставим пустой элемент
var timers = {};                        //время запуска активных кэшбэков. Продолжительность жизни = TIMER_LIFE
var modalShowed = false;                //маркер, отображалась ли ремодалка. Исопльзуется для ремодалки, которая должна отобразиться, только если до этого появлялась модалка. Работает только для али.
var remodalShowed = false;              //маркер, отображалась ли ремодалка
var authIdentifier = -1;                 // 0 - не авторизован , >0 (id) - авторизован
var currentCookie = 0;                 // текущее значение куки авторизации. Не должно быть равно по дефолту authIdentifier, поэтому -1. Используем, так как нет возможности брать куки в любой момент с коллбеком.


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


    for (var key in obj) {//перебираем все свойства объекта
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
        var currentTime = new Date().getTime();
        if ((currentTime - timers[el]) > TIMER_LIFE) {
            delete timers[el];
            modalMarkers = [0];//TODO настроить индивидуально для каждой модалки
        }
    }
}
