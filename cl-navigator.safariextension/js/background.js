

function markNotPartner() {
    var iconUri = safari.extension.baseURI + 'img/icon/Icon-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


function markPartner() {
    var iconUri = safari.extension.baseURI + 'img/icon/partner-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}

function markCheckPartner() {
    var iconUri = safari.extension.baseURI + 'img/icon/wait-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '...';
}

function markCashbackActive() {
    var iconUri = safari.extension.baseURI + 'img/icon/done-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


function changeIcon(url) {
    var clearUrl = getClearUrl(url);
    if ((url !== undefined) && (partnersData[clearUrl])) {
        checkTimers(clearUrl);
        if (timers[clearUrl]) {
            markCashbackActive();
        } else {
            markPartner();
        }
    } else {
        markNotPartner();
    }
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

function getCookiesAuth(msg) {

    if (msg.name === "send-cookies") {
        var cookiesValue = msg.message;
        var cookiesUrl = msg.target['url'];

        if (cookiesUrl !== undefined && (cookiesUrl.indexOf('cl.world') !== -1) && (cookiesValue !== "")) {
            authCookie = parseInt(cookiesToObj(cookiesValue)['auth']);
        }
    }
}
safari.application.addEventListener("message", getCookiesAuth, false);


function arrayToObj(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        var partner = arr[i];
        obj[getClearUrl(partner.site_url)] = partner;
    }
}


function reqProfile(resolve, reject) {
    console.log('ЗАПРОС АВТОРИЗАЦИИ!!!');
    var url = 'https://cl.world/api/v2/profile/menu';
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
    req.addEventListener('load', function () {
        if (req.status === 200) {
            var response = JSON.parse(req.responseText.replace(/<[^>]*>?/g, ''));
            resolve(response);
        } else {
            reject();
        }
    });
}


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


function resetAuthorisation() {
    loginData = {};
    authIdentifier = 0;
    authCookie = 0;
    timers = {};
    modalMarkers=[0];
}


function checkPartnersLink() {

    if (parseInt(authIdentifier) === 0) {

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

    } else {

        if (Object.keys(partnersDataAdmitad).length === 0) {
            partnersDataRequest(
                function (res) {
                    arrayToObj(res, partnersDataAdmitad);
                    partnersData = partnersDataAdmitad;
                },
                function () {
                }
            );
        }
        partnersData = partnersDataAdmitad;
    }
}

function checkAuthorisation(){
    if (parseInt(authIdentifier) === 0) {
        resetAuthorisation();
    }
}


function uploadServerData(url) {
    if (url && url.indexOf('cl.world') !== -1) {
        if (parseInt(authIdentifier) !== parseInt(authCookie)) {


            reqProfile(
                function (resp) {
                    loginData = resp;

                    authIdentifier = parseInt(loginData.profile.id);
                    authCookie = parseInt(loginData.profile.id);

                    modalMarkers = [0];
                    timers = {};
                    checkPartnersLink();
                },
                function () {
                    resetAuthorisation();
                    checkPartnersLink();
                }
            );
        }

    } else {
        checkAuthorisation();
        checkPartnersLink();
    }
}

(function(){
    var currentUrl = safari.application.activeBrowserWindow.activeTab.url;
    uploadServerData(currentUrl);
})();

function updateServerData() {
    partnersDataRequest(
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
        });
}

setInterval(updateServerData, PARTNERS_UPDATE_TIME);


function updateAuthorization() {
    reqProfile(function (resp) {
        loginData = resp;
        authIdentifier =  parseInt(loginData.profile.id);
        authCookie =  parseInt(loginData.profile.id);
    }, function () {
        resetAuthorisation();
    });
}

updateAuthorization();

setInterval(updateAuthorization, AUTHORISATION_UPDATE_TIME);



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


function clickTab(val) {
    var currentUrl = safari.application.activeBrowserWindow.activeTab.url;

    changeIcon(currentUrl);
    addPartnerToVisited(currentUrl);
    uploadServerData(currentUrl);

}


function reloadTab(val) {
    var currentUrl = safari.application.activeBrowserWindow.activeTab.url;

    if(val.target.url === currentUrl){

        changeIcon(currentUrl);

        uploadServerData(currentUrl);
        addPartnerToVisited(currentUrl);

    }

}


safari.application.activeBrowserWindow.addEventListener("activate", clickTab, true);
safari.application.activeBrowserWindow.addEventListener("navigate", reloadTab, true);



safari.application.addEventListener("message", function (data) {

        var messageName = data.name;
        var msg = data.message;


        if (messageName === 'content') {
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

                if (Object.keys(loginData).length > 0) {
                    _addToTimers(clearUrl, msg.timer);
                    for (var i = 0; i < modalMarkers.length; i++) {
                        if (modalMarkers[i] === msg.partnerId) {

                            modalMarkers.splice(i, 1);
                        }
                    }
                }
            }

            if (msg.id === 'remodalShowed') {
                remodalShowed = msg.remodalShowed;
            }

            if (msg.id === 'startConnect') {

                if (partnersData[clearUrl]) {
                    partner = partnersData[clearUrl];
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
                if ((clearUrl === ALI_CLEAR)) {
                    safari.application.addEventListener("message", function (data) {


                        if (data.name === 'ali-cookies') {
                            var cookiesName = data.name;
                            var cookiesValue = data.message;
                            var cookiesUrl = data.target['url'];
                            var cookiesObj = cookiesToObj(cookiesValue);

                        if ((cookiesObj.aeu_cid) && (cookiesObj.aeu_cid.indexOf(CL_ALI_UID) === -1)) {
                            if (partnersData[clearUrl]) {
                                delete timers[ALI_CLEAR];
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
                        }
                        }
                    }, false);
                }
            }
        }
    }
);

