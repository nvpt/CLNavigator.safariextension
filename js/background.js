console.log('--bg--');

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

function getCookiesAuth(incMsg) {//TODO настроить проверку р-куки
    var cookies = incMsg;

    var cookiesValue = incMsg.message;
    var cookiesUrl = incMsg.target['url'];

    if (incMsg.name === "send-cookies") {
        console.log('cookies!!! ', cookies);
        if (cookiesUrl !== undefined && (cookiesUrl.indexOf('cl.world') !== -1) && (cookiesValue !== "")) {
            currentCookie = parseInt(cookiesToObj(cookiesValue)['auth']);
            // console.log('cookie_auth common ', currentCookie);
            // console.log('cookies common ', cookies);
        }
    }
}

safari.application.addEventListener("message", getCookiesAuth, false);//проверяем куку авторизации; выполняется при каждом обновлении страницы


function _getCookies(url, name, cb) {//for aliexpress//TODO проверить корректность работы
    safari.cookies.get({
        url: url,
        name: name
    }, cb);
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
    // if(safari && safari.application) {
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
    // }
}


/**
 * Запрос данных партнеров
 * @param resolve
 * @param reject
 */
function partnersDataRequest(resolve, reject) {
    if(safari && safari.application) {
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
}


/**
 * Сброс авторизации
 */
function resetAuthorisation() {
    loginData = {};
    timers = {};
    authIdentifier = parseInt(-1);
    currentCookie = 0;
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


        // console.log('*1');

        if (parseInt(currentCookie) !== 0 && parseInt(authIdentifier) !== parseInt(currentCookie)) {
            // console.log('*2');
            reqProfile(
                function (resp) {
                    loginData = resp;
                    authIdentifier = parseInt(currentCookie);
                    // console.log('*3');

                    //сюда
                },
                function () {
                    resetAuthorisation();
                    // console.log('*4');
                }
            );
            timers = {};//сбрасываем время посещения парттнеров для нового пользователя
        }

    if (parseInt(currentCookie) !== 0) {

        if (Object.keys(partnersDataAdmitad).length === 0) {
            // console.log('*5');
            partnersDataRequest(
                function (res) {
                    arrayToObj(res, partnersDataAdmitad);
                    partnersData = partnersDataAdmitad;
                    // console.log('*6');
                },
                function () {
                    // console.info('Партнеры не загружены');
                    // console.log('*7');
                }
            );
        }
        partnersData = partnersDataAdmitad;

    } else {
        resetAuthorisation();
        // console.log('*8');
        if (Object.keys(partnersDataCustom).length === 0) {

            partnersDataRequest(
                function (res) {
                    arrayToObj(res, partnersDataCustom);
                    partnersData = partnersDataCustom;
                    // console.log('*9');
                },
                function () {
                    // console.log('*10');
                }
            );
        }
        partnersData = partnersDataCustom;
    }


    // console.log('currentCookie bg ', currentCookie);
    // console.log('authIdentifier bg ', authIdentifier);
    // console.log('loginData1 bg ', loginData);
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
            if (parseInt(currentCookie) !== 0) {
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
    // console.log('***************clickTab', currentUrl);
    changeIcon(currentUrl);//при клике сверяем актуальность иконки
    addPartnerToVisited(currentUrl);

}


function reloadTab() {

    var currentUrl = safari.application.activeBrowserWindow.activeTab.url;//урл текущей вкладки
    // console.log('**************RELOADTAB', currentUrl);
    changeIcon(currentUrl);
    uploadServerData();
    addPartnerToVisited(currentUrl);
    // test();
}


/* Обработчики действи с табами */

    safari.application.activeBrowserWindow.addEventListener("activate", clickTab, true);//клик по табу
    safari.application.activeBrowserWindow.addEventListener("navigate", reloadTab, true);//обновление






/* Мост между content и background *///TODO переписать под апи сафари. Разместитьинлайном в глобале. Ответ будет в тест-контенте


// safari.application.addEventListener("message", function (port) {//использовать
window.addEventListener("message", function (port) {
        // var msg = port.data;
        var msg = port.message;
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



/*
* Мост связи с веб
* */
function globalBridge(message) {
    var messageName = message.name;
    var messageData = message.message;

    //прием

    if (messageName === "send-url") {
        // console.log('message bg ', message);
        // console.log('send-url bg ', message);
        receiveWebUrl(message);//тестовое


            console.log('web-url bg ', message.message);

        var contentUrl = message.message;
        var clearUrl = getClearUrl(contentUrl);
        console.log('partnersData ', partnersData);
        console.log('clearUrl ', clearUrl);
        console.log('partnersData[clearUrl]', partnersData[clearUrl]);

        if (partnersData[clearUrl]) {
            var partner = partnersData[clearUrl];
            console.log(partner);
            sendPartnerDataForModal(partner);
        }

    }

    // if (messageName === "send-cookies") {
    //     return function(message){
    //         console.log('setCookies bg ', message);
    //     }
    // }

    //отправка
    sendLoginData(_getLoginData());

}
safari.application.addEventListener("message", globalBridge, false);


/*
* Методы обработки принимаемых данных из веба
* */
function receiveWebUrl(val) {
    var name = val.name;
    var data = val.message;

    console.log('web-url bg ', data);
}


/**
 * Методы отправки данных в веб
 */
function sendLoginData(data){
    // console.log('sendLoginData bg ', data);
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("login-data-send", data);
}

function sendPartnerDataForModal(data){
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("partner-data-send", data);
}



