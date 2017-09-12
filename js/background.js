/**
 * Created by CityLife on 23.12.16.
 */
console.log('загрузка bg');

var CL_ALI_UID = 'yVF2rZRRj';           //идентификатор ситилайф в алиэкспресс
var ALI_CLEAR = 'aliexpress.com';       //"чистый" урл Aliexpress.com
var ALI_COOKIE = 'aeu_cid';             //кука Aliexpress
var SESSION_TIME = 840000;              //840000 = 14 мин. Для обновления сессии пользователя. Чтоб не вылетала
var SERVER_DATA_UPDATE_TIME = (86400000 - (Math.random() * 7200000)); //86400000 =  сутки. Интервал обновления Данных партнеров от 22 часов до 24 часов
var TIMER_LIFE = 86400000;              //86400000 =  сутки. Время жизни отображения активного кэшбка
//var MODAL_MARKERS_LIFE = 3600000;     //3600000 = 1 час. Интервал повторного отображения модалок ("ремодалок")

var loginData = {'test': 1};                     //данные пользователя
var partnersData = {};                  //рабочий объект данных партнеров .
var partnersDataCustom = {};            //промежуточный объект данных партнеров с ссылками на сайт
var partnersDataAdmitad = {};           //промежуточный объект данных партнеров с кэшбэк-ссылками
var partnersVisited = {};               //объект посещенных партнеров

var modalMarkers = [0];                 // для отслеживания ПОЯВЛЕНИЯ модалок внутри страниц. Первый элемент массива не проходит, поэтому ставим пустой элемент
var timers = {};                        //время запуска активных кэшбэков. Продолжительность жизни = TIMER_LIFE
var modalShowed = false;                //маркер, отображалась ли ремодалка. Исопльзуется для ремодалки, которая должна отобразиться, только если до этого появлялась модалка. Работает только для али.
var remodalShowed = false;              //маркер, отображалась ли ремодалка
var authIdentifier = 0;                 // 0 - не авторизован , >0 (id) - авторизован
var currentCookie = -1;                 // текущее значение куки авторизации. Не должно быть равно по дефолту authIdentifier, поэтому -1. Исопльзуем, так как нет возможности брать куки в любой момент сколлбеком.

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

//Куки
var cookiesMain = document.cookie.split(';');//не удалять этот блок. работает  в сторону браузера. С ним можем отслеживать куки в расширении
if (safari.self.tab) {//для отработки в страницах браузера. В background не сработает
    safari.self.tab.dispatchMessage("setCookies", cookiesMain);
    // console.log('browser cookiesMain ', cookiesMain);
}

function cookiesToObj(arr) {
    var obj = {};
    for (var i = 0; i < arr.length; i++) {
        var cookie = arr[i].split('=');
        var cookieName = cookie[0].trim();
        var cookieValue = cookie.splice(1, cookie.length).join('=');
        obj[cookieName] = cookieValue;
    }
    return obj;
}

function getCookiesAuth(incMsg) {//TODO настроить проверку р-куки
    var cookies = incMsg;
    // console.log('cookies ', cookies);
    var cookiesValue = incMsg.message;
    var cookiesUrl = incMsg.target['url'];
    if (cookiesUrl !== undefined && (cookiesUrl.indexOf('cl.world') !== -1) && (cookiesValue !== "")) {
        currentCookie = cookiesToObj(cookiesValue)['auth'];
    }
}

safari.application.addEventListener("message", getCookiesAuth, false);//проверяем куку авторизации; выполняется при каждом обновлении страницы


