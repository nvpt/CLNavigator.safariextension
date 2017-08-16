/**
 * Created by CityLife on 23.12.16.
 */
// console.log('загрузка bg');

var CL_ALI_UID = 'yVF2rZRRj';           //идентификатор ситилайф в алиэкспресс
var ALI_CLEAR = 'aliexpress.com';       //"чистый" урл Aliexpress.com
var ALI_COOKIE = 'aeu_cid';             //кука Aliexpress
var SESSION_TIME = 840000;              //840000 = 14 мин. Для обновления сессии пользователя. Чтоб не вылетала
var SERVER_DATA_UPDATE_TIME = 86400000; //86400000 =  сутки. Интервал обновления Данных партнеров
var TIMER_LIFE = 86400000;              //86400000 =  сутки. Время жизни отображения активного кэшбка
//var MODAL_MARKERS_LIFE = 3600000;     //3600000 = 1 час. Интервал повторного отображения модалок ("ремодалок")

var authorizationStatus = 0;
var loginData = {'test': 1};                     //данные пользователя
var partnersData = {};                  //рабочий объект данных партнеров .
var partnersDataCustom = {};            //промежуточный объект данных партнеров с ссылками на сайт
var partnersDataAdmitad = {};           //промежуточный объект данных партнеров с кэшбэк-ссылками
var partnersVisited = {};               //объект посещенных партнеров

var modalMarkers = [0];                 // для отслеживания ПОЯВЛЕНИЯ модалок внутри страниц. Первый элемент массива не проходит, поэтому ставим пустой элемент
var modalMarkerAdded = false;           // отображалась ли модалка на текущей странице
var setCashbackClick = false;           // клик в текущей модалке для активации кэшбэка
var timers = {};                        //время запуска активных кэшбэков. Продолжительность жизни = TIMER_LIFE
var modalShowed = false;                //маркер, отображалась ли ремодалка. Исопльзуется для ремодалки, которая должна отобразиться, только если до этого появлялась модалка. Работает только для али.
var remodalShowed = false;              //маркер, отображалась ли ремодалка



