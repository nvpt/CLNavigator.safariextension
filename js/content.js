/**
 * Created by CityLife on 29.12.16.
 */
console.log('--content--');

var SHOW_MODAL_TIME = 50;//5000
var HIDE_MODAL_TIME = 5000;//15000//15000 = 20сек. Время скрытия модалки после отображения. Поставить секунд 15-20
var HIDE_CASHBACK_TIME = 12000;//7000 = 7сек. Время скрытия модалки после демонстрации, что кэшбэк активен


// if(currentUrl.indexOf('cl.world') !== -1){
//     console.log('!!!checkAuthCookie(currentUrl) ', checkAuthCookie(currentUrl));
//     console.log('authorizationStatus content 1', authorizationStatus);
//    var authStatusContent = checkAuthCookie(currentUrl);
//     console.log('authorizationStatus content 2', authorizationStatus);
// }

window.postMessage({
    from: 'content',
    id: 'startConnect',
    url: document.location.href
}, '*');




// port.onMessage.addListener(function (msg) {
window.addEventListener("message", function (port) {
    var msg = port.data;
    var partnerData = msg.currentPartner;
    var timers = msg.timers;
    var modalMarkers = msg.modalMarkers;
    var currentUrl = document.location.href;//will work in ff?

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


    if (msg.from === 'bg') {//ответы из bg

        if (msg.id === 'showModal') {//отображение модалки

            //рендер компонентнов модалки
            ANCHOR.id = 'modalCL2017';
            ANCHOR.classList.add('modalCL2017');

            modalHeader.classList.add('modalCL2017__header');

            clLogo.classList.add('cl-logo');

            clLogoImg.classList.add('cl-logo__img');
            clLogoImg.setAttribute('src', 'https://cl.world/images/extenion/logo.png');

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

                if (modalMarkers[i] === partnerData.id) {
                    ANCHOR.style.opacity = 0;
                    ANCHOR.style.display = 'none';
                    return;
                }
            }

            ANCHOR.style.display = 'flex';
            ANCHOR.style.opacity = 1;


            if (!document.querySelector("#modalCL2017")) {//пресекаем дублирование добавления модалки

              setTimeout(function(){
                document.body.appendChild(ANCHOR);
              }, SHOW_MODAL_TIME);

                close.addEventListener('click', function () {
                    ANCHOR.style.display = 'none';
                    window.postMessage({
                        from: 'content',
                        id: 'modalMarkerAdded',
                        url: currentUrl
                    }, '*');
                });
            }

            if (document.querySelector("#remodalCL2017")) {//на всякий случай прячем ремодалку
                document.querySelector("#remodalCL2017").style.display = 'none';
            }


            setTimeout(function () {
                ANCHOR.style.display = 'none';
                window.postMessage({
                    from: 'content',
                    id: 'modalMarkerAdded',
                    url: currentUrl
                }, '*');
            }, HIDE_MODAL_TIME);

            //отображение информации об активном кэшбэке зависит от данных в timers
            if ((timers) && (timers.hasOwnProperty(getClearUrl(currentUrl)))) {
                window.postMessage({
                    from: 'content',
                    id: 'modalMarkerAdded',
                    url: currentUrl
                }, '*');
                cashbackActive.style.display = 'flex';
                setTimeout(function () {//после уведомления модалкой об активации кэшбэка, автоматически прячем ее через HIDE_CASHBACK_TIME
                    ANCHOR.style.display = 'none';
                }, HIDE_CASHBACK_TIME);

            } else {
                cashbackActive.style.display = 'none';
            }

            clPartnerLogo.setAttribute('src', partnerData.logo_url);
            cashbackValue.innerText = partnerData.sale_text;

            clButton.setAttribute('href', partnerData.href);

            clButton.addEventListener('click', function () {//функция активации кэшбэка из модалки. После задействования в background передается об этом информация

                window.postMessage({
                    from: 'content',
                    id: 'setCashbackClick',
                    url: currentUrl,
                    timer: new Date().getTime(),
                    partnerId: partnerData.id
                }, '*');
            });

        }

        else if (msg.id === 'showRemodal') {//выводим модалку с реактивацией (ремодалка)
            partnerData = msg.currentPartner;
            var modalShowed = msg.modalShowed;
            var remodalShowed = msg.remodalShowed;
            currentUrl = document.location.href;

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
                clLogoImg.setAttribute('src', 'https://cl.world/images/extenion/logo.png');

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
                            window.postMessage({//возвращаем в bg значение remodalShowed
                                from: 'content',
                                id: 'remodalShowed',
                                url: currentUrl,
                                remodalShowed: true
                            }, '*');
                        }


                        close.addEventListener('click', function () {
                            REANCHOR.style.display = 'none';
                            window.postMessage({
                                from: 'content',
                                id: 'remodalShowed',
                                url: currentUrl,
                                remodalShowed: true
                            }, '*');
                        });
                    });
                }

                setTimeout(function () {//прячем ремодалку через HIDE_MODAL_TIME времени
                    REANCHOR.style.display = 'none';
                    window.postMessage({
                        from: 'content',
                        id: 'remodalShowed',
                        url: currentUrl,
                        remodalShowed: true
                    }, '*');
                }, HIDE_MODAL_TIME);

                //прописываемзначение кэшбэка и ставим иконку партнера
                clPartnerLogo.setAttribute('src', msg.currentPartner.logo_url);
                cashbackValue.innerText = msg.currentPartner.sale_text;
                clButton.setAttribute('href', msg.currentPartner.href);

                clButton.addEventListener('click', function () {//функция активации кэшбэка из модалки. После задействования в background передается об этом информация
                    window.postMessage({
                        from: 'content',
                        id: 'setCashbackClick',
                        url: currentUrl,
                        timer: new Date().getTime(),
                        partnerId: partnerData.id,
                        remodalShowed: false
                    }, '*');
                });
            } else {
                return false;
            }
        }

        else if (msg.id === 'hideRemodal') {//прнудительное скрытие ремодалки
            if (document.querySelector('#remodalCL2017')) {
                document.querySelector('#remodalCL2017').style.display = 'none';
                document.querySelector('#remodalCL2017').style.opacity = 0;
            }
        }
    }

});

