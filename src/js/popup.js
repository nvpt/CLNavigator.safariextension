/**
 * Created by CityLife on 23.12.16.
 */


document.addEventListener('DOMContentLoaded', function () {

        let bg = safari.extension.globalPage.contentWindow;

        let languages = bg._getLanguages() || ['ru', 'en'];
        let getCurrentLanguage = bg._getCurrentLanguage();
        let currentLanguage = getCurrentLanguage.toLowerCase();
        console.log('currentLanguage1 ', currentLanguage);
        




        /**
         * Translation of words
         * @param name - name of translated field
         * @returns {*} - result of translated field in accordance of current language
         */
        function setWord(name) {
            return translate[currentLanguage][name]
        }


        /**
         * Instead of innerHTML=''
         * @param elemMarker (string) - class or id. Is required '.' or '#'
         */
        function clearTag(elemMarker) {
            let element = document.querySelector(elemMarker);
            while (element.firstChild) element.removeChild(element.firstChild);
        }

    /**
     * Create tag with attributes in DOM of popup
     * @param mean - name of tag
     * @param classValue (arr) - array of classnames without '.'
     * @param content - content of tag
     * @returns HTMLAnchorElement | HTMLAppletElement | HTMLAreaElement | HTMLAudioElement | HTMLBaseElement | HTMLBaseFontElement | HTMLQuoteElement | HTMLBodyElement | HTMLBRElement | HTMLButtonElement | HTMLCanvasElement | HTMLTableCaptionElement | HTMLTableColElement | HTMLDataElement | HTMLDataListElement | HTMLModElement | HTMLDirectoryElement | HTMLDivElement | HTMLDListElement | HTMLEmbedElement | HTMLFieldSetElement | HTMLFontElement | HTMLFormElement | HTMLFrameElement | HTMLFrameSetElement | HTMLHeadingElement | HTMLHeadElement | HTMLHRElement | HTMLHtmlElement | HTMLIFrameElement | HTMLImageElement | HTMLInputElement | HTMLUnknownElement | HTMLLabelElement | HTMLLegendElement | HTMLLIElement | HTMLLinkElement | HTMLPreElement | HTMLMapElement | HTMLMarqueeElement | HTMLMenuElement | HTMLMetaElement | HTMLMeterElement | HTMLObjectElement | HTMLOListElement | HTMLOptGroupElement | HTMLOptionElement | HTMLOutputElement | HTMLParagraphElement | HTMLParamElement | HTMLPictureElement | HTMLProgressElement | HTMLScriptElement | HTMLSelectElement | HTMLSourceElement | HTMLSpanElement | HTMLStyleElement | HTMLTableElement | HTMLTableSectionElement | HTMLTableDataCellElement | HTMLTemplateElement | HTMLTextAreaElement | HTMLTableHeaderCellElement | HTMLTimeElement | HTMLTitleElement | HTMLTableRowElement | HTMLTrackElement | HTMLUListElement | HTMLVideoElement | MSHTMLWebViewElement -  html element
     */
        function createTag(mean, classValue=[], content = ''){
            let el = document.createElement(mean);
            el.classList.add(...classValue);
            el.innerText = content;
            return el;
        }


        /**
         * Render all languages in select field in popup
         */
        function renderLanguagesInPopup(languages) {

            clearTag('.language');
            let languagesList =  createTag('ul', ['language__list']);

            if (languages.length > 0) {
                for (let i = 0, length = languages.length; i < length; i++) {
                    let lang = languages[i];
                    let item = createTag('li', ['language__item'], lang);
                    item.setAttribute('data-lang', lang);
                    if (lang === currentLanguage) {
                        item.classList.add('active');
                    }
                    languagesList.appendChild(item);
                }
            } else {
                let item = createTag('li', ['language__item'], currentLanguage);
                item.setAttribute('data-lang', currentLanguage);
                item.classList.add('active');
                languagesList.appendChild(item);
            }
            // languagesList = document.querySelector('.language__list');
           

            let currentLang = createTag('div', ['language__current'], currentLanguage);
            currentLang.setAttribute('data-current-lang', currentLanguage);

            let languageWrap = document.querySelector('.language');
            languageWrap.appendChild(currentLang);
            languageWrap.appendChild(languagesList);
            languagesList.style.top = `-${languagesList.clientHeight + 5}px`;
        }


        /**
         * Change of current language
         * @param tab - current tab
         * @returns {*}
         */
        function changeCurrentLanguage(tab) {

            let langItems = document.querySelectorAll('.language__item');
            let currentLang = document.querySelector('.language__current');
            let languagesList = document.querySelector('.language__list');
            let languages = bg._getLanguages();

            currentLang.addEventListener('click', () => {
                console.log('currentLang');
                
                languagesList.classList.contains('visible') ?
                    languagesList.classList.remove('visible') :
                    languagesList.classList.add('visible');
            });

            for (let i = 0, length = langItems.length; i < length; i++) {
                let lang = langItems[i];

                lang.addEventListener('click', function () {
                    console.log('lang');
                    
                    let chosenLang = (this.getAttribute('data-lang'));
                    currentLang.setAttribute('data-current-lang', chosenLang);
                    currentLang.innerText = chosenLang;
                    languagesList.classList.remove('visible');

                    bg._setCurrentLanguage(chosenLang);
                    renderLanguagesInPopup(languages);
                    safari.self.hide();
                    safari.application.activeBrowserWindow.activeTab.url = safari.application.activeBrowserWindow.activeTab.url;
                })
            }



        }




        /* spinners */
        let searchListSpinner = document.querySelector('.cl-spinner_searchList');

        let searchListSpinnerText1 = document.createElement('span');
        searchListSpinnerText1.innerText = setWord('spinnerSearchList1');
        let searchListSpinnerText2 = document.createElement('span');
        searchListSpinnerText2.innerText = setWord('spinnerSearchList2');

        searchListSpinner.appendChild(searchListSpinnerText1);
        searchListSpinner.appendChild(searchListSpinnerText2);


        /* partner */
        // let partner = document.querySelector('.partner');
        // let partnerName = document.querySelector('.partner__name');
        // let partnerLogo = document.querySelector('.partner__logo');
        // let partnerCashbackLabel = document.querySelector('.partner__cashback-label');
        // partnerCashbackLabel.innerText = setWord('cashback');
        // let partnerCashback = document.querySelector('.partner__cashback-value');
        // let partnerDescription = document.querySelector('.partner__description');
        // let partnerLink = document.querySelector('.partner__link');

        /* tabs (not used yet) */
        let tabsButtons = document.querySelectorAll('.tabs__button');
        let tabsBodies = document.querySelectorAll('.tabs__body');



        /* partners list */
        let visitedTitle = document.querySelector('.search-list__h2_visited');
        visitedTitle.innerText = setWord('lastVisitedTitle');
        let recommendedTitle = document.querySelector('.search-list__h2_recommended');
        let partnerThumb = document.querySelectorAll('.list-item');
        let recommendedWrap = document.querySelector('.search-list__content_recommended');
        let lastWrap = document.querySelector('.search-list__content_last');
        let requestedWrap = document.querySelector('.search-list__content_requested');
        let recommended = document.querySelector('.search__form-autocomplete.recommended');
        let last = document.querySelector('.search__form-autocomplete.last');
        let requested = document.querySelector('.search__form-autocomplete.requested');

        /* bottom padding in partner description text */
        let textBottomPadding = document.createElement('div');

        let allShopsLink = document.querySelector('.all-shops');//for ff
        allShopsLink.innerText = setWord('moreShopLink');
        allShopsLink.addEventListener('click', function (e) {//for ff
            e.preventDefault();

            /* testurl!!! */
            window.open('https://cl.world/cases', '_blank');
            // window.open('http://front.zato.clcorp/cases', '_blank');

            window.close();
        });
        let popupLogoLink = document.querySelector('.popup__logo-link');//for ff
        popupLogoLink.setAttribute('title', setWord('logoTitle'));
        popupLogoLink.addEventListener('click', function (e) {//for ff
            e.preventDefault();

            /* testurl!!! */
            window.open('https://cl.world/', '_blank');
            // window.open('http://front.zato.clcorp/', '_blank');

            window.close();
        });


        /**
         * Profile
         */
        function showUserData() {

            /* user */
            let user = document.querySelector('.user');
            let userLink = document.createElement('a');
            userLink.setAttribute('target', '_blank');

            let userLinkImg = document.createElement('img');
            userLinkImg.setAttribute('src', 'img/user_24x24.png');
            userLinkImg.classList.add('user__icon');

            let userLinkName = document.createElement('span');
            userLinkName.classList.add('user__name');

            let userCash = document.createElement('span');
            userCash.classList.add('user__cash');

            let userCashImg = document.createElement('img');
            userCashImg.setAttribute('src', 'img/balance.png');
            userCashImg.classList.add('user__cash-icon');

            let userCashValue = document.createElement('span');
            userCashValue.classList.add('user__cash-value');



            if ((bg._getProfileData()) && (bg._getProfileData().profile)) {
                let el = bg._getProfileData().profile;
                user.innerText = '';
                userLink.removeAttribute('class');
                userLinkName.innerText = el['fullName'];
                userLink.appendChild(userLinkImg);
                userLink.appendChild(userLinkName);
                userLink.classList.add('user__login-link', 'user__login-link_logged');
                userCashValue.innerText = el['balance'] + ' CL';
                userCash.appendChild(userCashImg);
                userCash.appendChild(userCashValue);
                user.appendChild(userLink);
                user.appendChild(userCash);

                userLink.addEventListener('click', function () {
                    safari.application.activeBrowserWindow.openTab().url = 'https://cl.world/profile';
                    safari.self.hide();
                });

            } else {
                user.innerText = '';
                userLink.removeAttribute('class');
                userLink.innerText = setWord('enter');
                userLink.classList.add('user__login-link');
                user.appendChild(userLink);
                userCash.style.display = 'none';
                user.appendChild(userCash);

                userLink.addEventListener('click', function () {
                    safari.application.activeBrowserWindow.openTab().url = 'https://cl.world/';
                    safari.self.hide();
                });

            }
        }

        showUserData();

        /**
         * Switch tabs
         */
        function selectTab() {
            for (let i = 0, length = tabsButtons.length; i < length; i++) {
                (function (e) {
                    tabsButtons[e].addEventListener('click', function () {
                        partner.style.display = 'none';
                        for (let y = 0, length = tabsButtons.length; y < length; y++) {
                            tabsButtons[y].classList.remove('active');
                            tabsBodies[y].classList.remove('active');
                        }
                        tabsButtons[e].classList.add('active');
                        let mark = tabsButtons[e].getAttribute('id');
                        if (tabsBodies[e].classList.contains(mark)) {
                            tabsBodies[e].classList.add('active');
                        }
                    });
                })(i);
            }
        }

        selectTab();


        /**
         * Render of partner card
         */
        function renderMainCard(tab) {

            let getCurrentLanguage = bg._getCurrentLanguage();
            let currentLanguage = getCurrentLanguage.toLowerCase();

            // console.log('languages ', languages);
            // console.log('bg._getDetailed() ', bg._getDetailed());

            let currentTabUrl = tab.url;
            let rightUrl = bg.getClearUrl(currentTabUrl);

            let partner = document.querySelector('.partner');
            let partnerName = document.querySelector('.partner__name');
            let partnerLogo = document.querySelector('.partner__logo');
            let partnerCashbackLabel = document.querySelector('.partner__cashback-label');
            partnerCashbackLabel.innerText = setWord('cashback');
            let partnerCashback = document.querySelector('.partner__cashback-value');
            let partnerDescription = document.querySelector('.partner__description');

            //для предотвращения дублирования событий на обработчике кликов, необходимо генерить элемент с обработчиком внутри это ункции
            let partnerLinkWrap = document.querySelector('.button-cl__wrapper');
            partnerLinkWrap.innerText='';
            let partnerLink = document.createElement('a');
            partnerLink.classList.add('button-cl', 'button-cl_pink', 'partner__link', 'button-cl_glass');
            partnerLinkWrap.appendChild(partnerLink);


            let cashbackActive = document.querySelector('.cashback-active');
            cashbackActive.innerText = setWord('cashbackActivated');


            /* check the download of partners */
            if (Object.keys(bg._getDetailed()).length > 0) {
                // console.log('currentLanguage3 ', currentLanguage);
                let allowShow = bg.checkCurrentLanguageInLink(bg._getLinks(), rightUrl, currentLanguage);

                /* current translation must be available for current partner and current tub url must not be empty */
                if (allowShow && bg._getLinks()[rightUrl] &&
                    currentTabUrl !== undefined && rightUrl !== undefined) {

                    let detailedData = bg._getDetailed()[rightUrl][currentLanguage];
                    // console.log('bg._getDetailed() ', bg._getDetailed());
                    // console.log('currentLanguage4 ', currentLanguage);
                    // console.log('detailedData ', detailedData);

                    let cashbackTimestamp = bg._getDetailed()[rightUrl]['activatedTimestamp'];

                    partner.style.display = 'flex';
                    partnerName.innerText = detailedData.name;
                    partnerLogo.setAttribute('src', detailedData.logo);
                    detailedData.less ? partnerCashback.innerText = `${setWord('upTo')} ${detailedData.cashback} %` : partnerCashback.innerText = `${detailedData.cashback} %`;
                    textBottomPadding.classList.add('textBottomPadding');
                    partnerDescription.innerHTML = DOMPurify.sanitize(detailedData.text); // use allowed sanitize library DOMPurify for inserted HTML
                    partnerDescription.appendChild(textBottomPadding);


                    /* button text and link depends on profile status */
                    if ((bg._getProfileData()) && (bg._getProfileData().profile)) {
                        partnerLink.innerText = setWord('activate');
                        partnerLink.setAttribute('href', detailedData.href);
                        partnerLink.addEventListener('click', function (e) {
                            e.preventDefault();
                            bg._setActivated(rightUrl, new Date().getTime());
                            // chrome.tabs.update(tab.id, {url: detailedData.href});

                            /* showModalTimestamp reset for secondary showing of modal window with info about cashback */
                            bg._setShowModalTimestamp(rightUrl, null);
                            partner.style.display = 'none';
                            window.close();
                            alert('rrr');
                        });
                    } else {
                        partnerLink.innerText = setWord('enterForActivation');
                        partnerLink.setAttribute('href', 'https://profile.cl.world/login');

                        partnerLink.addEventListener('click', function (e) {
                            e.preventDefault();
                            // chrome.tabs.update(tab.id, {url: 'https://profile.cl.world/login'});
                            partner.style.display = 'none';
                            window.close();
                        });
                    }


                    /* checking is cashback is active, without click necessary */
                    if (cashbackTimestamp !== null &&
                        cashbackTimestamp !== undefined) {
                        cashbackActive.style.display = 'flex';
                    } else {
                        cashbackActive.style.display = 'none';
                    }

                    let closePartner = document.querySelector('.partner__close-icon');
                    closePartner.addEventListener('click', function () {
                        partner.style.display = 'none';
                    });

                } else {
                    partner.style.display = 'none';
                }
            }
        }


        /**
         * List of partners pattern
         * @param el - source data element
         * @param target - where it will be placed
         */
        function listItemRender(el, target) {
            if (el && el.id) {
                let searchItem = document.createElement('li');
                searchItem.classList.add('list-item');

                let link = document.createElement('a');
                link.classList.add('list-item__link');
                link.setAttribute('target', "_blank");
                link.setAttribute('title', `${setWord('openInNewWindow')} el.name`);

                /* for ff */
                link.addEventListener('click', function (e) {
                    e.preventDefault();

                    bg.uploadDetailed(bg.getClearUrl(el.site_url), () => {}); //for ff, preloading modal window

                    window.open(el.site_url, '_blank');
                    window.close();
                });

                let inner = document.createElement('div');
                inner.classList.add('list-item__inner');

                let label = document.createElement('div');
                label.classList.add('list-item__label');

                let pictureWrap = document.createElement('div');
                pictureWrap.classList.add('list-item__picture-wrap');

                let picture = document.createElement('img');
                picture.classList.add('list-item__picture');
                picture.setAttribute('src', el.logo);
                picture.setAttribute('alt', el.name);

                let name = document.createElement('span');
                name.classList.add('list-item__name');
                name.innerText = el.name;

                label.appendChild(pictureWrap);
                label.appendChild(name);

                pictureWrap.appendChild(picture);

                let info = document.createElement('div');
                info.classList.add('list-item__info');

                let cashbackInfo = document.createElement('span');
                cashbackInfo.classList.add('list-item__cashback');
                cashbackInfo.innerText = setWord('cashback');

                let cashbackValue = document.createElement('span');
                cashbackValue.classList.add('list-item__value');

                /* round cashback value */
                el.cashback = bg.roundNumber(el.cashback, 1);

                el.less ? cashbackValue.innerText = `${setWord('upTo')} ${el.cashback}%` : cashbackValue.innerText = `${el.cashback}%`;
                info.appendChild(cashbackInfo);
                info.appendChild(cashbackValue);
                inner.appendChild(label);
                inner.appendChild(info);
                link.appendChild(inner);
                searchItem.appendChild(link);

                target.appendChild(searchItem);
            }
        }

        /**
         * Recommended partners render
         */
        function renderRecommended() {
            let getCurrentLanguage = bg._getCurrentLanguage();
            let currentLanguage = getCurrentLanguage.toLowerCase();
            let recommendedPartners = bg._getRecommended()[currentLanguage];

            for (let key in recommendedPartners) {
                if (recommendedPartners.hasOwnProperty(key)) {
                    listItemRender(recommendedPartners[key], recommended);
                }
            }

            if (recommendedPartners && Object.keys(recommendedPartners).length > 0 && recommended.firstChild) {
                recommendedTitle.innerText = setWord('recommendedTitle');
                searchListSpinner.style.display = 'none';
                recommendedWrap.style.display = 'block';
            } else {
                recommendedTitle.innerText = '';
                recommendedWrap.style.display = 'none';
                searchListSpinner.style.display = 'flex';
            }
        }

        /**
         * last visited partners render
         * Each visited page dynamically has adding here
         */
        function renderLastVisited() {

            let keys = Object.keys(bg._getDetailed());

            for (let i = keys.length - 1; i >= 0; i--) {
                listItemRender(bg._getDetailed()[keys[i]][currentLanguage], last);
            }

            /* show only if not empty */
            if (last.querySelector('.list-item')) {
                lastWrap.style.display = 'block';
            } else {
                lastWrap.style.display = 'none';
            }
        }


        /* Search autocomplete */
        let searchField = document.querySelector('.search__autocomplete');
        searchField.setAttribute('placeholder', setWord('searchPlaceholder'));
        let btnClearSearchField = document.querySelector('.search__clear');

        btnClearSearchField.focus();

        function clearSearchInputValue(el) {
            if (el.length > 0) {
                btnClearSearchField.style.display = 'block';
                lastWrap.style.display = 'none';
                recommendedWrap.style.display = 'none';
                requestedWrap.style.display = 'block';
            } else {
                btnClearSearchField.style.display = 'none';
                lastWrap.style.display = 'block';
                recommendedWrap.style.display = 'block';
                requestedWrap.style.display = 'none';
            }

            btnClearSearchField.addEventListener('click', function () {
                if (Object.keys(bg._getDetailed()).length > 0) {
                    lastWrap.style.display = 'block';
                } else {
                    lastWrap.style.display = 'none';
                }
                recommendedWrap.style.display = 'block';
                requestedWrap.style.display = 'none';

                btnClearSearchField.style.display = 'none';
                searchField.value = '';
                searchField.focus();

                for (let i = 0, length = partnerThumb.length; i < length; i++) {
                    partnerThumb[i].style.display = 'block';
                }
            });
        }


        /**
         * Search request
         */
        function searchRequest(name, resolve, reject) {
            let getCurrentLanguage = bg._getCurrentLanguage();
            let currentLanguage = getCurrentLanguage.toLowerCase();

            /* all languages array */
            let languages = bg._getLanguages();
            /* testurl!!! */
            let url = 'https://profile.cl.world/api/v3';
            // let url = 'http://profile.zato.clcorp/api/v3';

            let req = new XMLHttpRequest();
            req.responseType = '';
            req.withCredentials = true;
            req.open("POST", url);
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader("Accept", "application/json");

            req.send(JSON.stringify({
                    query: "query onlinePartners { onlinePartners (search: \"" + name + "\")  { id name cashback less href logo site_url} }"
                    , variables: {locale: currentLanguage}
                })
            );

            // console.log('searchRequest +++++++++++++');

            req.addEventListener('load', function () {
                if (req.status === 200) {
                    let pars = JSON.parse(req.responseText);
                    for (let i = 0, length = pars.length; i < length; i++) {
                        bg.checkSafeResponse(pars[i]);
                    }
                    resolve(pars.data['onlinePartners']);
                } else {
                    reject();
                }
            });
        }


        /**
         * Partners list render by search request
         * @param elements
         */
        function renderRequestedList(elements) {
            let arr = elements;

            clearTag('.search__form-autocomplete.requested');

            for (let i = 0, length = arr.length; i < length; i++) {
                listItemRender(arr[i], requested);
            }

            /* show only if not empty */
            if (arr.length > 0) {
                requestedWrap.style.display = 'block';
            } else {
                requestedWrap.style.display = 'none';
            }
        }

        /**
         * Dynamically search render (with debounce delay)
         */
        searchField.addEventListener('input', debounce(function () {

            this.value = this.value.replace(/<[^>]*>?/g, '');
            let searching = this.value;

            clearSearchInputValue(searching);


            /* minimum request length - 2 symbols */
            if (searching.length > 1) {

                searchRequest(searching,
                    renderRequestedList,
                    function (er) { /* console.error(er); */}
                );

            }
        }, 300));


        /**
         * Functions activated by extension icon click
         */
        safari.application.addEventListener('popover', function (e) {
            let tab = safari.application.activeBrowserWindow.activeTab;
            searchField.value = '';


            languages = bg._getLanguages();
            getCurrentLanguage = bg._getCurrentLanguage();
            currentLanguage = getCurrentLanguage.toLowerCase();
            console.log('currentLanguage2 ', currentLanguage);
            

            renderLanguagesInPopup(languages);
            changeCurrentLanguage(tab);

            renderLastVisited();
            renderRecommended();
            renderMainCard(tab);
        });

});


/**
 * Debounce delay
 * https://davidwalsh.name/javascript-debounce-function
 * @param func
 * @param wait
 * @param immediate
 * @returns {Function}
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this, args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}