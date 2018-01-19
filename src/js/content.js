/**
 * Created by CityLife on 29.12.16.
 */
// console.log('--content--');

let SHOW_MODAL_TIME = 2500; //3000 = 2,5 сек. Задержка перед открытием окна
let HIDE_MODAL_TIME = 180000; //180000 = 3 мин. Время скрытия модалки после отображения. Поставить секунд 15-20
let HIDE_CASHBACK_TIME = 30000; //30000 = 30 сек. Время скрытия модалки после демонстрации, что кэшбэк активен

if(window === window.top) {

    /*
    *Отправка куки
    * */

    /* куки отслеживания авторизации */
    function sendCookies(name, data) {
        safari.self.tab.dispatchMessage(name, data);
    }

    if((window.location.href).indexOf('cl.world') !== -1){
        let cookiesMain = document.cookie.split(';');
        sendCookies("send-cookies", cookiesMain);
    }

    /* временное решение для переопределения */
    if((window.location.href).indexOf(ALI_CLEAR) !== -1){
        let cookiesAli = document.cookie.split(';');
        sendCookies("ali-cookies",cookiesAli);
    }

    //>>отправка
    /* Старт связки */
    safari.self.tab.dispatchMessage("content", {
        id: 'startConnect',
        url: window.location.href
    });


    safari.self.addEventListener("message", function (data) {

        let messageName = data.name;
        let msg = data.message;

        let partnerData = msg.currentPartner;
        let timers = msg.timers;
        let modalMarkers = msg.modalMarkers;

        let currentUrl = document.location.href;

        let ANCHOR = document.createElement('div');
        let modalHeader = document.createElement('div');

        let clLogo = document.createElement('div');
        let clLogoImg = document.createElement('img');
        let close = document.createElement('div');
        let modalBody = document.createElement('div');
        let clPartner = document.createElement('div');
        let clPartnerLogo = document.createElement('img');
        let clPartnerInfo = document.createElement('div');
        let cashbackLabel = document.createElement('span');
        let cashbackValue = document.createElement('span');
        let modalFooter = document.createElement('div');
        let cashbackActive = document.createElement('div');
        let clButtonWrap = document.createElement('div');
        let clButton = document.createElement('a');
        let clButtonInner = document.createElement('span');
        let reactivation = document.createElement('div');

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
                for (let i = 0; i < modalMarkers.length; i++) {

                    if (modalMarkers[i] === partnerData.id) {
                        ANCHOR.style.opacity = 0;
                        ANCHOR.style.display = 'none';
                        return;
                    }
                }

                ANCHOR.style.display = 'flex';
                ANCHOR.style.opacity = 1;

                /* пресекаем дублирование добавления модалки */
                /* вторым условием избегаем при первичном запуске
                 отображения всех модалок в текущем окне*/
                if ((!document.querySelector("#modalCL2017")) &&
                    ((window.location.href).indexOf(getClearUrl(partnerData.site_url)))!== -1 ){
                    setTimeout(function () {
                        document.body.appendChild(ANCHOR);
                    }, SHOW_MODAL_TIME);

                    close.addEventListener('click', function () {
                        ANCHOR.style.display = 'none';

                        //>>отправка
                        safari.self.tab.dispatchMessage("content", {
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
                        id: 'modalMarkerAdded',
                        url: currentUrl
                    })
                }, HIDE_MODAL_TIME);

                /* отображение информации об активном кэшбэке зависит от данных в timers */
                if ((timers) && (timers.hasOwnProperty(getClearUrl(currentUrl)))) {

                    //>>отправка
                    safari.self.tab.dispatchMessage("content", {
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
                let modalShowed = msg.modalShowed;
                let remodalShowed = msg.remodalShowed;
                currentUrl = window.location.href;

                /* ремодалка выведется только, если предварительно всплывала модалка */
                if (modalShowed) {

                    /* рендер компонентов ремодалки */
                    let REANCHOR = document.createElement('div');
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
                            /* вторым условием избегаем при первичном запуске
                            отображения всех модалок в текущем окне*/
                            if (document.querySelector('#modalCL2017')) {
                                document.querySelector('#modalCL2017').style.display = 'none';
                            }
                            if ((!document.querySelector('#remodalCL2017')) &&
                                ((window.location.href).indexOf(getClearUrl(partnerData.site_url)))!== -1 ){

                            // if (!document.querySelector('#remodalCL2017')){
                                document.body.appendChild(REANCHOR);

                                //>>отправка
                                safari.self.tab.dispatchMessage("content", {
                                    id: 'remodalShowed',
                                    url: currentUrl,
                                    remodalShowed: true
                                });
                            }


                            close.addEventListener('click', function () {
                                REANCHOR.style.display = 'none';

                                //>>отправка
                                safari.self.tab.dispatchMessage("content", {
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
