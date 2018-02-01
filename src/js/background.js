/* ============= CONSTANTS, VARIABLES ============= */
/* testurl!!! */
var MAIN_URL = "https://cl.world/";
// var MAIN_URL = "http://front.zato.clcorp/";

var serverRequestKey = true;            // allow repeated request for server response checking

/* (languages) */
var languages = [];                     // available translation languages
var defaultLanguage = 'en';
var currentLanguage = defaultLanguage;
var languagesRequestKey = true;         // allow repeated request for available languages

/* (recommended) */
var recommendedObj = {};                // recommended partners in object format
var RECOMMENDED_QUANTITY = 25;        // recommended partners quantity
var recommendedRequestKey = true;       // allow repeated request for recommended

/* (links) */
var links = {};                         // partners links in object format (links)
var linksRequestKey = true;             // allow repeated request for partners links


/* work with aggregate data of extension (languages, recommended, links) */
var extensionDataTimestamp = null;                  // time of last update aggregate data
var EXTENSION_DATA_UPDATE_INTERVAL = 86400000;    // 86400000 = 24h. Update period for aggregate data


/* profile */
var profileData = {default_start: 1};                   // profile data object
var authIdentifier = 0;                 // authorisation identifier  for compare with cookie authorisation; 0 - not
                                        // authorised , >0 (=id) - authorised
var authCookie = 0;                     // current value of cookie authorisation. Will get in our site pages
var profileTimeUpdate = null;           // time of last update profile dta. null - not authorised or not updated yet
var profileRequestKey = true;           //  allow repeated request for profile data
var PROFILE_UPDATE_INTERVAL = 900000; // 900000 = 15min //10800000 = 3h. Update period for profile data


/* детальные данные партнеров */
var detailed = {};                       // detailed partners data (detailed)
var detailedRequestKey = true;           // allow repeated request for detailed data
var DETAILED_LIVE_TIME = 172800000;    //172800000 =  48h. Update period for detailed (not for timestamps)


/* кэшбэк */
var CASHBACK_LIVE_TIME = 86400000;                // 86400000 = 24h. Cashback time update.
var MODAL_LIVE_TIME = 43200000;                   // 43200000 = 12h. Update period for repeated showing modal window.
var MODAL_TIMESTAMPS_CHECK_INTERVAL = 3600000;    // 3600000 = 1h. Interval of repeated checking cashback

/* ============= GET, SET ============= */

function _getProfileData() {
    return profileData;
}

function _setProfileData(val) {
    return profileData = val;
}

function _getDefaultLanguage(){
    return defaultLanguage;
}

function _getLanguages() {
    return languages;
}

function _getCurrentLanguage() {
    return currentLanguage;
}

function _setCurrentLanguage(val) {
    currentLanguage = val;
}


function _getDetailed() {
    return detailed;
}


function _getRecommended() {
    return recommendedObj;
}


function _setActivated(clearUlr, time) {
    /* маркеру активции кэшбэка прописываем время активации */
    return detailed[clearUlr]['activatedTimestamp'] = time;
}


function _setShowModalTimestamp(clearUlr, time) {
    /* in the marker showModalTimestamp write the time of activation or specified value */
    return detailed[clearUlr]['showModalTimestamp'] = time;
}


function _getTranslate() {
    return translate;
}

function _setTranslate(lang, name, val) {
    translate[lang][name] = val;
}


function _getLinks() {
    return links
}

/* ============= SERVICE FUNCTION ============= */


/**
 * Get clear url without http:// and parameters
 * With punycode get cirillic domains
 * @param val
 * @returns {*}
 */

