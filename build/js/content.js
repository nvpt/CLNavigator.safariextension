
var SHOW_MODAL_TIME = 500; 
var HIDE_MODAL_TIME = 20000; 
var HIDE_CASHBACK_TIME = 15000; 

if(window === window.top) {


    if((window.location.href).indexOf('cl.world') !== -1){
        var cookiesMain = document.cookie.split(';');
        function sendCookies(data) {
            safari.self.tab.dispatchMessage("send-cookies", data);
        }
        sendCookies(cookiesMain);
    }

    if((window.location.href).indexOf(ALI_CLEAR) !== -1){
        var cookiesMain = document.cookie.split(';');
        function sendCookies(data) {
            safari.self.tab.dispatchMessage("ali-cookies", data);
        }
        sendCookies(cookiesMain);
    }

    safari.self.tab.dispatchMessage("content", {
        id: 'startConnect',
        url: window.location.href
    });


    safari.self.addEventListener("message", function (data) {

        var messageName = data.name;
        var msg = data.message;

        var partnerData = msg.currentPartner;
        var timers = msg.timers;
        var modalMarkers = msg.modalMarkers;

        var currentUrl = document.location.href;

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
        var clButtonInner = document.createElement('span');
        var reactivation = document.createElement('div');

        if (messageName === 'bg') {

            if (msg.id === 'showModal') {

                ANCHOR.id = 'modalCL2017';
                ANCHOR.classList.add('modalCL2017');

                modalHeader.classList.add('modalCL2017__header');

                clLogo.classList.add('cl-logo');

                clLogoImg.classList.add('cl-logo__img');
                clLogoImg.setAttribute('src', safari.extension.baseURI + 'img/logo.png');

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


                clButton.classList.add('button-cl', 'button-cl_pink', 'cl-partner__link', 'button-cl_glass');
                clButton.setAttribute('href', '');

                clButtonInner.innerText = 'Активировать';
                clButton.appendChild(clButtonInner);

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

                for (var i = 0; i < modalMarkers.length; i++) {

                    if (modalMarkers[i] === partnerData.id) {
                        ANCHOR.style.opacity = 0;
                        ANCHOR.style.display = 'none';
                        return;
                    }
                }

                ANCHOR.style.display = 'flex';
                ANCHOR.style.opacity = 1;

                if ((!document.querySelector("#modalCL2017")) &&
                    ((window.location.href).indexOf(getClearUrl(partnerData.site_url)))!== -1 ){
                    setTimeout(function () {
                        document.body.appendChild(ANCHOR);
                    }, SHOW_MODAL_TIME);

                    close.addEventListener('click', function () {
                        ANCHOR.style.display = 'none';

                        safari.self.tab.dispatchMessage("content", {
                            from: 'content',
                            id: 'modalMarkerAdded',
                            url: currentUrl
                        })
                    });
                }

                if (document.querySelector("#remodalCL2017")) {
                    document.querySelector("#remodalCL2017").style.display = 'none';
                }


                setTimeout(function () {
                    ANCHOR.style.display = 'none';

                    safari.self.tab.dispatchMessage("content", {
                        from: 'content',
                        id: 'modalMarkerAdded',
                        url: currentUrl
                    })
                }, HIDE_MODAL_TIME);

                if ((timers) && (timers.hasOwnProperty(getClearUrl(currentUrl)))) {

                    safari.self.tab.dispatchMessage("content", {
                        from: 'content',
                        id: 'modalMarkerAdded',
                        url: currentUrl
                    });

                    cashbackActive.style.display = 'flex';

                    setTimeout(function () {
                        ANCHOR.style.display = 'none';
                    }, HIDE_CASHBACK_TIME);

                } else {
                    cashbackActive.style.display = 'none';
                }

                clPartnerLogo.setAttribute('src', partnerData.logo_url);
                cashbackValue.innerText = partnerData.sale_text;

                clButton.setAttribute('href', partnerData.href);

                clButton.addEventListener('click', function () {

                    safari.self.tab.dispatchMessage("content", {
                        from: 'content',
                        id: 'setCashbackClick',
                        url: currentUrl,
                        timer: new Date().getTime(),
                        partnerId: partnerData.id
                    });
                });
            }

            else if (msg.id === 'showRemodal') {
                partnerData = msg.currentPartner;
                var modalShowed = msg.modalShowed;
                var remodalShowed = msg.remodalShowed;
                currentUrl = window.location.href;

                if (modalShowed) {

                    var REANCHOR = document.createElement('div');
                    REANCHOR.id = 'remodalCL2017';
                    REANCHOR.classList.add('modalCL2017', 'modalCL2017_remodal');

                    modalHeader = document.createElement('div');
                    modalHeader.classList.add('modalCL2017__header');

                    clLogo = document.createElement('div');
                    clLogo.classList.add('cl-logo');

                    clLogoImg = document.createElement('img');
                    clLogoImg.classList.add('cl-logo__img');
                    clLogoImg.setAttribute('src', safari.extension.baseURI + 'img/logo.png');

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

                    clButton.classList.add('button-cl', 'button-cl_pink', 'cl-partner__link');
                    clButton.setAttribute('href', '');

                    clButtonInner = document.createElement('span');
                    clButtonInner.innerText = 'Активировать повторно';

                    clButton.appendChild(clButtonInner);
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

                    if (!remodalShowed) {

                        window.addEventListener('load', function () {

                            if (document.querySelector('#modalCL2017')) {
                                document.querySelector('#modalCL2017').style.display = 'none';
                            }
                            if ((!document.querySelector('#remodalCL2017')) &&
                                ((window.location.href).indexOf(getClearUrl(partnerData.site_url)))!== -1 ){

                                document.body.appendChild(REANCHOR);

                                safari.self.tab.dispatchMessage("content", {
                                    from: 'content',
                                    id: 'remodalShowed',
                                    url: currentUrl,
                                    remodalShowed: true
                                });
                            }


                            close.addEventListener('click', function () {
                                REANCHOR.style.display = 'none';

                                safari.self.tab.dispatchMessage("content", {
                                    from: 'content',
                                    id: 'remodalShowed',
                                    url: currentUrl,
                                    remodalShowed: true
                                });
                            });
                        });
                    }

                    setTimeout(function () {
                        REANCHOR.style.display = 'none';

                        safari.self.tab.dispatchMessage("content", {
                            from: 'content',
                            id: 'remodalShowed',
                            url: currentUrl,
                            remodalShowed: true
                        });

                    }, HIDE_MODAL_TIME);

                    clPartnerLogo.setAttribute('src', partnerData.logo_url);
                    cashbackValue.innerText = partnerData.sale_text;
                    clButton.setAttribute('href', partnerData.href);

                    clButton.addEventListener('click', function () {

                        safari.self.tab.dispatchMessage("content", {
                            ffrom: 'content',
                            id: 'setCashbackClick',
                            url: currentUrl,
                            timer: new Date().getTime(),
                            partnerId: partnerData.id,
                            remodalShowed: false
                        });
                    });
                }
                else {
                    return false;
                }
            }

            else if (msg.id === 'hideRemodal') {
                if (document.querySelector('#remodalCL2017')) {
                    document.querySelector('#remodalCL2017').style.display = 'none';
                    document.querySelector('#remodalCL2017').style.opacity = 0;
                }
            }
        }

    });
}
