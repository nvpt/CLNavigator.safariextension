/**
 * Created by CityLife on 29.12.16.
 */
console.log('--content--');

var SHOW_MODAL_TIME = 50; //TODO temp //5000
var HIDE_MODAL_TIME = 25000; //TODO temp //15000 = 20сек. Время скрытия модалки после отображения. Поставить секунд 15-20
var HIDE_CASHBACK_TIME = 22000; //7000 = 7сек. Время скрытия модалки после демонстрации, что кэшбэк активен

if(window === window.top) {

    /*
    *Отправка куки
    * */
    if((window.location.href).indexOf('cl.world') !== -1){ //TODO проверить корректность
        var cookiesMain = document.cookie.split(';');
        console.log('cookiesMain ', cookiesMain);
        function sendCookies(data) {
            safari.self.tab.dispatchMessage("send-cookies", data);
            // console.log('browser cookiesMain ', cookiesMain);
        }
        sendCookies(cookiesMain);
    }


    //>>отправка
    /* Старт связки */
    safari.self.tab.dispatchMessage("content", {
        // from: 'content',
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

        //<<прием
        /* ответы из bg */
        if (messageName === 'bg') {

            //<<прием
            /* отображение модалки */
            if (msg.id === 'showModal') {

                /* рендер компонентнов модалки */
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

                /* если маркер отображения есть то модалку прячем.
                Смотрим по маркеру из массива в common.js */
                for (var i = 0; i < modalMarkers.length; i++) {

                    if (modalMarkers[i] === partnerData.id) {
                        ANCHOR.style.opacity = 0;
                        ANCHOR.style.display = 'none';
                        return;
                    }
                }

                ANCHOR.style.display = 'flex';
                ANCHOR.style.opacity = 1;

                /* пресекаем дублирование добавления модалки */
                if (!document.querySelector("#modalCL2017")) {

                    setTimeout(function () {
                        document.body.appendChild(ANCHOR);
                    }, SHOW_MODAL_TIME);

                    close.addEventListener('click', function () {
                        ANCHOR.style.display = 'none';

                        //>>отправка
                        safari.self.tab.dispatchMessage("content", {
                            from: 'content',
                            id: 'modalMarkerAdded',
                            url: currentUrl
                        })
                    });
                }

                /* на всякий случай прячем ремодалку */
                if (document.querySelector("#remodalCL2017")) {
                    document.querySelector("#remodalCL2017").style.display = 'none';
                }


                setTimeout(function () {
                    ANCHOR.style.display = 'none';

                    //>>отправка
                    safari.self.tab.dispatchMessage("content", {
                        from: 'content',
                        id: 'modalMarkerAdded',
                        url: currentUrl
                    })
                }, HIDE_MODAL_TIME);

                /* отображение информации об активном кэшбэке зависит от данных в timers */
                if ((timers) && (timers.hasOwnProperty(getClearUrl(currentUrl)))) {

                    //>>отправка
                    safari.self.tab.dispatchMessage("content", {
                        from: 'content',
                        id: 'modalMarkerAdded',
                        url: currentUrl
                    });

                    cashbackActive.style.display = 'flex';

                    /* после уведомления модалкой об активации кэшбэка,
                    автоматически прячем ее через HIDE_CASHBACK_TIME */
                    setTimeout(function () {
                        ANCHOR.style.display = 'none';
                    }, HIDE_CASHBACK_TIME);

                } else {
                    cashbackActive.style.display = 'none';
                }

                clPartnerLogo.setAttribute('src', partnerData.logo_url);
                cashbackValue.innerText = partnerData.sale_text;

                clButton.setAttribute('href', partnerData.href);

                /* функция активации кэшбэка из модалки.
                После задействования в background передается об этом информация */
                clButton.addEventListener('click', function () {

                    //>>отправка
                    safari.self.tab.dispatchMessage("content", {
                        from: 'content',
                        id: 'setCashbackClick',
                        url: currentUrl,
                        timer: new Date().getTime(),
                        partnerId: partnerData.id
                    });
                });
            }

            //<<прием
            /* выводим модалку с реактивацией (ремодалка).
            если наш кэшбэк переопределили */
            else if (msg.id === 'showRemodal') {
                partnerData = msg.currentPartner;
                var modalShowed = msg.modalShowed;
                var remodalShowed = msg.remodalShowed;
                currentUrl = window.location.href;

                /* ремодалка выведется только, если предварительно всплывала модалка */
                if (modalShowed) {

                    /* рендер компонентов ремодалки */
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

                    /* второе условие отображения ремодалки - если она до этого не отображалась */
                    if (!remodalShowed) {

                        window.addEventListener('load', function () {
                            /* прячем основную модалку */
                            if (document.querySelector('#modalCL2017')) {
                                document.querySelector('#modalCL2017').style.display = 'none';
                            }
                            if (!document.querySelector('#remodalCL2017')) {
                                document.body.appendChild(REANCHOR);

                                //>>отправка
                                safari.self.tab.dispatchMessage("content", {
                                    from: 'content',
                                    id: 'remodalShowed',
                                    url: currentUrl,
                                    remodalShowed: true
                                });
                            }


                            close.addEventListener('click', function () {
                                REANCHOR.style.display = 'none';

                                //>>отправка
                                safari.self.tab.dispatchMessage("content", {
                                    from: 'content',
                                    id: 'remodalShowed',
                                    url: currentUrl,
                                    remodalShowed: true
                                });
                            });
                        });
                    }

                    /* прячем ремодалку через HIDE_MODAL_TIME времени */
                    setTimeout(function () {
                        REANCHOR.style.display = 'none';

                        //>>отправка
                        safari.self.tab.dispatchMessage("content", {
                            from: 'content',
                            id: 'remodalShowed',
                            url: currentUrl,
                            remodalShowed: true
                        });

                    }, HIDE_MODAL_TIME);

                    /* прописываем значение кэшбэка и ставим иконку партнера */
                    clPartnerLogo.setAttribute('src', partnerData.logo_url);
                    cashbackValue.innerText = partnerData.sale_text;
                    clButton.setAttribute('href', partnerData.href);

                    /* функция активации кэшбэка из модалки.
                    После задействования в background передается об этом информация */
                    clButton.addEventListener('click', function () {

                        //>>отрпавка
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
                else {//TODO нужно?
                    return false;
                }
            }

            //<<прием
            /* принудительное скрытие ремодалки */
            else if (msg.id === 'hideRemodal') {
                if (document.querySelector('#remodalCL2017')) {
                    document.querySelector('#remodalCL2017').style.display = 'none';
                    document.querySelector('#remodalCL2017').style.opacity = 0;
                }
            }
        }

    });
}