function getClearUrl(val) {
    if (val) {

        if (/(.com\.br)\//.test(val)) {//регулярка для доменов типа ... .com.br/
            val = val.match(/\/\/.*?(www\.|)(([\w\d_\-\.]+)\.(com\.br))\//)
        } else {
            val = val.match(/(http(s)?:\/\/)?(?:www)?([^\/]+\.)?(([а-яА-ЯёЁ\w\d_\-]+)\.([а-яА-ЯёЁ\w\d_\-]+))([\/\?].*)?/);
        }
    }
    if ((val) && (val[4])) {
        return punycode.toUnicode((val[4]));
    } else {
        // console.error(e);
    }
}

/**
 * Safe-response Opera's method
 * https://github.com/operatester/safeResponse/blob/1.1/safeResponse.js
 * @type {{cleanDomString}}
 */
safeResponse = function () {

    let validAttrs = ["class", "id", "href", "style"];

    this.__removeInvalidAttributes = function (target) {
        let attrs = target.attributes, currentAttr;

        for (let i = attrs.length - 1; i >= 0; i--) {
            currentAttr = attrs[i].name;

            if (attrs[i].specified && validAttrs.indexOf(currentAttr) === -1) {
                target.removeAttribute(currentAttr);
            }

            if (
                currentAttr === "href" &&
                /^(#|javascript[:])/gi.test(target.getAttribute("href"))
            ) {
                target.parentNode.removeChild(target);
            }
        }
    };

    this.__cleanDomString = function (data) {
        let parser = new DOMParser;
        let tmpDom = parser.parseFromString(data, "text/html").body;

        let list, current, currentHref;

        list = tmpDom.querySelectorAll("script,img");

        for (let i = list.length - 1; i >= 0; i--) {
            current = list[i];
            current.parentNode.removeChild(current);
        }

        list = tmpDom.getElementsByTagName("*");

        for (let i = list.length - 1; i >= 0; i--) {
            parent.__removeInvalidAttributes(list[i]);
        }

        return tmpDom.innerHTML;
    };

    return {
        cleanDomString: function (html) {
            return parent.__cleanDomString(html)
        }
    }
}();

/**
 * There we use check for all parameters of all objects to safe response (for partnersData array)
 * Проверяем ответ сервера согласно требованиям Opera
 * @param obj
 */
function checkSafeResponse(obj) {




    for (let key in obj) {//перебираем все свойства объекта
        if ((obj.hasOwnProperty(key)) && obj[key]) {
            if ((obj[key].length > 0) && (!isNaN(obj[key]))) {//если число и не пустое значение
                obj[key] = parseFloat(obj[key]);
            } else if (obj[key].constructor === Array) {//массив как объект, если не пустой
                obj[key].length > 0 ? checkSafeResponse(obj[key]) : obj[key] = []
            } else {
                switch (typeof(obj[key])) {
                    case 'string'://строки прогоняем через saferesponce
                        obj[key] = safeResponse.cleanDomString(obj[key]);
                        break;
                    case 'number'://доп. проверка на число
                        obj[key] = parseFloat(obj[key]);
                        break;
                    case 'object'://если вложенный объект. то рекурсивно проверяем
                        checkSafeResponse(obj[key]);
                        break;
                    default:
                        obj[key] = safeResponse.cleanDomString(obj[key]);
                        break;
                }
            }
        }
    }
    return obj;
}


/**
 * Get random value in interval, borders including
 * @param min
 * @param max
 */
function getRandomValue(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Get current time in milliseconds
 * @returns {Number} in milliseconds
 */
function currentMilliseconds() {
    return parseInt(new Date().getTime())
}


/**
 * Calculate interval in milliseconds
 * @param newTime in millisecond
 * @param oldTime in millisecond
 */
function calculateTimeInterval(newTime, oldTime) {

    /* result in millisecond or null */
    return oldTime !== null ? (parseInt(newTime) - parseInt(oldTime)) : null;
}


/**
 * Куки
 */
function cookiesToObj(arr) {
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        let cookie = arr[i].split('=');
        let cookieName = cookie[0].trim();
        let cookieValue = cookie.splice(1, cookie.length).join('=');
        obj[cookieName] = cookieValue;
    }
    return obj;
}

function getCookiesAuth(msg) {


    if (msg.name === "send-cookies") {
        let cookiesValue = msg.message.cookies;
        let cookiesUrl = msg.target['url'];

        if (cookiesUrl !== undefined && (cookiesUrl.indexOf('cl.world') !== -1) && (cookiesValue !== "")) {
            authCookie = parseInt(cookiesToObj(cookiesValue)['user_auth']);
        }
    }
}

/* check the cookies auth for each page reloading (on the pages of our site) */
safari.application.addEventListener("message", getCookiesAuth, false);


/**
 * Transformation array to object for partners links
 * @param arr
 * @param obj
 */
function arrayToObj(arr, obj) {
    for (let i = 0, length = arr.length; i < length; i++) {
        let partner = arr[i];

        /* checking script for get broken partners data (without urls). Don't delete*/
        // if(!partner.site_url){
        //     console.log('partner no url ', partner);
        // }

        /* label of partner object in main object */
        let partnerNote = getClearUrl(partner.site_url);

        obj[partnerNote] = partner;
    }

    return obj;
}


/**
 * Check server work.
 * If server response =! 200, we block all requests to server by change allow repeated requests in false,
 * to acheive delay in random time between less and more
 */
function checkServerResponse() {
    if (serverRequestKey) {
        serverRequestKey = false;
        let less = 20000;
        let more = 120000;

        let url = 'https://profile.cl.world/upload/online_partner_url.json';

        let req = new XMLHttpRequest();
        req.open("GET", url);
        req.send();

        // console.log('send checkServerResponse 1 +++++++++++++++++++ ');

        req.addEventListener('load', function () {
            if (req.status === 200) {
                serverRequestKey = true;
                return false;
            } else {

                /* initiate random delay time */
                let dataRequestDelay = getRandomValue(less, more);
                serverRequestKey = false;
                languagesRequestKey = false;
                recommendedRequestKey = false;
                linksRequestKey = false;
                profileRequestKey = false;
                detailedRequestKey = false;

                setTimeout(() => {
                    serverRequestKey = true;
                    languagesRequestKey = true;
                    recommendedRequestKey = true;
                    linksRequestKey = true;
                    profileRequestKey = true;
                    detailedRequestKey = true;

                }, dataRequestDelay);

            }
        })
    }
}


/**
 * Reset timestamps.
 * launching on logout
 * @param detailedData {object} - detailed data of all partners
 */
function resetTimestampMarkers(detailedData) {

    if (Object.keys(detailedData).length > 0) {
        for (let key in detailedData) {
            if (detailedData.hasOwnProperty(key)) {
                detailedData[key]['visitedTimestamp'] = null;
                detailedData[key]['showModalTimestamp'] = null;
                detailedData[key]['activatedTimestamp'] = null;
            }
        }
    }
}


/**
 * Checking the relevance of timestamps (active cashback and modal showing)
 * Without server response.
 * @param detailedData {object} - detailed data of all partners
 */
function checkModalTimestampsLife(detailedData) {

    if (Object.keys(detailedData).length > 0) {

        for (let key in detailedData) {

            if (detailedData.hasOwnProperty(key)) {

                /* cashback activation last time */
                let oldTimeActivation = detailedData[key]['activatedTimestamp'];

                /* show modal last time */
                let oldTimeModalShow = detailedData[key]['showModalTimestamp'];

                if (oldTimeActivation !== null && oldTimeActivation !== undefined) {

                    if (calculateTimeInterval(currentMilliseconds(), oldTimeActivation) > CASHBACK_LIVE_TIME) {

                        detailedData[key]['activatedTimestamp'] = null;
                    }

                    /* check relevance of modal show timestamp (showModalTimestamp) is need only,
                     * if cashback (activatedTimestamp) not active*/
                } else {

                    /* so, if partner has no active cashback, we check his modal show timestamp,
                     * and every MODAL_LIVE_TIME delay show modal */
                    if ((oldTimeModalShow !== null || oldTimeModalShow !== undefined) &&
                        calculateTimeInterval(currentMilliseconds(), oldTimeModalShow) > MODAL_LIVE_TIME) {

                        detailedData[key]['showModalTimestamp'] = null;
                    }
                }
            }
        }
    }
}


/* Every CASHBACK_CHECK_INTERVAL we set to zero
 * overdue timestamps (cashback and show modal) */
setInterval(() => {
    checkModalTimestampsLife(detailed);
}, MODAL_TIMESTAMPS_CHECK_INTERVAL);


/**
 * Does partner have the translation on current language.
 * Checking in links
 * It's need for forming show\hide status partner data in popup window.
 * And for reject detailed partners data request, if partner has no current translated language
 * @param links - partners links object
 * @param currentClearUrl
 * @param currentLanguage
 * @returns {boolean} - true, if has translation, else false
 */
function checkCurrentLanguageInLink(links, currentClearUrl, currentLanguage) {
    if (links && links[currentClearUrl]) {
        for (let key in links[currentClearUrl]['languages']) {
            if (links[currentClearUrl]['languages'].hasOwnProperty(key)) {

                if (links[currentClearUrl]['languages'][key] === currentLanguage) {
                    return true
                }

            }
        }

        return false;
    }
}


/* ============= LANGUAGES ============= */

/**
 * request languages
 * @param resolve
 * @param reject
 */
function languagesRequest(resolve, reject) {

    /* exclude request duplication */
    if (languagesRequestKey) {
        languagesRequestKey = false;

        /* testurl!!! */
        let url = 'https://profile.cl.world/api/v3';
        // let url = 'http://profile.zato.clcorp/api/v3';

        let req = new XMLHttpRequest();
        req.responseType = "";
        req.withCredentials = true;
        req.open("POST", url);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Accept", "application/json");

        req.send(JSON.stringify({
                query: `query Languages {
                      languages{
                        items {
                          label
                          short_name
                          id
                          is_active
                        }
                        default
                      }
                    }`
            }
        ));

        // console.log('send languagesRequest 2 +++++++++++++++++++ ');

        req.addEventListener('load', function () {
            if (req.status === 200) {
                let response = JSON.parse(req.responseText.replace(/<[^>]*>?/g, ''));
                resolve(response.data['languages']);
                languagesRequestKey = true;
            } else {
                reject();
                languagesRequestKey = true;
            }
        });
    }
}


function updateLanguages(cb) {
    languagesRequest((res) => {
            if (res) {
                currentLanguage = res.default.toLowerCase();
                languages = [];
                for (let i = 0, length = res['items'].length; i < length; i++) {
                    let lang = res['items'][i]['short_name'].toLowerCase();
                    languages.push(lang);
                }

                cb();
            }
        },
        /* if server response fail - we reject  following requests to random time */
        checkServerResponse);
}


/* ============= RECOMMENDED ============= */

/**
 * Request recommended data
 * @param langs - array of languages
 * @param resolve
 * @param reject
 */
function recommendedRequest(langs, resolve, reject) {

    /* exclude request duplication */
    if (recommendedRequestKey) {
        recommendedRequestKey = false;

        /* testurl!!! */
        let url = 'https://profile.cl.world/api/v3';
        // let url = 'http://profile.zato.clcorp/api/v3';

        let req = new XMLHttpRequest();
        req.responseType = '';
        req.withCredentials = true;
        req.open("POST", url);
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Accept', 'application/json');

        let multipleResponse = [];

        for (let i = 0, length = langs.length; i < length; i++) {
            let lang = langs[i];
            let request = {
                query: `query Recommended {
                                onlinePartners(limit: ${RECOMMENDED_QUANTITY}, recommended: true){
                                id
                                name
                                logo
                                cashback
                                less
                                site_url
                                 }
                                }`
                , variables: {locale: lang}
            };
            multipleResponse.push(request);
        }

        req.send(JSON.stringify(multipleResponse));

        // console.log('send recommendedRequest 3 +++++++++++++++++++ ');

        req.addEventListener('load', function () {
            if (req.status === 200) {
                let response = JSON.parse(req.responseText.replace(/<[^>]*>?/g, ''));

                /* safeResponse checking */
                for (let i = 0, length = response.length; i < length; i++) {
                    let arr = response[i].data['onlinePartners'];
                    for (let j = 0, innerLength = arr.length; j < innerLength; j++) {
                        let obj = arr[j];
                        checkSafeResponse(obj);
                    }
                }

                resolve(response);
                recommendedRequestKey = true;

            } else {
                reject();
                recommendedRequestKey = true;
            }
        })
    }
}


function uploadRecommended() {

    for (let i = 0, length = languages.length; i < length; i++) {

        let lang = languages[i];

        /* create injected language object, if not created yet */
        if (!recommendedObj[lang]) {
            recommendedObj[lang] = {};
        }
    }

    recommendedRequest(languages,
        (resultArr) => {

            for (let i = 0, length = resultArr.length; i < length; i++) {
                let arr = resultArr[i].data['onlinePartners'];
                for (let j = 0, innerLength = arr.length; j < innerLength; j++) {
                    let item = arr[j];
                    let clearUrl = getClearUrl(item['site_url']);
                    recommendedObj[languages[i]][clearUrl] = item;
                }
            }

        }, () => {
            console.info('рекомендуемые не загружены');
        });

    recommendedRequestKey = true;
}


/* ============= LINKS ============= */


/**
 * Partners links request
 * @param resolve
 * @param reject
 */
function urlListRequest(resolve, reject) {

    /* exclude request duplication */
    if (linksRequestKey) {
        linksRequestKey = false;

        let url = 'https://profile.cl.world/upload/online_partner_url.json';
        let req = new XMLHttpRequest();
        req.open("GET", url);
        req.send();

        // console.log('send urlListRequest 4 +++++++++++++++++++ ');

        req.addEventListener('load', function () {
            if (req.status === 200) {
                let response = JSON.parse(req.responseText.replace(/<[^>]*>?/g, ''));
                let result = [];

                /* broken data without http:// or empty (for debugging) */
                let breaking = [];

                (() => {
                    response.map((el) => {
                        let url = el.site_url;


                        if (el !== undefined) {

                            if (url !== null &&
                                url !== undefined &&
                                url !== "") {
                                result.push(el);
                            }

                        } else {
                            breaking.push(el);
                        }
                    });

                    /* for debugging. Don't delete */
                    // console.log('result ', result);
                    // console.log('breaking ', breaking);
                    // for (let key in breaking) {
                    //     console.log('сайт ', breaking[key]['id'], '  ', breaking[key]['site_url']);
                    // }
                })();

                resolve(result);
                linksRequestKey = true;
            } else {
                reject();
                linksRequestKey = true;
            }
        })
    }
}


/**
 * Delete detailed partner object, if it has link, that not actual for new partners links after reload
 * @param newObj - new partners links from server
 * @param oldObj - old detailed data
 */
function alignmentObjectData(newObj, oldObj) {//TODO проверить когда будет заполнен detailed
    for (let key in oldObj) {
        if (oldObj.hasOwnProperty(key)) {
            if (newObj.hasOwnProperty(key) === false) {
                delete oldObj[key];
            }
        }
    }
}


/**
 * Update partners links
 */
function uploadUrlList(cb) {

    urlListRequest(function (result) {
            arrayToObj(result, links);
            cb();
        },
        function () {
            /* console.info('urlListRequest reject') */
        });
}


/* ============= AGGREGATE DATA (LANGUAGES, RECOMMENDED, LINKS) ============= */


function uploadExtensionData() {

    /* time after last update aggregate data */
    let timeUpdate = calculateTimeInterval(currentMilliseconds(), parseInt(extensionDataTimestamp));


    if (extensionDataTimestamp === null ||
        timeUpdate > EXTENSION_DATA_UPDATE_INTERVAL

    ) {

        updateLanguages(uploadRecommended);
        uploadUrlList(() => {

            /* adjust the detailed in accordance to new partners links */
            alignmentObjectData(links, detailed);
        });
        extensionDataTimestamp = currentMilliseconds();
    }
}

uploadExtensionData();


/* ============= PROFILE ============= */


/**
 * Profile data request
 * @param resolve
 * @param reject
 */
function profileRequest(resolve, reject) {

    if (profileRequestKey) {
        profileRequestKey = false;

        /* testurl!!! */
        let url = 'https://profile.cl.world/api/v3';
        // let url = 'http://profile.zato.clcorp/api/v3';

        let req = new XMLHttpRequest();
        req.responseType = "";
        req.withCredentials = true;
        req.open("POST", url);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Accept", "application/json");

        req.send(JSON.stringify({
                query: "query Profile { profile { fullName balance id paid } }",
                variables: {locale: "ru"}
            })
        );

        // console.log('send profileRequest 5 +++++++++++++++++++ ');

        req.addEventListener('load', function () {
            if (req.status === 200) {
                let response = JSON.parse(req.responseText.replace(/<[^>]*>?/g, ''));
                resolve(response.data);
                profileRequestKey = true;
            } else {
                reject();
                profileRequestKey = true;
            }
        });
    }
}


/**
 * Reset profile data
 * Also reset timestamps and markers
 */
function resetAuthorisation() {
    profileData = {};
    authIdentifier = 0;
    authCookie = 0;
    profileTimeUpdate = null;

    resetTimestampMarkers(detailed);
}


/**
 * Upload profile data
 */
function uploadProfileData() {

    profileRequest(function (resp) {
            profileData = resp;
            profileTimeUpdate = currentMilliseconds();

            /* assign id, if user authorised */
            if (profileData && profileData.profile) {
                authIdentifier = parseInt(profileData.profile.id);
                authCookie = parseInt(profileData.profile.id);
            }
        },

        () => {
            resetAuthorisation();
            /* if server response fail - we reject  following requests to random time */
            checkServerResponse();
        });
}


/*
 * in first launch browser and\or extension
 * always check profile data
 * */
uploadProfileData();


/**
 * Repeated profile data request.
 * It is necessary to update the data if the user does not enter the site for a long time.
 *
 * Request data if live time of old request is PROFILE_UPDATE_INTERVAL.
 * profileTimeUpdate set to zero
 */
function updateProfileRepeatedly() {

    let currentTime = currentMilliseconds();

    if (calculateTimeInterval(currentTime, profileTimeUpdate) &&
        (calculateTimeInterval(currentTime, profileTimeUpdate) > PROFILE_UPDATE_INTERVAL)
    ) {
        uploadProfileData();
    }
}


/**
 * Check profile data by cookie.
 * Need for check authorisation on  our site
 * Current value of cookie keep in authIdentifier. Compare cookie with them.
 * Cookie must be not zero and request will send, if cookie will be different to authIdentifier
 *
 * @param url - url, for wich cookie wil be compare
 */
function checkAuthorization(url) {

    /* check only on our site */
    if (url && url.indexOf(getClearUrl(MAIN_URL)) !== -1) {

        /* and it not equal zero */
        if (authCookie !== 0) {

            if (authIdentifier !== authCookie) {

                profileRequest(
                    function (resp) {
                        profileData = resp;

                        if (profileData.profile) {
                            authIdentifier = parseInt(profileData.profile.id);
                            authCookie = parseInt(profileData.profile.id);
                        }

                        profileTimeUpdate = currentMilliseconds();

                        /* так как идет переавторизация, то в любом слючае сбрасываем маркеры посещений */
                        resetTimestampMarkers(detailed);

                    },
                    function () {
                        resetAuthorisation();
                    }
                );
            }

            /* при нулевом значении куки сбрасываем данные авторизации в расширении,
             * так как пользователь разлогинился */
        } else {
            resetAuthorisation();
        }
    }
}


/* ============= DETAILED PARTNER DATA ============= */


/**
 * Partner data request
 * @param id - partner id
 * @param lang - checked language
 * @param resolve
 * @param reject
 */
function detailedRequest(id, lang, resolve, reject) {

    if (detailedRequestKey) {
        detailedRequestKey = false;

        /* testurl!!! */
        let url = 'https://profile.cl.world/api/v3';
        // let url = 'http://profile.zato.clcorp/api/v3';

        let req = new XMLHttpRequest();
        req.responseType = '';
        req.withCredentials = true;
        req.open("POST", url);
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('Accept', 'application/json');

        req.send(JSON.stringify({
                query: `query PartnerData {
                      onlinePartners(id: ${id}) {
                        id
                        name
                        logo
                        href
                        cashback
                        less
                        site_url
                        description
                        text
                        recommended
                      }
                    }`
                , variables: {locale: lang}
            })
        );

        console.log('send detailedRequest 6 +++++++++++++++++++ ');

        req.addEventListener('load', function () {
            if (req.status === 200) {
                let response = JSON.parse(req.responseText);
                let resultObj = response.data['onlinePartners'][0];
                resolve(checkSafeResponse(resultObj));
            } else {
                reject();
            }
            detailedRequestKey = true;
        })
    }
}


/**
 * Add data of current tab to detailed
 * @param data - server response by id of current url
 */
function addToDetailed(data) {

    let partnerClearUrl = getClearUrl(data.site_url);
    let partner;

    /* если объект существовал, то данные добавляем\перезаписываем в
     * существующий, иначе создаем новый.
     * Делается, чтобы не стирать данные на остальных языках */
    if (detailed[partnerClearUrl]) {
        partner = detailed[partnerClearUrl];
    } else {
        partner = {};
    }


    /* время занесения подробных данных партнера в кэш.
     * обнуляется при каждом запросе */
    partner.visitedTimestamp = currentMilliseconds();

    /* внутри данных по партнеру создаем объект с наименованием текущего языка.
     * при смене языка будет создаваться новый объект с переведенными данными */
    partner[currentLanguage] = {};
    partner[currentLanguage].id = data.id;
    partner[currentLanguage].name = data['name'];
    partner[currentLanguage].logo = data.logo;
    partner[currentLanguage].href = data.href;
    partner[currentLanguage].cashback = roundNumber(data.cashback, 1);
    partner[currentLanguage].less = data.less;
    partner[currentLanguage].site_url = data.site_url;
    partner[currentLanguage].description = data.description;
    partner[currentLanguage].text = data.text;

    detailed[partnerClearUrl] = partner;
    // console.log('addToDetailed detailed ', detailed);
}


/**
 * Проверка/актуализация подробных данных по клику или обновлению таба.
 * @param clearCurrentUrl - чистый урл текущей вкдадки
 * @param cb - коллбек проверки иконки расширения
 */
function uploadDetailed(clearCurrentUrl, cb) {

    /* если текущая ссылка партнера есть в общем списке */
    if (links[clearCurrentUrl]) {

        /* то проверяем наличие его подробных данных, причем в нужном переводе,
         * и не просрочены ли данные */
        if (
            detailed[clearCurrentUrl] && detailed[clearCurrentUrl][currentLanguage] &&
            calculateTimeInterval(currentMilliseconds(), detailed[clearCurrentUrl]['visitedTimestamp']) < DETAILED_LIVE_TIME) {

            /* обработка иконки без запроса */
            cb(clearCurrentUrl);

        } else {

            /* отправлять запрос для данного языка имеет смысл, только, если есть перевод для данного партнера на данном языке */
            if (checkCurrentLanguageInLink(links, clearCurrentUrl, currentLanguage)) {

                /* иначе запрашиваем данные на сервере */
                /* и помещаем их в детальные */
                let id = links[clearCurrentUrl].id;

                /* до ответа запроса меняем иконку расширения */
                markCheckPartner();


                detailedRequest(id, currentLanguage,
                    (data) => {
                        if (data) {
                            addToDetailed(data);
                        }

                        /* обработка иконки после получения данных сервера */
                        cb(clearCurrentUrl);
                    },

                    /* в случае падения сервера отменяем разрешающие ключи запросов на рандомный интервал */
                    checkServerResponse);
            }
        }
    }
}


/* ============= Работа с иконкой ============= */

/**
 * Иконка не партнера. дефолтная
 */
function markNotPartner() {
    let iconUri = safari.extension.baseURI + 'img/icon/Icon-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


/**
 * Иконка на партнере
 */
function markPartner() {
    let iconUri = safari.extension.baseURI + 'img/icon/partner-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


/**
 * Анимация вращения иконки при активации
 */
function markCheckPartner() {
    let iconUri = safari.extension.baseURI + 'img/icon/wait-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '...';
}


/**
 * Иконка кэшбэка
 */
function markCashbackActive() {
    let iconUri = safari.extension.baseURI + 'img/icon/done-64.png';
    safari.extension.toolbarItems[0].image = iconUri;
    safari.extension.toolbarItems[0].label = '';
}


/**
 * Иконка партнер не партнер
 * @param clearUrl
 */
function checkPartnerIcon(clearUrl) {

    if (links[clearUrl]) {
        markPartner();

        if (detailed && detailed[clearUrl] &&
            detailed[clearUrl]['activatedTimestamp'] !== null &&
            detailed[clearUrl]['activatedTimestamp'] !== undefined) {
            markCashbackActive();
        }

    } else {
        markNotPartner();
    }
}


/**
 * Изменение индикации иконки расширения.
 * Используется при запросе детальных данных
 * @param clearUrl - чистый урл текущей вкладки
 */
function changeIcon(clearUrl) {

    /* если партнер */
    if (links[clearUrl]) {

        markPartner();
        if (detailed[clearUrl] && detailed[clearUrl]['activatedTimestamp']) {
            markCashbackActive();
        }

    } else {
        markNotPartner();
    }
}


/* Действия с табами */
function clickTab() {

    /* урл текущей вкладки */
    let currentUrl = safari.application.activeBrowserWindow.activeTab.url;//урл текущей вкладки
    let clearUrl = getClearUrl(currentUrl);

    uploadExtensionData();
    checkAuthorization(currentUrl);
    checkPartnerIcon(clearUrl);
    uploadDetailed(clearUrl, () => {
        /* при клике сверяем актуальность иконки */
        changeIcon(clearUrl);
    });
}


function reloadTab(val) {

    let currentUrl = safari.application.activeBrowserWindow.activeTab.url;

    /* исключаем повтор запросов для всех открытых вкладок (val.target.url). Только текущая */
    if (val.target.url === currentUrl) {

        let clearUrl = getClearUrl(currentUrl);

        uploadDetailed(clearUrl, () => {
            /* при обновлении сверяем актуальность иконки */
            changeIcon(clearUrl);
        });
        uploadExtensionData();
        checkAuthorization(currentUrl);
        updateProfileRepeatedly();
        checkPartnerIcon(clearUrl);
    }

}


/* Обработчики */
safari.application.activeBrowserWindow.addEventListener("activate", clickTab, true);//клик по табу
safari.application.activeBrowserWindow.addEventListener("navigate", reloadTab, true);//обновление

/**
 * Добавление маркера отображения модалки текущему партнеру
 * @param partner - партнер из списка detailed
 */
function checkModalTimestamp(partner) {

    if (partner['showModalTimestamp'] === undefined ||
        partner['showModalTimestamp'] === null) {

        /* указание времени отображения модалки - по сути, это запрет на ее дальнейшее отображение */
        partner['showModalTimestamp'] = currentMilliseconds();
    }
}


/* Мост между content и background *///TODO Разместить инлайном в глобале.
safari.application.addEventListener("message", function (data) {
    let msg = data['message'];
    let messageName = data['name'];

    //<<прием
    if (messageName === 'content') {
        let contentUrl = msg.url;
        /* по сути все откытые вкладки */
        let clearUrl = getClearUrl(contentUrl);
        let currentUrl = safari.application.activeBrowserWindow.activeTab.url;
        /* текущая вкладка */
        let clearCurrentUrl = getClearUrl(currentUrl);



        if (clearUrl === clearCurrentUrl) { /* работаем только с текущей */
            let currentPartner = detailed[clearUrl];

            //<<прием
            /* начальная связь от content.js */
            if (msg.id === 'startConnect') {


                if ((clearUrl !== undefined) && currentPartner) {


                    // if (clearUrl === ALI_CLEAR) {
                    //
                    //     safari.application.addEventListener("message", function (data) {
                    //         if ((clearUrl !== undefined) && currentPartner) {
                    //             let msg = data['message'];
                    //             let messageName = data['name'];
                    //
                    //
                    //             if (messageName === 'ali-cookies') {
                    //                 let cookiesValue = msg['cookies'];
                    //                 let cookiesObj = cookiesToObj(cookiesValue);
                    //
                    //                 /* проверка на реактивацию выполняется только,
                    //                  * если партнер был активирован ранее */
                    //                 /*отменено*/
                    //                 if (detailed[ALI_CLEAR] &&
                    //                     detailed[ALI_CLEAR].activatedTimestamp !== null &&
                    //                     detailed[ALI_CLEAR].activatedTimestamp !== undefined) {
                    //                     /* если кука aeu_cid не содежит идентификатор "yVF2rZRRj",
                    //                      то отправляем в контент данные алиэкспресс из массива partnersData, чтобы отобразить ремодалку */
                    //                     if ((cookiesObj.aeu_cid) && (cookiesObj.aeu_cid.indexOf(CL_ALI_UID) === -1)) {
                    //
                    //                         detailed[ALI_CLEAR].showModalTimestamp = null;
                    //                         detailed[ALI_CLEAR].activatedTimestamp = null;
                    //
                    //
                    //                     }
                    //                     else {
                    //                         //>>отправка
                    //
                    //                         safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("bg",
                    //                             {
                    //                                 id: 'showModal',
                    //                                 currentPartner,
                    //                                 currentLanguage,
                    //                                 profileData
                    //                             });
                    //                     }
                    //                 }
                    //                 else {
                    //                     //>>отправка
                    //                     safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("bg",
                    //                         {
                    //                             id: 'showModal',
                    //                             currentPartner,
                    //                             currentLanguage,
                    //                             profileData
                    //                         });
                    //                 }
                    //             }
                    //         }
                    //     }, false);
                    //
                    //
                    //     /* все остальные сайты */
                    // }
                    // else {
                    //     //>>отправка
                        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("bg",
                            {
                                id: 'showModal',
                                currentPartner,
                                currentLanguage,
                                profileData
                            });
                    // }
                }
            }
            /*  обработка данных времени показа модалки */
            if (msg.id === 'queryShowModalTimestamp') {

                if (detailed[clearUrl] && clearUrl !== undefined) {
                    let partner = detailed[clearUrl];
                    /* ставим время отображения модалки */
                    checkModalTimestamp(partner);
                }
            }

            /* обработка активаци кэшбэка из модалки*/
            if (msg.id === 'setCashbackClick') {

                /* Выводим в модалке поле с активацией, только если юзер залогинен.
                 *  profile может быть null, поэтому проверяем и id */
                if (profileData && profileData.profile && profileData.profile.id) {
                    currentPartner.activatedTimestamp = currentMilliseconds();

                    /* Сбрасываем showModalTimestamp в null, чтобы после активации кэшбэка модалка отобразилась повторно */
                    currentPartner.showModalTimestamp = null;
                }
            }
        }
    }
});

