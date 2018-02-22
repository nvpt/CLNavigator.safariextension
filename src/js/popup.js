/**
 * Created by CityLife on 23.12.16.
 */

document.addEventListener('DOMContentLoaded', function () {

    let bg = safari.extension.globalPage.contentWindow;
    
    /* partner */
    let partner = document.querySelector('.partner');
    let partnerName = document.querySelector('.partner__name');
    let partnerLogo = document.querySelector('.partner__logo');
    let partnerCashbackLabel = document.querySelector('.partner__cashback-label');
    let partnerCashback = document.querySelector('.partner__cashback-value');
    let partnerDescription = document.querySelector('.partner__description');
    let partnerLinkWrap = document.querySelector('.button-cl__wrapper');
    let cashbackActive = document.querySelector('.cashback-active');
    let languages = bg._getLanguages() ? bg._getLanguages() : ['ru', 'en']; //TODO temp
    let currentLanguage = bg._getCurrentLanguage() ?
        bg._getCurrentLanguage().toLowerCase() :
        'en'; // for  slow data responding
    let requestLang = 'en'; //FOR REQUESTS we always use eng or ru;
    /**
     * Translation of words
     * @param name - name of translated field
     * @returns {*} - result of translated field in accordance of current language
     */
    function setWord(name) {
        return translate[currentLanguage][name];
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
     * @returns HTMLElement - html element
     */
    function createTag(mean, classValue = [], content = '') {
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
        let languagesList = createTag('ul', ['language__list']);

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
            languagesList.classList.contains('visible') ?
                languagesList.classList.remove('visible') :
                languagesList.classList.add('visible');
        });

        for (let i = 0, length = langItems.length; i < length; i++) {
            let lang = langItems[i];

            lang.addEventListener('click', function () {
                let chosenLang = (this.getAttribute('data-lang'));
                currentLang.setAttribute('data-current-lang', chosenLang);
                currentLang.innerText = chosenLang;
                languagesList.classList.remove('visible');
                bg._setCurrentLanguage(chosenLang);
                renderLanguagesInPopup(languages);
                safari.self.hide();
                safari.application.activeBrowserWindow.activeTab.url = safari.application.activeBrowserWindow.activeTab.url; // reload page
            })
        }
    }

    /* spinners */
    let searchListSpinner = document.querySelector('.cl-spinner_searchList'); // спиннер в списке выводимых данных партнеров
    let searchSpinner = document.querySelector('.cl-spinner-search'); // спинер при вводе данных в поле поиска и ожидании ответа
    let spinnerText1 = document.createElement('span');
    let spinnerText2 = document.createElement('span');
    searchListSpinner.appendChild(spinnerText1);
    searchListSpinner.appendChild(spinnerText2);
    /* tabs (not used yet) */
    let tabsButtons = document.querySelectorAll('.tabs__button');
    let tabsBodies = document.querySelectorAll('.tabs__body');
    /* partners list */
    let visitedTitle = document.querySelector('.search-list__h2_visited');
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
    let allShopsLink = document.querySelector('.all-shops');
    allShopsLink.addEventListener('click', function (e) {
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
        userLinkImg.setAttribute('src', 'img/user-24x24.png');
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

        if (bg._getProfileData() && bg._getProfileData().id) {
            let el = bg._getProfileData();
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
                /* testurl!!! */
                safari.application.activeBrowserWindow.openTab().url = 'https://cl.world/profile';
                // safari.application.activeBrowserWindow.openTab().url = 'http://profile.zato.clcorp/';
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
                /* testurl!!! */
                safari.application.activeBrowserWindow.openTab().url = 'https://cl.world/';
                // safari.application.activeBrowserWindow.openTab().url = 'http://front.zato.clcorp/';
                safari.self.hide();
            });
        }
    }

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

    selectTab();//need to move to safari.application.addEventListener('popover', function (e) {...


    /**
     * Render of partner card
     */
    function renderMainCard(tab) {
        currentLanguage = bg._getCurrentLanguage().toLowerCase();
        let currentTabUrl = tab.url;
        let rightUrl = bg.getClearUrl(currentTabUrl);
        partnerCashbackLabel.innerText = setWord('cashback');
        partnerLinkWrap.innerText = '';
        //для предотвращения дублирования событий на обработчике кликов, необходимо генерить элемент с обработчиком
        // внутри это функции
        let partnerLink = document.createElement('a');
        partnerLink.classList.add('button-cl', 'button-cl_pink', 'partner__link', 'button-cl_glass');
        partnerLinkWrap.appendChild(partnerLink);
        partnerLink.innerText = setWord('activate');
        /* чтобы не было пустой кнопки */
        cashbackActive.innerText = setWord('cashbackActivated');

        /* current translation must be available for current partner and current tub url must not be empty */
        if (currentTabUrl !== undefined && rightUrl !== undefined &&
            bg._getDetailed()[rightUrl]) {
            partner.style.display = 'flex';
            let detailedData = bg._getDetailed()[rightUrl][currentLanguage] ?
                bg._getDetailed()[rightUrl][currentLanguage] :
                bg._getDetailed()[rightUrl]['en'] ?
                    bg._getDetailed()[rightUrl]['en'] :
                    bg._getDetailed()[rightUrl]['ru']; // если нет перевода, выводим на англ или русском
            let cashbackTimestamp = bg._getDetailed()[rightUrl]['activatedTimestamp'];
            partner.style.display = 'flex';
            partnerName.innerText = detailedData.name;
            partnerLogo.setAttribute('src', detailedData.logo);
            detailedData.less ? partnerCashback.innerText = `${setWord('upTo')} ${detailedData.cashback} %` : partnerCashback.innerText = `${detailedData.cashback} %`;
            textBottomPadding.classList.add('textBottomPadding');
            /* use allowed sanitize library DOMPurify for inserted HTML */
            partnerDescription.innerHTML = DOMPurify.sanitize(detailedData.text);
            partnerDescription.appendChild(textBottomPadding);

            /* button text and link depends on profile status */
            if (bg._getProfileData() && bg._getProfileData().id) {
                partnerLink.innerText = setWord('activate');
                partnerLink.setAttribute('href', detailedData.href);
                partnerLink.addEventListener('click', function () {
                    bg._setActivated(rightUrl, new Date().getTime());
                    /* showModalTimestamp reset for secondary showing of modal window with info about cashback */
                    bg._setShowModalTimestamp(rightUrl, null);
                    partner.style.display = 'none';
                    safari.self.hide();
                });
            } else {
                partnerLink.innerText = setWord('enterForActivation');
                /* testurl!!! */
                partnerLink.setAttribute('href', 'https://profile.cl.world/login');
                // partnerLink.setAttribute('href', 'http://profile.zato.clcorp/');
                partnerLink.addEventListener('click', function () {
                    partner.style.display = 'none';
                    safari.self.hide();
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
                document.querySelector('.search__autocomplete').focus();
            });

        } else {
            partner.style.display = 'none';
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
            link.setAttribute('href', el.site_url);
            link.addEventListener('click', function () {
                safari.application.activeBrowserWindow.openTab().url = el.site_url;
                safari.self.hide();
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
        clearTag('.search__form-autocomplete.recommended');
        currentLanguage === 'ru' ? requestLang = 'ru' : requestLang = 'en';
        let recommendedPartners = bg._getRecommended()[requestLang];

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
     * Show/hide Last visited title
     */
    function toggleLastVisitedTitle(){
        /* show only if not empty */
        if (last.querySelector('.list-item') && Object.keys(bg._getDetailed()).length > 0 ) {
            lastWrap.style.display = 'block';
            searchListSpinner.style.display = 'none';
        } else {
            lastWrap.style.display = 'none';
        }
    }

    /**
     * last visited partners render
     * Each visited page dynamically has adding here
     */
    function renderLastVisited() {
        clearTag('.search__form-autocomplete.last');
        visitedTitle.innerText = setWord('lastVisitedTitle');
        currentLanguage === 'ru' ? requestLang = 'ru' : requestLang = 'en';

        let keys = Object.keys(bg._getDetailed());
        for (let i = keys.length - 1; i >= 0; i--) {
            listItemRender(bg._getDetailed()[keys[i]][requestLang], last);
        }
        toggleLastVisitedTitle();
    }


    /* Search autocomplete */
    let searchField = document.querySelector('.search__autocomplete');
    let btnClearSearchField = document.querySelector('.search__clear');


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
        toggleLastVisitedTitle();

        btnClearSearchField.addEventListener('click', function () {
            toggleLastVisitedTitle();
            if (last.querySelector('.list-item')) {
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

            searchSpinner.style.display = 'none';
        });
    }


    /**
     * Search request
     */
    function searchRequest(name, resolve, reject) {
        currentLanguage === 'ru' ? requestLang = 'ru' : requestLang = 'en';

        /* testurl!!! */
        let url = 'https://profile.cl.world/api/v3.1';
        // let url = 'http://profile.zato.clcorp/api/v3.1';

        let req = new XMLHttpRequest();
        req.responseType = '';
        req.withCredentials = true;
        req.open("POST", url);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Accept", "application/json");

        req.send(JSON.stringify({
                query: "query onlinePartners { onlinePartners (search: \"" + name + "\")  { id name cashback less href logo site_url} }"
                , variables: {locale: requestLang}
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



        /* will show only if not empty */
        if (arr.length > 0) {
            for (let i = 0, length = arr.length; i < length; i++) {
                listItemRender(arr[i], requested);
            }
            requestedWrap.style.display = 'block';
            searchSpinner.style.display = 'none';
        } else {
            requestedWrap.style.display = 'none';
            searchSpinner.style.display = 'flex';
            searchSpinner.classList.remove('animated');
            searchSpinner.innerText = setWord('searchFail');
        }
    }

    /**
     * Dynamically search render (with debounce delay)
     */
    searchField.addEventListener('input', debounce(function () {
        this.value = this.value.replace(/<[^>]*>?/g, '');
        let searching = this.value;
        searchSpinner.classList.add('animated');
        searchSpinner.style.display = 'none';
        searchListSpinner.style.display = 'none'; // если списки не успели подгрузиться при открытии окна, то удаляем спиннер списков, при начале поиска
        clearSearchInputValue(searching);

        /* minimum request length - 2 symbols */
        if (searching.length > 1) {
            searchSpinner.innerText = `${setWord('search')}...`;
            searchSpinner.style.display = 'flex';
            searchRequest(searching,
                renderRequestedList,
                function (er) { /* console.error(er); */}
            );
        }

        if (last.querySelector('.list-item')) {
            lastWrap.style.display = 'block';
        } else {
            lastWrap.style.display = 'none';
        }
    }, 300));


    /**
     * Functions activated by extension icon click
     */
    safari.application.addEventListener('popover', () => {
        let tab = safari.application.activeBrowserWindow.activeTab;
        searchField.value = '';
        requestedWrap.style.display = 'none';
        btnClearSearchField.style.display = 'none';
        languages = bg._getLanguages();
        currentLanguage = bg._getCurrentLanguage().toLowerCase();
        searchField.setAttribute('placeholder', setWord('searchPlaceholder'));
        spinnerText1.innerText = setWord('spinnerText1');
        spinnerText2.innerText = setWord('spinnerText2');
        allShopsLink.innerText = setWord('moreShopLink');

        renderRecommended();
        renderLanguagesInPopup(languages);
        changeCurrentLanguage(tab);
        renderLastVisited();
        showUserData();
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