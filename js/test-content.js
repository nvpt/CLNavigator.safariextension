console.log('--test-content--');

/*
* Прием данных из глобал
* */

function webHandler(message) {
    var messageName = message.name;
    var messageData = message.message;

    if (messageName === "login-data-send") {
        renderTestModal(message);
    }

    // if (messageName === "partner-data-send") {
    //     renderTestModal(message);
    // }
}
safari.self.addEventListener("message", webHandler, false);


/**
 * Вывод принятых данных в модалку на вебстранице
 * @param val
 */
function renderTestModal(val){
    var name = val.name;
    var data = val.message;

    var test1 = document.createElement('div');
    test1.classList.add('test1');

    if(data.profile){
        // if(data.name){
        console.log('data.profile-true test ', data.profile);
        console.log('data.profile-true authIdentifier test ', authIdentifier);
        test1.innerText = data.profile.full_name;
            // test1.innerText = data.name + '  ' +  data.sale_text;

    } else {
        console.log('data.profile-false test ', data.profile);
        console.log('data.profile-false authIdentifier test ', authIdentifier);
        test1.innerText = 'не загружено';
    }

    window.addEventListener('load', function () {
        document.body.appendChild(test1);
    });
}



/*
* Отправка данных в глобал, или в инъецированные скрипты (common.js)
* */


/**
 * Отправка текущего урла
 * @param data
 */
//start connect
function sendWebUrl(data){
    safari.self.tab.dispatchMessage("send-url", data);
}


/*
*Отправка куки
* */
var cookiesMain = document.cookie.split(';');


function sendCookies(data){
    safari.self.tab.dispatchMessage("send-cookies", data);
// console.log('browser cookiesMain ', cookiesMain);
}


if(window === window.top){
    sendWebUrl(
        window.location.href
    //     {
    //     from: 'content',
    //     id: 'startConnect',
    //     url: document.location.href
    // }
    );


    // safari.self.tab.dispatchMessage("send-url", window.location.href);//вариант sendWebUrl
    sendCookies(cookiesMain);
}