function _getCookies(url, name, cb) {//for aliexpress//TODO проверить корректность работы
    safari.cookies.get({
        url: url,
        name: name
    }, cb);
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


/* Обработчики иконок */

/**
 * Иконка не партнера. дефолтная
 */
function markNotPartner() {
    var iconUri = safari.extension.baseURI + 'img/logo.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


/**
 * Иконка на партнере
 */
function markPartner() {
    var iconUri = safari.extension.baseURI + 'img/balance.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}

/**
 * Анимация вращения иконки при активации
 */
//TODO описать вращения иконки
function markCheckPartner() {
    var iconUri = safari.extension.baseURI + 'img/dynamic.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}

/**
 * Иконка кэшбэка
 */
function markCashbackActive() {
    var iconUri = safari.extension.baseURI + 'img/search.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


/**
 * Изменение индикации иконки расширения
 * @param url
 */
function changeIcon(url) {
    var clearUrl = getClearUrl(url);
    if ((clearUrl !== undefined) && (partnersData[clearUrl])) {
        checkTimers(clearUrl);//сначала проверям, еще живой таймер кэшбка
        if (timers[clearUrl]) {//и затем в зависимости от условия меняем иконку
            markCashbackActive();
        } else {
            markPartner();
        }
    } else {
        markNotPartner();
    }
}


/* Запросы */

/**
 * Перезаписываем массив объектов партнеров в объект объектов
 * @param arr
 * @param obj
 */
function arrayToObj(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        var partner = arr[i];
        // if(!partner.site_url){//проверка на корректность указанного урла
        //     console.log('partner no url ', partner);
        // }
        obj[getClearUrl(partner.site_url)] = partner;
    }
}


/**
 * Запрос данных пользователя
 * @param resolve
 * @param reject
 */
function reqProfile(resolve, reject) {
    var url = 'https://cl.world/api/v2/profile/menu';
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.addEventListener('load', function () {
        if (req.status === 200) {
            var response = JSON.parse(req.responseText.replace(/<[^>]*>?/g, ''));
            resolve(response);
        } else {
            console.error('error authorization');
            reject();
        }
    });
}


/**
 * Запрос данных партнеров
 * @param resolve
 * @param reject
 */
function partnersDataRequest(resolve, reject) {
    var url = 'https://cl.world/api/v2/cases/index?limit=10000&show=1&non_strict=0&lang=ru&r1=' + Math.random();
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.addEventListener('load', function () {
        if (req.status === 200) {
            var response = JSON.parse(req.responseText);
            for (var i = 0; i < response.length; i++) {
                checkSafeResponse(response[i]);
            }

            resolve(response);
        } else {
            reject();
        }
    })
}


/**
 * Сброс авторизации
 */
function resetAuthorisation() {
    loginData = {};
    timers = {};
    authIdentifier = 0;
    currentCookie = -1;
}


/**
 * Проверка авторизации
 */
function checkAuthorization() {
    reqProfile(function (resp) {
        loginData = resp;
    }, function () {
        resetAuthorisation();
    });
}

//чтобы не вылетала авторизация, каждые SESSION_TIME пингуем наш сервер
setInterval(checkAuthorization, SESSION_TIME);

/**
 * Загрузка данных партнеров
 */
function uploadServerData() {
// console.log('ipload currentCookie ', currentCookie);
// console.log('ipload currentCookie = -1 ', parseInt(currentCookie) === -1);
// console.log('ipload authIdentifier ', authIdentifier);
// console.log('ipload loginData1 ', loginData);

    if (parseInt(currentCookie) !== -1) {

        if (parseInt(authIdentifier) !== parseInt(currentCookie)) {
            reqProfile(
                function (resp) {
                    loginData = resp;
                    authIdentifier = parseInt(currentCookie);
                },
                function () {
                    resetAuthorisation();
                }
            );
            timers = {};//сбрасываем время посещения парттнеров для нового пользователя
        }


        if (Object.keys(partnersDataAdmitad).length === 0) {

            partnersDataRequest(
                function (res) {
                    arrayToObj(res, partnersDataAdmitad);
                    partnersData = partnersDataAdmitad;
                },
                function () {
                    // console.info('Партнеры не загружены');
                }
            );
        }
        partnersData = partnersDataAdmitad;

    } else {
        resetAuthorisation();

        if (Object.keys(partnersDataCustom).length === 0) {

            partnersDataRequest(
                function (res) {
                    arrayToObj(res, partnersDataCustom);
                    partnersData = partnersDataCustom;
                },
                function () {

                }
            );
        }
        partnersData = partnersDataCustom;
    }

}

//загрузка данных партнеров при первом запуске
uploadServerData();


/**
 * Обновление данных партнеров. Для периодической загрузки данных раз в 22 - 24 часа
 */

function updateServerData() {

    reqProfile(
        function (resp) {
            loginData = resp;
        },
        function () {
            resetAuthorisation();
        }
    );

    partnersDataRequest(//запрос в любом случае, поэтому условия внутри
        function (res) {
            if (parseInt(currentCookie) !== -1) {
                arrayToObj(res, partnersDataAdmitad);
                partnersData = partnersDataAdmitad;
            } else {
                resetAuthorisation();
                arrayToObj(res, partnersDataCustom);
                partnersData = partnersDataCustom;
            }

        },
        function () {
            // console.info('Партнеры не загружены');
        });
}

setInterval(updateServerData, SERVER_DATA_UPDATE_TIME);


/* Проверяем наличие данных партнера в массиве. Если нет, то запрашиваем */
function addPartnerToVisited(url) {
    var clearUrl = getClearUrl(url);
    if ((clearUrl !== undefined) && (!partnersVisited[clearUrl]) && (partnersData[clearUrl])) {
        partnersVisited[clearUrl] = partnersData[clearUrl];
        markCheckPartner();
        setTimeout(function () {
            markPartner();
        }, 1000);
    }
}


/**
 * Проверяем, было ли уже показано модальное окно
 * @param partner
 */
function checkModalMarkerAdded(partner) {
    var markerAdded = false;
    for (var i = 0; i < modalMarkers.length; i++) {
        if (partner.id === modalMarkers[i]) {
            markerAdded = true;
        }
    }
    if (!markerAdded) {
        modalMarkers.push(partner.id);
    }
}


/* Действия с табами */
function clickTab() {
    var currentUrl = safari.application.activeBrowserWindow.activeTab.url;//урл текущей вкладки
    console.log('clickTab');
    changeIcon(currentUrl);//при клике сверяем актуальность иконки
    addPartnerToVisited(currentUrl);

}


function reloadTab() {
    console.log('reloadTab');
    var currentUrl = safari.application.activeBrowserWindow.activeTab.url;//урл текущей вкладки
    changeIcon(currentUrl);
    uploadServerData();
    addPartnerToVisited(currentUrl);
    test();
}


/* Обработчики */
if (safari.application) {
    safari.application.activeBrowserWindow.addEventListener("activate", clickTab, true);//клик по табу
    safari.application.activeBrowserWindow.addEventListener("navigate", reloadTab, true);//клик по табу
}


/* Мост между content и background */

// safari.runtime.onConnect.addListener(function (port) {
//     port.onMessage.addListener(function (msg) {
window.addEventListener("message", function (port) {
        var msg = port.data;
        //порядок запросов не менять
        // console.log('МОСТ');
        if (msg.from === 'content') {
            var contentUrl = msg.url;
            var clearUrl = getClearUrl(contentUrl);

            if (msg.id === 'modalMarkerAdded') {
                if (partnersData[clearUrl]) {
                    var partner = partnersData[clearUrl];
                    checkModalMarkerAdded(partner);
                }
            }

            if (msg.id === 'setCashbackClick') {
                modalShowed = true;
                remodalShowed = false;
                if (Object.keys(loginData).length > 0) { //если юзер залогинен, активируем кэшбэк по клику
                    _addToTimers(clearUrl, msg.timer);
                    for (var i = 0; i < modalMarkers.length; i++) {
                        if (modalMarkers[i] === msg.partnerId) {
                            modalMarkers.splice(i, 1);//удаляем маркер отображени модалки, чтобы после активации кэшбэка модалка отобразилась заново еще раз
                        }
                    }
                }
            }

            if (msg.id === 'remodalShowed') {//активация маркера remodalShowed
                remodalShowed = msg.remodalShowed;
            }

            if (msg.id === 'startConnect') {//начальная связь от content.js

                if (partnersData[clearUrl]) {
                    partner = partnersData[clearUrl];

                    window.postMessage({//и отправляем в контент колбэк с этими данными
                        from: 'bg',
                        id: 'showModal',
                        currentPartner: partner,
                        timers: timers,
                        modalMarkers: modalMarkers,
                        loginData: _getLoginData()
                    }, '*');
                }

                if (clearUrl === ALI_CLEAR) {//если сайт - Aliexpress
                    _getCookies(contentUrl, ALI_COOKIE, function (e) {//кука aeu_cid содежит наш идентификатор "yVF2rZRRj"?
                        if ((e) && (e.value.indexOf(CL_ALI_UID) === -1)) {//если нет, то отправляем в контент данные алиэкспресс из массива partnersData, чтобы отобразить ремодалку
                            if (partnersData[clearUrl]) {
                                delete timers[ALI_CLEAR];
                                window.postMessage({//и запустим в контенте колбэк с этими данными
                                    from: 'bg',
                                    id: 'showRemodal',
                                    currentPartner: partner,
                                    timers: timers,
                                    modalMarkers: modalMarkers,
                                    modalShowed: modalShowed,
                                    remodalShowed: remodalShowed
                                }, '*');
                            }
                        } else {//если да
                            window.postMessage({//запустим колбэк для скрытия ремодалки
                                from: 'bg',
                                id: 'hideRemodal'
                            }, '*');
                        }
                    });
                }
            }
        }
    }
);
// });

function test(){
    var currentUrl='111';

    if(safari && safari.application){
        currentUrl = safari.application.activeBrowserWindow.activeTab.url;
        var clearUrl = getClearUrl(currentUrl);
        console.log('start---------');
        console.log('currentUrl ', currentUrl);
        console.log('clearUrl ', clearUrl);
        console.log('partnersData[clearUrl] ', partnersData['moon-trade.ru']);
        console.log('partnersData ', partnersData);
        console.log('end---------');
    } else {
        currentUrl = window.location.href;
        console.log(222);
    }

    var test1 = document.createElement('div');
    test1.classList.add('test1');
    test1.style.position = 'fixed';
    test1.style.zIndex = 9000;
    test1.style.top = 0;
    test1.style.left = 0;
    test1.style.width = '300px';
    test1.style.height = '300px';
    test1.style.background = 'red';
    test1.innerText = currentUrl;

    window.addEventListener('load', function () {
        console.log('document ' , document);

        document.body.appendChild(test1);
    });

}

test();