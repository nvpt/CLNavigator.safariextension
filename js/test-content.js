/*
* Прием данных из глобал
* Вывод в вебстраницу
* */

function webHandler(message) {
    var messageName = message.name;
    var messageData = message.message;

    //прием
    if (messageName === "login-data-send") {
        renderTestModal(message);
    }
}
safari.self.addEventListener("message", webHandler, false);



function renderTestModal(val){
    var name = val.name;
    var data = val.message;

    var test1 = document.createElement('div');
    test1.classList.add('test1');

    if(data.profile){
        test1.innerText = data.profile.full_name;
    } else {
        test1.innerText = 'не загружено';
    }

    window.addEventListener('load', function () {
        document.body.appendChild(test1);
    });
}

/*
* Отправка данных в глобал
* */
function sendWebUrl(data){
    safari.self.tab.dispatchMessage("send-url", data);
    // safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("send-url", data);
}
if(window === window.top){
    sendWebUrl(window.location.href);
}


