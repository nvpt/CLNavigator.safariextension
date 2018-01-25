/**
 * Created by CityLife on 29.12.16.
 */
// console.log('--content--');

let SHOW_MODAL_DELAY = 2500; //3000 = 2,5 сек. Задержка перед открытием окна
let HIDE_MODAL_DELAY = 180000; //180000 = 3 мин. Время скрытия модалки после отображения. Поставить секунд 15-20
let HIDE_CASHBACK_DELAY = 30000; //30000 = 30 сек. Время скрытия модалки после демонстрации, что кэшбэк активен

function confirmExtensionInstalled(extensionClass, bannerClass, siteUrl) {
    let extMarker = document.createElement('div');
    extMarker.classList.add(extensionClass);

    if (document.location.href.indexOf(siteUrl) !== -1 && document.querySelector('.' + bannerClass)) {
        document.body.appendChild(extMarker);
    }

}
document.addEventListener('DOMContentLoaded', function () {
    confirmExtensionInstalled('cl-ext-18', 'cl-banner-18', 'cl.world');
});



if(window === window.top) {
    console.log('bridge content 1');
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
        console.log('bridge content 2');
        // console.log('data ', data);

        /**
         * Translation of words
         * @param name - name of translated field
         * @returns {*} - result of translated field in accordance of current language
         */
        function setWord(name) {
            return translate[currentLanguage][name]
        }


        let messageName = data['name'];
        let msg = data['message'];
        let currentLanguage = msg.currentLanguage;
        let currentUrl = document.location.href;
        
        let partner = msg.currentPartner;
        
        // let timers = msg.timers;
        // let modalMarkers = msg.modalMarkers;


        let ANCHOR = document.createElement('div');
        let modalHeader = document.createElement('div');

        let clLogo = document.createElement('div');
        let clLogoImg = document.createElement('div');
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
        reactivation.classList.add('reactivation');
        reactivation.innerText = `${setWord('cashbackNotActivated')}!`;

        /**
         * Modal components render
         */
        function renderModalComponents() {
            console.log('renderModalComponents');

            ANCHOR.id = 'modalCL2017';
            ANCHOR.classList.add('modalCL2017');

            modalHeader.classList.add('modalCL2017__header');

            clLogo.classList.add('cl-logo');

            clLogoImg.classList.add('cl-logo__img');

            close.classList.add('cl-close');

            modalBody.classList.add('modalCL2017__body');

            clPartner.classList.add('cl-partner');

            clPartnerLogo.classList.add('cl-partner__logo');
            clPartnerLogo.setAttribute('src', '');

            clPartnerInfo.classList.add('cl-partner__info');

            cashbackLabel.classList.add('cashback-label');
            cashbackLabel.innerText = `${setWord("cashback")}:`;

            cashbackValue.classList.add('cashback-value');
            cashbackValue.innerText = '';

            modalFooter.classList.add('modalCL2017__footer');

            cashbackActive.classList.add('cashback-active');
            cashbackActive.innerText = setWord("cashbackActivated");

            clButtonWrap.classList.add('button-cl__wrapper');

            clButton.classList.add('button-cl', 'button-cl_pink', 'cl-partner__link', 'button-cl_glass');
            clButton.setAttribute('href', '');

            clButtonInner.innerText = setWord('activate');

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


            clPartnerLogo.setAttribute('src', partner[currentLanguage].logo);
            partner[currentLanguage].less ? cashbackValue.innerText = `${setWord('upTo')} ${roundNumber(partner[currentLanguage].cashback, 1)}%` : cashbackValue.innerText = `${roundNumber(partner[currentLanguage].cashback, 1)}%`;
            clButton.setAttribute('href', partner[currentLanguage].href);
        }

        renderModalComponents();


        /**
         * Condition of showing modal
         */
        function showHideModal() {
console.log('showHideModal');

            if (partner['showModalTimestamp'] === undefined ||
                partner['showModalTimestamp'] === null) {

                ANCHOR.style.display = 'flex';
                ANCHOR.style.opacity = 1;
            } else {
                ANCHOR.style.opacity = 0;
                ANCHOR.style.display = 'none';
            }
        }


        /**
         * Add modal to DOM
         */
        function insertModalInPage() {
console.log('insertModalInPage');

            document.addEventListener('DOMContentLoaded', function () {
                //     window.addEventListener('load', function () {

                /* exclude duplication of adding */
                if (!document.querySelector("#modalCL2017")) {

                    /* simulated delay */
                    setTimeout(function () {
                        document.body.appendChild(ANCHOR);
                    }, SHOW_MODAL_DELAY);

                }
            });
            document.body.appendChild(ANCHOR);
        }


        /**
         * Hide modal by click
         */
        function clickHide() {
            console.log('clickHide');

            close.addEventListener('click', function () {
                ANCHOR.style.display = 'none';

                //>>отправка
                safari.self.tab.dispatchMessage("content", {
                    id: 'queryShowModalTimestamp',
                    url: currentUrl,
                });
            });
        }


        /**
         * Hide modal by time interval HIDE_MODAL_DELAY
         */
        function timeHide() {
console.log('timeHide');

            setTimeout(function () {
                ANCHOR.style.display = 'none';

                //>>отправка
                safari.self.tab.dispatchMessage("content", {
                    id: 'queryShowModalTimestamp',
                    url: currentUrl,
                });
            }, HIDE_MODAL_DELAY);
        }


        /**
         * Check conditions for show info about active cashback
         */
        function cashbackActiveInfo() {
console.log('cashbackActiveInfo');

            /* после отображения активного кэшбэка
             * запрашиваем добавление маркера скрытия модалки - showModalTimestamp
             * (т.е. запрет на ее дальнейшее отображение) */

            /* after showing active cashback window we exclude second showing of him by defining value of timestamp showModalTimestamp */
            if (partner.activatedTimestamp !== null && partner.activatedTimestamp !== undefined) {

                //>>отправка
                safari.self.tab.dispatchMessage("content", {
                    id: 'queryShowModalTimestamp',
                    url: currentUrl,
                });

                /* show info of active cashback in modal */
                cashbackActive.style.display = 'flex';

                /* hide modal with cashback info after HIDE_CASHBACK_DELAY time */
                setTimeout(function () {
                    ANCHOR.style.display = 'none';
                }, HIDE_CASHBACK_DELAY);

            } else {
                cashbackActive.style.display = 'none';
            }
        }

        /**
         * Cashback activation by click
         */
        function activateCashback() {
console.log('activateCashback');

            clButton.addEventListener('click', function () {

                window.open(partner[currentLanguage].href, '_self');
                //>>отправка
                safari.self.tab.dispatchMessage("content", {
                    id: 'setCashbackClick',
                    url: currentUrl,
                    partnerId: partner[currentLanguage].id
                });
            });
        }


        /**
         * Stack of functions for modal window
         */
        function showModal() {
            showHideModal();
            insertModalInPage();
            clickHide();
            timeHide();
            cashbackActiveInfo();
            activateCashback();
        }

        
        //<<прием
        /* condition of modal showing */
        if (messageName === 'bg' && msg.id === 'showModal') {
            console.log('bridge content 3');

            showModal();
        }
    });
}
