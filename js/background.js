console.log('--bg--');

/* Обработчики иконок */

/**
 * Иконка не партнера. дефолтная
 */
function markNotPartner() {
    var iconUri = safari.extension.baseURI + 'img/icon/Icon-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


/**
 * Иконка на партнере
 */
function markPartner() {
    var iconUri = safari.extension.baseURI + 'img/icon/partner-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}

/**
 * Анимация вращения иконки при активации
 */
//TODO описать вращения иконки
function markCheckPartner() {
    var iconUri = safari.extension.baseURI + 'img/icon/wait-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '...';
}

/**
 * Иконка кэшбэка
 */
function markCashbackActive() {
    var iconUri = safari.extension.baseURI + 'img/icon/done-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


/**
 * Изменение индикации иконки расширения
 * @param url
 */
function changeIcon(url) {
    var clearUrl = getClearUrl(url);
    if ((url !== undefined) && (partnersData[clearUrl])) {
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


/**
 * Куки
 */
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

function getCookiesAuth(msg) {

    if (msg.name === "send-cookies") {
        var cookiesValue = msg.message;
        var cookiesUrl = msg.target['url'];

        if (cookiesUrl !== undefined && (cookiesUrl.indexOf('cl.world') !== -1) && (cookiesValue !== "")) {//TODO добавить урл профиля. Проверить куку там
            authCookie = parseInt(cookiesToObj(cookiesValue)['auth']);
        }
    }
}

safari.application.addEventListener("message", getCookiesAuth, false);//проверяем куку авторизации; выполняется при каждом обновлении страницы

// function getCookiesAli(msg) {//TODO потом
//
//
//     if (msg.name === "send-cookies") {
//         var cookiesValue = msg.message;
//         var cookiesUrl = msg.target['url'];
//         var cookiesObj = cookiesToObj(cookiesValue);
//         console.log('cookiesToObj!!! ', cookiesToObj(cookiesValue));
//
//         if (cookiesUrl !== undefined && (cookiesUrl.indexOf('cl.world') !== -1) && (cookiesValue !== "")) {
//             authIdentifier = parseInt(cookiesToObj(cookiesValue)['auth']);
//         }
//     }
// }

// safari.application.addEventListener("message", getCookiesAli, false);



/* Запросы */

/**
 * Перезаписываем массив объектов партнеров в объект объектов
 * @param arr
 * @param obj
 */
function arrayToObj(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        var partner = arr[i];
        /* проверка на корректность указанного урла */
        // if(!partner.site_url){
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
    console.log('ЗАПРОС АВТОРИЗАЦИИ!!!');
    var url = 'https://cl.world/api/v2/profile/menu';
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.addEventListener('load', function () {
        if (req.status === 200) {
            var response = JSON.parse(req.responseText.replace(/<[^>]*>?/g, ''));
            console.log('response ', response);
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
    console.log('ЗАПРОС ДАННЫХ ПАРТНЕРОВ!!!');
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
 * Сброс авторизации и маркеров посещений
 */
function resetAuthorisation() {
    loginData = {};
    authIdentifier = 0;
    authCookie = 0;
    timers = {};
    modalMarkers=[0];
}


/**
 * Проверка ссылок партнеров
 */
function checkPartnersLink() {

    if (parseInt(authIdentifier) === 0) {

        if (Object.keys(partnersDataCustom).length === 0) {

            partnersDataRequest(
                function (res) {
                    arrayToObj(res, partnersDataCustom);
                    partnersData = partnersDataCustom;
                },
                function () {
                    // console.info('Партнеры не загружены');
                }
            );
        }
        partnersData = partnersDataCustom;

    } else {

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
    }
}

/**
 * Проверка авторизации
 */
function checkAuthorisation(){
    if (parseInt(authIdentifier) === 0) {
        resetAuthorisation();
    }
}

/**
 * Загрузка данных партнеров
 */

function uploadServerData(url) { /* TODO проверить что быстрее орабатывает, проверка куки или эта функция, т.к. сравниваем с authCookie */
    console.log('url ', url);
    console.log(1);
    /* сравнение идентификатора авторизации (authIdentifier) c кукой авторизации
     актуально только при открытой вкладке с нашего сайта,
      т.к. доступа к глобальному хранилищу кук в сафари нет */
    if (url.indexOf('cl.world') !== -1) {//TODO возможно добавить урл кабинета
        console.log(2);
        /* если не авторизованы, или id авторизации не совпадает с id в текущих куках, то отправляем запрос */
        if (parseInt(authIdentifier) !== parseInt(authCookie)) {

            console.log(3);

            reqProfile(
                function (resp) {
                    loginData = resp;
                    authIdentifier = parseInt(loginData.profile.id);//перезаписываем идентификатор
                    authCookie = parseInt(loginData.profile.id);//вместе с кукой

                    /* так как идет переавторизация, то в любом слючае сбрасываем маркеры посещений */
                    modalMarkers = [0];
                    timers = {};
                    console.log(4);
                    checkPartnersLink();
                },
                function () {
                    console.log(5);
                    resetAuthorisation();
                    checkPartnersLink();
                }
            );
        }

    } else {
        checkAuthorisation();
        checkPartnersLink();
        console.log(6);
    }
}

/* актуализируем данные сразу при запуске расширения */

(function(){
var currentUrl = safari.application.activeBrowserWindow.activeTab.url;
uploadServerData(currentUrl);
})();

/**
 * Обновление данных партнеров. Для периодической загрузки данных раз в 22 - 24 часа
 */
function updateServerData() {
    
    partnersDataRequest(//запрос в любом случае, поэтому условия внутри
        function (res) {
            if (parseInt(authIdentifier) !== 0) {
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

setInterval(updateServerData, PARTNERS_UPDATE_TIME);


/**
 * Проверка авторизации
 */
function updateAuthorization() {
    reqProfile(function (resp) {
        loginData = resp;
        authIdentifier =  parseInt(loginData.profile.id);
        authCookie =  parseInt(loginData.profile.id);
    }, function () {
        resetAuthorisation();
    });
}

/* проверяем сразу при запуске расширения */
updateAuthorization();

/* и затем каждые AUTHORISTION_UPDATE_TIME */
setInterval(updateAuthorization, AUTHORISATION_UPDATE_TIME);



/* Проверяем наличие данных партнера в массиве. Если нет, то запрашиваем */
function addPartnerToVisited(url) {
    var clearUrl = getClearUrl(url);
    if (clearUrl && (url !== undefined) && (!partnersVisited[clearUrl]) && (partnersData[clearUrl])) {
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

    changeIcon(currentUrl);//при клике сверяем актуальность иконки
    addPartnerToVisited(currentUrl);
    uploadServerData(currentUrl);
    // console.log('***************clickTab', currentUrl);
    console.log('authCookie ', authCookie);
    console.log('authIdentifier ', authIdentifier);
}


function reloadTab() {

    var currentUrl = safari.application.activeBrowserWindow.activeTab.url;//урл текущей вкладки

    changeIcon(currentUrl);
    uploadServerData(currentUrl);
    addPartnerToVisited(currentUrl);

    // console.log('**************RELOADTAB', currentUrl);
    console.log('loginData ', loginData);
    console.log('authCookie ', authCookie);
    console.log('authIdentifier ', authIdentifier);
}


/* Обработчики действи с табами */
safari.application.activeBrowserWindow.addEventListener("activate", clickTab, true);//клик по табу
safari.application.activeBrowserWindow.addEventListener("navigate", reloadTab, true);//обновление



/* Мост между content и background *///TODO Разместить инлайном в глобале.
safari.application.addEventListener("message", function (data) {

        var messageName = data.name;
        var msg = data.message;

        //порядок запросов не менять (?)
        // console.log('МОСТ');

        //<<прием
        if (messageName === 'content') {
            var contentUrl = msg.url;
            var clearUrl = getClearUrl(contentUrl);

            //<<прием
            if (msg.id === 'modalMarkerAdded') {
                if (partnersData[clearUrl]) {
                    var partner = partnersData[clearUrl];
                    checkModalMarkerAdded(partner);
                }
            }

            //<<прием
            if (msg.id === 'setCashbackClick') {
                modalShowed = true;
                remodalShowed = false;

                /* если юзер залогинен, активируем кэшбэк по клику */
                if (Object.keys(loginData).length > 0) {
                    _addToTimers(clearUrl, msg.timer);
                    for (var i = 0; i < modalMarkers.length; i++) {
                        if (modalMarkers[i] === msg.partnerId) {
                            /* удаляем маркер отображени модалки,
                            чтобы после активации кэшбэка модалка отобразилась заново еще раз,
                             уже с уведомлением, что кэшбэк активирован */
                            modalMarkers.splice(i, 1);
                        }
                    }
                }
            }

            //<<прием
            if (msg.id === 'remodalShowed') {//активация маркера remodalShowed
                remodalShowed = msg.remodalShowed;
            }

            //<<прием
            if (msg.id === 'startConnect') {//начальная связь от content.js

                if (partnersData[clearUrl]) {
                    partner = partnersData[clearUrl];

                    //>>отправка
                    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("bg",
                        {
                            from: 'bg',
                            id: 'showModal',
                            currentPartner: partner,
                            timers: timers,
                            modalMarkers: modalMarkers,
                            loginData: _getLoginData()
                        });
                }
                //<<прием
                //TODO переписать
                if (clearUrl === ALI_CLEAR) {//если сайт - Aliexpress

                    safari.application.addEventListener("message", function(data){
                        var cookiesValue = data.message;
                        var cookiesUrl = data.target['url'];
                        var cookiesObj = cookiesToObj(cookiesValue);

                        if ((cookiesObj.aeu_cid) && (cookiesObj.aeu_cid.indexOf(CL_ALI_UID) === -1)) {//если кука aeu_cid не содежит наш идентификатор "yVF2rZRRj", то отправляем в контент данные алиэкспресс из массива partnersData, чтобы отобразить ремодалку
                            if (partnersData[clearUrl]) {
                                delete timers[ALI_CLEAR];

                                //>>отправка
                                safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("bg",
                                    {
                                        from: 'bg',
                                        id: 'showRemodal',
                                        currentPartner: partner,
                                        timers: timers,
                                        modalMarkers: modalMarkers,
                                        modalShowed: modalShowed,
                                        remodalShowed: remodalShowed
                                    });
                            }
                        } else {//если да

                            //>>отправка
                            //TODO в сафари срабатывает сразу. и закрывает окно
                            // safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("bg",
                            //     {
                            //         from: 'bg',
                            //         id: 'hideRemodal'
                            //     });
                        }
                    }, false);
                }
            }
        }
    }
);