var SHOW_MODAL_TIME = 50;//5000//TODO temp
var HIDE_MODAL_TIME = 5000000;//TODO temp //15000//15000 = 20сек. Время скрытия модалки после отображения. Поставить секунд 15-20
var HIDE_CASHBACK_TIME = 120000;//7000 = 7сек. Время скрытия модалки после демонстрации, что кэшбэк активен


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
var cookiesMain = document.cookie.split(';');
if (safari.self.tab) {//для отработки в страницах браузера. В background не сработает
    safari.self.tab.dispatchMessage("setCookies", cookiesMain);
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
    var cookiesValue = incMsg.message;
    var cookiesUrl = incMsg.target['url'];
    if (cookiesUrl !== undefined && (cookiesUrl.indexOf('clcorp.ru') !== -1)) {
        authorizationStatus = cookiesToObj(cookiesValue)['auth'];
        // console.log('authorizationStatus ', authorizationStatus);
        uploadServerData();
    }//берем из кук индекс авторизации


}
if(safari && safari.application){
    safari.application.addEventListener("message", getCookiesAuth, false);
}


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
    safari.extension.toolbarItems[0].label = '...';
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
    var url = 'https://clcorp.ru/api/v2/profile/menu';
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.addEventListener('load', function () {
        if (req.status === 200) {
            var response = JSON.parse(req.responseText.replace(/<[^>]*>?/g, ''));
            // console.log('reqProfileRequest!');
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
    var url = 'https://clcorp.ru/api/v2/cases/index?limit=10000&show=1&non_strict=0&r1=' + Math.random();
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
 * Загрузка данных партнеров
 */
function uploadServerData() {

    if (parseInt(authorizationStatus) === 1) {

        if (!loginData.profile) {
            reqProfile(
                function (resp) {
                    loginData = resp;
                },
                function () {
                    loginData = {};
                }
            );
        } else {
            return;
        }

        if (Object.keys(partnersDataAdmitad).length === 0) {

            partnersDataRequest(
                function (res) {
                    arrayToObj(res, partnersDataAdmitad);
                    partnersData = partnersDataAdmitad;
                    // console.log('partnersData 1', partnersData);
                },
                function () {
                    console.info('Партнеры не загружены');
                }
            );
        }
        partnersData = partnersDataAdmitad;

    } else {
        loginData = {};
        timers = {};

        if (Object.keys(partnersDataCustom).length === 0) {

            partnersDataRequest(
                function (res) {
                    arrayToObj(res, partnersDataCustom);
                    partnersData = partnersDataCustom;
                    // console.log('partnersData 2', partnersData);
                },
                function () {
                    console.log('reject');
                }
            );
        }
        partnersData = partnersDataCustom;
    }
}

//загрузка данных партнеров при первом запуске
uploadServerData();



/**
 * Обновление данных партнеров. Для периодической загрузки данных.
 */
//TODO настроить в определенное время вечером в рандомном интервале двух часов
function updateServerData() {

    reqProfile(
        function (resp) {
            loginData = resp;
        },
        function () {
            loginData = {};
            timers = {};
            authorizationStatus = 0;
        }
    );

    partnersDataRequest(
        function (res) {

            if (parseInt(authorizationStatus) === 1) {
                arrayToObj(res, partnersDataAdmitad);
                partnersData = partnersDataAdmitad;
                // console.log('partnersData 3', partnersData);
            } else {
                loginData = {};
                timers = {};
                arrayToObj(res, partnersDataCustom);
                partnersData = partnersDataCustom;
                // console.log('partnersData 4', partnersData);
            }

        });
}

setInterval(updateServerData, SERVER_DATA_UPDATE_TIME);


/**
 * Проверка авторизации
 */
function checkAuthorization() {
    reqProfile(function (resp) {
        loginData = resp;
    }, function () {
        loginData = {};
        timers = {};
        authorizationStatus = 0;
    });
}

//чтобы не вылетала авторизация, каждые SESSION_TIME пингуем наш сервер
setInterval(checkAuthorization, SESSION_TIME);


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
    // console.log('clickTab');
    changeIcon(currentUrl);//при клике сверяем актуальность иконки
    addPartnerToVisited(currentUrl);

}

function reloadTab() {
    // console.log('reloadTab');
    var currentUrl = safari.application.activeBrowserWindow.activeTab.url;//урл текущей вкладки
    changeIcon(currentUrl);
    uploadServerData(currentUrl);
    addPartnerToVisited(currentUrl);
    // console.log('loginData ', loginData);
}


/* Обработчики */
if (safari && safari.application) {
    safari.application.activeBrowserWindow.addEventListener("activate", clickTab, true);//клик по табу
    safari.application.activeBrowserWindow.addEventListener("navigate", reloadTab, true);//клик по табу
}


function renderModal(){

    var ANCHOR = document.createElement('div');
    var modalHeader = document.createElement('div');
    var clLogo = document.createElement('div');
    var clLogoImg = document.createElement('img');
    var close = document.createElement('div');
    var modalBody = document.createElement('div');
    var clPartner = document.createElement('div');
    var clPartnerLogo = document.createElement('img');
    var clPartnerInfo = document.createElement('div');
    var cashbackLabel = document.createElement('span');
    var cashbackValue = document.createElement('span');
    var modalFooter = document.createElement('div');
    var cashbackActive = document.createElement('div');
    var clButtonWrap = document.createElement('div');
    var clButton = document.createElement('a');
    var reactivation = document.createElement('div');




    var currentUrl = '';

    if(safari && safari.application){
        currentUrl = safari.application.activeBrowserWindow.activeTab.url;
    } else {
        currentUrl = window.location.href;
    }

    var clearUrl = getClearUrl(currentUrl);

    if (modalMarkerAdded) {
        if (partnersData[clearUrl]) {
            var partner = partnersData[clearUrl];
            checkModalMarkerAdded(partner);
        }
    }

    function activateCashbackInModal(){
        modalShowed = true;
        remodalShowed = false;//TODO заскомментить?
        if (Object.keys(loginData).length > 0) { //если юзер залогинен, активируем кэшбэк по клику
            _addToTimers(clearUrl, new Date().getTime());
            for (var i = 0; i < modalMarkers.length; i++) {
                if (modalMarkers[i] === partner.id) {
                    modalMarkers.splice(i, 1);//удаляем маркер отображени модалки, чтобы после активации кэшбэка модалка отобразилась заново еще раз
                }
            }
        }
    }
    // if (msg.id === 'setCashbackClick') {
    //   modalShowed = true;
    //   remodalShowed = false;
    //   if (Object.keys(loginData).length > 0) { //если юзер залогинен, активируем кэшбэк по клику
    //     _addToTimers(clearUrl, msg.timer);
    //     for (var i = 0; i < modalMarkers.length; i++) {
    //       if (modalMarkers[i] === msg.partnerId) {
    //         modalMarkers.splice(i, 1);//удаляем маркер отображени модалки, чтобы после активации кэшбэка модалка отобразилась заново еще раз
    //       }
    //     }
    //   }
    // }



    // if (msg.id === 'remodalShowed') {//активация маркера remodalShowed
    //   remodalShowed = msg.remodalShowed;
    // }






    //Старт. Отображение модалки
    if (partnersData[clearUrl]) {
        partner = partnersData[clearUrl];


        // window.postMessage({//и отправляем в контент колбэк с этими данными
        //     from: 'bg',
        //     id: 'showModal',
        //     currentPartner: partner,
        //     timers: timers,
        //     modalMarkers: modalMarkers,
        //     loginData: _getLoginData()
        // }, '*');

        //рендер компонентнов модалки, showModal
        ANCHOR.id = 'modalCL2017';
        ANCHOR.classList.add('modalCL2017');

        modalHeader.classList.add('modalCL2017__header');

        clLogo.classList.add('cl-logo');

        clLogoImg.classList.add('cl-logo__img');
        clLogoImg.setAttribute('src', 'https://clcorp.ru/images/extenion/logo.png');

        close.classList.add('cl-close');

        modalBody.classList.add('modalCL2017__body');

        clPartner.classList.add('cl-partner');

        clPartnerLogo.classList.add('cl-partner__logo');
        clPartnerLogo.setAttribute('src', '');

        clPartnerInfo.classList.add('cl-partner__info');

        cashbackLabel.classList.add('cashback-label');
        cashbackLabel.innerText = 'Кэшбэк: ';

        cashbackValue.classList.add('cashback-value');
        cashbackValue.innerText = '';

        modalFooter.classList.add('modalCL2017__footer');

        cashbackActive.classList.add('cashback-active');
        cashbackActive.innerText = 'Кэшбэк активирован';

        clButtonWrap.classList.add('button-cl__wrapper');

        clButton.innerHTML = '<span>Активировать</span>';
        clButton.classList.add('button-cl', 'button-cl_pink', 'cl-partner__link', 'button-cl_glass');
        clButton.setAttribute('href', '');

        clButtonWrap.appendChild(clButton);

        modalFooter.appendChild(cashbackActive);
        modalFooter.appendChild(clButtonWrap);

        clPartnerInfo.appendChild(cashbackLabel);
        clPartnerInfo.appendChild(cashbackValue);

        clPartner.appendChild(clPartnerLogo);
        clPartner.appendChild(clPartnerInfo);

        modalBody.appendChild(clPartner);

        clLogo.appendChild(clLogoImg);

        modalHeader.appendChild(clLogo);
        modalHeader.appendChild(close);

        ANCHOR.appendChild(modalHeader);
        ANCHOR.appendChild(modalBody);
        ANCHOR.appendChild(modalFooter);

        for (var i = 0; i < modalMarkers.length; i++) { //если маркер отображения есть то модалку прячем. Смотрим по маркеру из массива в background.js

            if (modalMarkers[i] === partner.id) {
                ANCHOR.style.opacity = 0;
                ANCHOR.style.display = 'none';
                return;
            }
        }

        ANCHOR.style.display = 'flex';
        ANCHOR.style.opacity = 1;


        if (!document.querySelector("#modalCL2017")) {//пресекаем дублирование добавления модалки

            setTimeout(function () {
                document.body.appendChild(ANCHOR);
            }, SHOW_MODAL_TIME);

            close.addEventListener('click', function () {
                ANCHOR.style.display = 'none';
                modalMarkerAdded = true;//TODO затем сбросить
                // window.postMessage({
                //     from: 'content',
                //     id: 'modalMarkerAdded',
                //     url: currentUrl
                // }, '*');
            });
        }

        if (document.querySelector("#remodalCL2017")) {//на всякий случай прячем ремодалку
            document.querySelector("#remodalCL2017").style.display = 'none';
        }


        setTimeout(function () {
            ANCHOR.style.display = 'none';
            modalMarkerAdded = true;//TODO затем сбросить
            // window.postMessage({
            //     from: 'content',
            //     id: 'modalMarkerAdded',
            //     url: currentUrl
            // }, '*');
        }, HIDE_MODAL_TIME);

        //отображение информации об активном кэшбэке зависит от данных в timers
        if ((timers) && (timers.hasOwnProperty(getClearUrl(currentUrl)))) {
            modalMarkerAdded = true;//TODO затем сбросить
            // window.postMessage({
            //     from: 'content',
            //     id: 'modalMarkerAdded',
            //     url: currentUrl
            // }, '*');
            cashbackActive.style.display = 'flex';
            setTimeout(function () {//после уведомления модалкой об активации кэшбэка, автоматически прячем ее через HIDE_CASHBACK_TIME
                ANCHOR.style.display = 'none';
            }, HIDE_CASHBACK_TIME);

        } else {
            cashbackActive.style.display = 'none';
        }

        clPartnerLogo.setAttribute('src', partner.logo_url);
        cashbackValue.innerText = partner.sale_text;

        clButton.setAttribute('href', partner.href);

        clButton.addEventListener('click', function () {//функция активации кэшбэка из модалки. После задействования в background передается об этом информация

            // window.postMessage({
            //     from: 'content',
            //     id: 'setCashbackClick',
            //     url: currentUrl,
            //     timer: new Date().getTime(),
            //     partnerId: partner.id
            // }, '*');

            activateCashbackInModal();

        });

    }





    if (clearUrl === ALI_CLEAR) {//если сайт - Aliexpress
        _getCookies(currentUrl, ALI_COOKIE, function (e) {//кука aeu_cid содежит наш идентификатор "yVF2rZRRj"?
            if ((e) && (e.value.indexOf(CL_ALI_UID) === -1)) {//если нет, то отправляем в контент данные алиэкспресс из массива partnersData, чтобы отобразить ремодалку
                if (partnersData[clearUrl]) {
                    delete timers[ALI_CLEAR];
                    // window.postMessage({//и запустим в контенте колбэк с этими данными
                    //   from: 'bg',
                    //   id: 'showRemodal',
                    //   currentPartner: partner,
                    //   timers: timers,
                    //   modalMarkers: modalMarkers,
                    //   modalShowed: modalShowed,
                    //   remodalShowed: remodalShowed
                    // }, '*');

                    //выводим модалку с реактивацией (ремодалка), showRemodal
                    //         var modalShowed = msg.modalShowed;
                    //         var remodalShowed = msg.remodalShowed;
                    //         currentUrl = document.location.href;//TODO нужно?

                    if (modalShowed) {//ремодалка выведется только, если предварительно всплывала модалка

                        //рендер компонентов ремодалки
                        var REANCHOR = document.createElement('div');
                        REANCHOR.id = 'remodalCL2017';
                        REANCHOR.classList.add('modalCL2017', 'modalCL2017_remodal');

                        modalHeader = document.createElement('div');
                        modalHeader.classList.add('modalCL2017__header');

                        clLogo = document.createElement('div');
                        clLogo.classList.add('cl-logo');

                        clLogoImg = document.createElement('img');
                        clLogoImg.classList.add('cl-logo__img');
                        clLogoImg.setAttribute('src', 'https://clcorp.ru/images/extenion/logo.png');

                        close = document.createElement('div');
                        close.classList.add('cl-close');


                        modalBody = document.createElement('div');
                        modalBody.classList.add('modalCL2017__body');

                        clPartner = document.createElement('div');
                        clPartner.classList.add('cl-partner');

                        clPartnerLogo = document.createElement('img');
                        clPartnerLogo.classList.add('cl-partner__logo');
                        clPartnerLogo.setAttribute('src', '');

                        clPartnerInfo = document.createElement('div');
                        clPartnerInfo.classList.add('cl-partner__info');

                        cashbackLabel = document.createElement('span');
                        cashbackLabel.classList.add('cashback-label');
                        cashbackLabel.innerText = 'Кэшбэк: ';

                        cashbackValue = document.createElement('span');
                        cashbackValue.classList.add('cashback-value');
                        cashbackValue.innerText = '';

                        modalFooter = document.createElement('div');
                        modalFooter.classList.add('modalCL2017__footer');


                        reactivation.classList.add('reactivation');
                        reactivation.innerText = 'Кэшбэк не активирован!';

                        clButtonWrap = document.createElement('div');
                        clButtonWrap.classList.add('button-cl__wrapper');

                        clButton = document.createElement('a');
                        clButton.innerHTML = '<span>Активировать повторно</span>';
                        clButton.classList.add('button-cl', 'button-cl_pink', 'cl-partner__link');
                        clButton.setAttribute('href', '');


                        clButtonWrap.appendChild(clButton);

                        modalFooter.appendChild(reactivation);
                        modalFooter.appendChild(clButtonWrap);


                        clPartnerInfo.appendChild(cashbackLabel);
                        clPartnerInfo.appendChild(cashbackValue);

                        clPartner.appendChild(clPartnerLogo);
                        clPartner.appendChild(clPartnerInfo);

                        modalBody.appendChild(clPartner);

                        clLogo.appendChild(clLogoImg);

                        modalHeader.appendChild(clLogo);
                        modalHeader.appendChild(close);

                        REANCHOR.appendChild(modalHeader);
                        REANCHOR.appendChild(modalBody);
                        REANCHOR.appendChild(modalFooter);


                        REANCHOR.style.display = 'flex';
                        REANCHOR.style.opacity = 1;

                        if (!remodalShowed) {//второе условие отображения ремодалки - она до этого не отображалась

                            // document.addEventListener('DOMContentLoaded', function () { //не для сафари
                            window.addEventListener('load', function () {//для сафари
                                if (document.querySelector('#modalCL2017')) {//на вский случай прячем основную модалку
                                    document.querySelector('#modalCL2017').style.display = 'none';
                                }
                                if (!document.querySelector('#remodalCL2017')) {
                                    document.body.appendChild(REANCHOR);
                                    // window.postMessage({//возвращаем в bg значение remodalShowed
                                    //     from: 'content',
                                    //     id: 'remodalShowed',
                                    //     url: currentUrl,
                                    //     remodalShowed: true
                                    // }, '*');
                                    remodalShowed = true;
                                }


                                close.addEventListener('click', function () {
                                    REANCHOR.style.display = 'none';
                                    // window.postMessage({
                                    //     from: 'content',
                                    //     id: 'remodalShowed',
                                    //     url: currentUrl,
                                    //     remodalShowed: true
                                    // }, '*');
                                    remodalShowed = true;
                                });
                            });
                        }

                        setTimeout(function () {//прячем ремодалку через HIDE_MODAL_TIME времени
                            REANCHOR.style.display = 'none';
                            // window.postMessage({
                            //     from: 'content',
                            //     id: 'remodalShowed',
                            //     url: currentUrl,
                            //     remodalShowed: true
                            // }, '*');
                            remodalShowed = true;
                        }, HIDE_MODAL_TIME);

                        //прописываемзначение кэшбэка и ставим иконку партнера
                        clPartnerLogo.setAttribute('src', partner.logo_url);
                        cashbackValue.innerText = partner.sale_text;
                        clButton.setAttribute('href', partner.href);

                        clButton.addEventListener('click', function () {//функция активации кэшбэка из модалки. После задействования в background передается об этом информация
                            // window.postMessage({
                            //     from: 'content',
                            //     id: 'setCashbackClick',
                            //     url: currentUrl,
                            //     timer: new Date().getTime(),
                            //     partnerId: partner.id,
                            //     remodalShowed: false
                            // }, '*');
                            //remodalShowed = false;//TODO нужно?
                            activateCashbackInModal();
                        });
                    } else {
                        return false;
                    }

                }
            } else {//если да
                // window.postMessage({//запустим колбэк для скрытия ремодалки
                //   from: 'bg',
                //   id: 'hideRemodal'
                // }, '*');

                //прнудительное скрытие ремодалки, hideRemodal
                if (document.querySelector('#remodalCL2017')) {
                    document.querySelector('#remodalCL2017').style.display = 'none';
                    document.querySelector('#remodalCL2017').style.opacity = 0;
                }
            }
        });
    }


}
renderModal();

function test(){
    var currentUrl='111';

    if(safari && safari.application){
        currentUrl = safari.application.activeBrowserWindow.activeTab.url;
        console.log('currentUrl ', currentUrl);
    } else {
        currentUrl = window.location.href;
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

// test();


// function tempGetData() {


partnersDataRequest(
    function (res) {
        arrayToObj(res, partnersDataAdmitad);
        partnersData = partnersDataAdmitad;
        console.log('partnersData 1', partnersData);
    },
    function () {
        console.info('Партнеры не загружены');
    }
);
// }

// tempGetData();
console.log('partnersData 2', partnersData);
// });

