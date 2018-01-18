
document.addEventListener('DOMContentLoaded', function () {



    var bg = safari.extension.globalPage.contentWindow;


    var tabsButtons = document.querySelectorAll('.tabs__button');
    var tabsBodies = document.querySelectorAll('.tabs__body');


    var partnerThumb = document.querySelectorAll('.list-item');
    var recommendedWrap = document.querySelector('.search-list__content_recommended');
    var lastWrap = document.querySelector('.search-list__content_last');
    var requestedWrap = document.querySelector('.search-list__content_requested');
    var recommended = document.querySelector('.search__form-autocomplete.recommended');
    var last = document.querySelector('.search__form-autocomplete.last');
    var requested = document.querySelector('.search__form-autocomplete.requested');

    var sanitizeResolutions = {
        allowedTags: ['p', 'b', 'i', 'em', 'strong', 'a', 'img', 'span'],
        allowedAttributes: {
            'a': ['href'],
            'img': ['class', 'src'],
            'span': ['class']
        }
    };


    function showUserData() {

        var user = document.querySelector('.user');
        var userLink = document.createElement('a');
        userLink.setAttribute('target', '_blank');

        var userLinkImg = document.createElement('img');
        userLinkImg.setAttribute('src', 'img/user_24x24.png');
        userLinkImg.classList.add('user__icon');

        var userLinkName = document.createElement('span');
        userLinkName.classList.add('user__name');

        var userCash = document.createElement('span');
        userCash.classList.add('user__cash');

        var userCashImg = document.createElement('img');
        userCashImg.setAttribute('src', 'img/balance.png');
        userCashImg.classList.add('user__cash-icon');

        var userCashValue = document.createElement('span');
        userCashValue.classList.add('user__cash-value');


        if ((bg._getLoginData()) && (bg._getLoginData().profile)) {
            var el = bg._getLoginData().profile;
            user.innerText = '';
            userLink.removeAttribute('class');
            userLink.innerText = '';
            userLinkName.innerText = el.fullName;
            userLink.appendChild(userLinkImg);
            userLink.appendChild(userLinkName);
            userLink.setAttribute('href', 'https://cl.world/profile');
            userLink.classList.add('user__login-link', 'user__login-link_logged');

            userLink.addEventListener('click', function () {
                safari.application.activeBrowserWindow.openTab().url = 'https://cl.world/profile';
                safari.self.hide();
            });
            userCash.style.display = 'flex';
            userCashValue.innerText = el.balance + ' руб.';
            userCash.appendChild(userCashImg);
            userCash.appendChild(userCashValue);

            user.appendChild(userLink);
            user.appendChild(userCash);

        } else {
            user.innerText = '';
            userLink.removeAttribute('class');
            userLink.innerText = "Войти";
            userLink.setAttribute('href', 'https://cl.world/');
            userLink.addEventListener('click', function () {
                safari.application.activeBrowserWindow.openTab().url = 'https://cl.world/';
                safari.self.hide();
            });
            userLink.classList.add('user__login-link');
            user.appendChild(userLink);
            userCash.style.display = 'none';
            user.appendChild(userCash);
        }
    }


    function selectTab() {
        for (var i = 0; i < tabsButtons.length; i++) {
            (function (e) {
                tabsButtons[e].addEventListener('click', function () {
                    partner.style.display = 'none';
                    for (var y = 0; y < tabsButtons.length; y++) {
                        tabsButtons[y].classList.remove('active');
                        tabsBodies[y].classList.remove('active');
                    }
                    tabsButtons[e].classList.add('active');
                    var mark = tabsButtons[e].getAttribute('id');
                    if (tabsBodies[e].classList.contains(mark)) {
                        tabsBodies[e].classList.add('active');
                    }
                });
            })(i);
        }
    }

    selectTab();


    function renderMainCard(tab) {

        var currentTabUrl = tab.url;
        var rightUrl = bg.getClearUrl(currentTabUrl);
        console.log('rightUrl ', rightUrl);
        var partner = document.querySelector('.partner');
        var partnerName = document.querySelector('.partner__name');
        var partnerUrl = document.querySelector('.partner__url');
        var partnerLogo = document.querySelector('.partner__logo');
        var partnerCashback = document.querySelector('.partner__cashback > span');
        var partnerDescription = document.querySelector('.partner__description');

        var partnerLinkWrap = document.querySelector('.button-cl__wrapper');
        partnerLinkWrap.innerText='';
        var partnerLink = document.createElement('a');
        partnerLink.classList.add('button-cl', 'button-cl_pink', 'partner__link', 'button-cl_glass');
        partnerLinkWrap.appendChild(partnerLink);

        var cashbackActive = document.querySelector('.cashback-active');


        if ((bg._getLoginData()) && (bg._getLoginData().profile)) {
            partnerLink.innerHTML = '<span>Активировать</span>';
        } else {
            partnerLink.innerHTML = '<span>Войти для активации</span>';
        }


        if (Object.keys(bg._getPartnersData()).length > 0) {
            if ((bg._getPartnersData()[rightUrl]) && (currentTabUrl !== undefined) && (rightUrl !== undefined)) {
                var el = bg._getPartnersData()[rightUrl];
                partner.style.display = 'flex';
                partnerName.innerText = el.name;
                partnerUrl.innerText = bg.getClearUrl(el.site_url);
                partnerLogo.setAttribute('src', el.logo_url);
                partnerCashback.innerText = el.sale_text;
                var bottomPadding = document.createElement('div');
                bottomPadding.classList.add('bottomPadding');
                partnerDescription.innerHTML = sanitizeHtml(el.text, sanitizeResolutions);
                partnerDescription.appendChild(bottomPadding);
                partner.style.display = 'flex';
                partnerLink.setAttribute('href', el.href);


                function eventOnCardBtn () {

                    safari.self.hide();

                    if (bg._getLoginData().profile) { 
                        var modalMarkers = bg._getModalMarkers();
                        for (var i = 0; i < modalMarkers.length; i++) {
                            if (modalMarkers[i] === el.id) {
                                modalMarkers.splice(i, 1);
                            }
                        }
                        bg._setModalMarkers(modalMarkers);
                    }

                    if (rightUrl === bg._getAliClear()) {
                        bg._setModalShowed(true);
                        if (bg._getRemodalShowed()) {
                            bg._setRemodalShowed(false);
                        }
                    }

                    if ((Object.keys(bg._getLoginData()).length > 0) && (!bg._getTimers()[rightUrl])) {
                        bg._addToTimers(rightUrl, new Date().getTime());
                        setTimeout(function () {
                            cashbackActive.style.display = 'flex';
                            bg.markCashbackActive();
                        }, 1200);
                    }
                }

                partnerLink.addEventListener('click', eventOnCardBtn, false);


                if ((bg._getLoginData()) && (bg._getTimers()[rightUrl])) {
                    cashbackActive.style.display = 'flex';
                    bg.markCashbackActive();
                } else {
                    cashbackActive.style.display = 'none';
                    bg.markPartner();
                }

                var closePartner = document.querySelector('.partner__close-icon');
                closePartner.addEventListener('click', function () {
                    partner.style.display = 'none';
                });

            } else {
                partnerLink.setAttribute('href', '');
                partner.style.display = 'none';
            }
        }
    }


    function listItemRender(el, target) {
        if (el.id) {
            var searchItem = document.createElement('li');
            searchItem.classList.add('list-item');

            var link = document.createElement('a');
            link.classList.add('list-item__link');
            link.setAttribute('href', el.site_url);

            link.addEventListener('click', function () {
                safari.application.activeBrowserWindow.openTab().url = el.site_url;
                safari.self.hide();
            });

            link.setAttribute('target', "_blank");
            link.setAttribute('title', 'Открыть в новом окне ' + el.name);

            var inner = document.createElement('div');
            inner.classList.add('list-item__inner');

            var label = document.createElement('div');
            label.classList.add('list-item__label');

            var pictureWrap = document.createElement('div');
            pictureWrap.classList.add('list-item__picture-wrap');

            var picture = document.createElement('img');
            picture.classList.add('list-item__picture');
            picture.setAttribute('src', el.logo_url);
            picture.setAttribute('alt', el.name);

            var name = document.createElement('span');
            name.classList.add('list-item__name');
            name.innerText = el.name;

            label.appendChild(pictureWrap);
            label.appendChild(name);

            pictureWrap.appendChild(picture);

            var info = document.createElement('div');
            info.classList.add('list-item__info');

            var cashbackInfo = document.createElement('span');
            cashbackInfo.classList.add('list-item__cashback');
            cashbackInfo.innerText = 'Кэшбэк:';

            var cashbackValue = document.createElement('span');
            cashbackValue.classList.add('list-item__value');
            cashbackValue.innerText = el.sale_text;
            info.appendChild(cashbackInfo);
            info.appendChild(cashbackValue);
            inner.appendChild(label);
            inner.appendChild(info);
            link.appendChild(inner);
            searchItem.appendChild(link);

            target.appendChild(searchItem);
        }
    }

    function renderRecommended() {
        recommended.innerText='';
        for (var i = 0; i < partners.length; i++) {
            listItemRender(partners[i], recommended);
        }
        if (partners.length > 0) {
            recommendedWrap.style.display = 'block';
        } else {
            recommendedWrap.style.display = 'none';
        }
    }

    function renderLastVisited() {
        last.innerText='';
        var keys = Object.keys(bg._getPartnersVisited());
        for (var i = keys.length - 1; i >= 0; i--) {
            listItemRender(bg._getPartnersVisited()[keys[i]], last);
        }

        if (Object.keys(bg._getPartnersVisited()).length > 0) {
            lastWrap.style.display = 'block';

        } else {
            lastWrap.style.display = 'none';
        }
    }


    var searchField = document.querySelector('.search__autocomplete');

    var btnClearSearchField = document.querySelector('.search__clear');

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
            if (bg._getPartnersVisited().length > 0) {
                lastWrap.style.display = 'block';
            } else {
                lastWrap.style.display = 'none';
            }
            recommendedWrap.style.display = 'block';
            requestedWrap.style.display = 'none';

            btnClearSearchField.style.display = 'none';
            searchField.value = '';
            searchField.focus();

            for (var i = 0; i < partnerThumb.length; i++) {
                partnerThumb[i].style.display = 'block';
            }
        });
    }


    function searchRequest(name, resolve, reject) {
        var url = 'https://cl.world/api/v2/cases/index?&name=' + name + '&show=1&non_strict=1&lang=ru';
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.send();
        req.addEventListener('load', function () {
            if (req.status === 200) {
                var pars = JSON.parse(req.responseText);
                for (var i = 0; i < pars.length; i++) {
                    bg.checkSafeResponse(pars[i]);
                }
                resolve(pars);
            } else {
                reject();
            }
        });
    }

    function renderRequestedList(elements) {
        var arr = elements;
        requested.innerHTML = '';
        for (var i = 0; i < arr.length; i++) {
            listItemRender(arr[i], requested);
        }
        if (arr.length > 0) {
            requestedWrap.style.display = 'block';
        } else {
            requestedWrap.style.display = 'none';
        }
    }


    searchField.addEventListener('input', function () {
        var searching = this.value;
        clearSearchInputValue(searching);
        requested.innerHTML = '';
        searchRequest(searching,
            renderRequestedList,
            function (er) {
            }
        );
    });



    safari.application.addEventListener('popover', function (e) {
        var tab = safari.application.activeBrowserWindow.activeTab;
        showUserData();
        searchField.value = '';
        bg.checkTimers(bg.getClearUrl(tab.url));
        renderMainCard(tab);
        renderRecommended();
        renderLastVisited();
    });
});
