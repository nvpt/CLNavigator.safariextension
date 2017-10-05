console.log('--test-content--');
if(window === window.top){
/*
* Прием данных из глобал
* */
function webHandler(message) {
    var messageName = message.name;
    var messageData = message.message;

    //<<прием
    // if (messageName === "login-data-send") {
    //     renderTestModal(message);
    // }

    //<<прием
    if (messageName === "partner-data-send") {
        // console.log('PARTNER-DATA-SEND');
        renderTestModal(message);
    }
}
safari.self.addEventListener("message", webHandler, false);


/**
 * Вывод принятых данных в модалку на вебстранице
 * @param val
 */
function renderTestModal(val){
    var name = val.name;
    var data = val.message.partner;

    var test1 = document.createElement('div');
    test1.classList.add('test1');

    if(data.name){
        test1.innerText = data.name + '  ' +  data.sale_text;
    } else {
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


    //>>отправка
    sendWebUrl(
        window.location.href
    //     {
    //     from: 'content',
    //     id: 'startConnect',
    //     url: document.location.href
    // }
    );
    // safari.self.tab.dispatchMessage("send-url", window.location.href);//вариант sendWebUrl


    //>>отправка
    sendCookies(cookiesMain);
}

