/**
 * Created by CityLife on 14.04.17.
 */





/**
 * Получение "чистого" урла открытой вкладки
 * Срабатывает для обычных доменов типа http://xxx.xxxx.xx/sdfs/sdfs/...
 * Из урла все домены четвертого и тп. уровня и хвост урла после первого слеша (вместе с ним).
 *
 * Учитываются кириллические домены
 * @param val
 * @returns {*}
 */

function getClearUrl(val) {
    console.log('val!!! ', val);
    val = val.match(/\/\/.*?([а-яА-ЯёЁa-zA-Z0-9\-_\.]+\.|)([а-яА-ЯёЁa-zA-Z0-9\-_\.]+\.[а-яА-ЯёЁa-zA-Z0-9\-_\.]+)\//);
    if ((val) && (val[2])) {
        console.log('val!!!2 ', punycode.toUnicode((val[2])));
        return punycode.toUnicode((val[2]));
    } else {
        console.error('error');
    }
}



var cookies = document.cookie.split(';');
safari.self.tab.dispatchMessage("setCookies",cookies);
console.log('ccc ', cookies);
// var cookies = null;

function getCookies(incMsg) {
    cookies = incMsg.message;
    console.log('ccc 2 ', cookies);
}

safari.application.addEventListener("message",getCookies,false);
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

/**
 * There we use check for all parameters of all objects to safe response (for partnersData array)
 * Проверяем ответ сервера согласно требованиям Opera
 * @param obj
 */
function checkSafeResponse(obj) {
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