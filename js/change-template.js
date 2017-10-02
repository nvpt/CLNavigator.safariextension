/*CONTENT*/

window.addEventListener("message", function (port) {//глобально для всех
    var msg = port.data;

    //прием было
    if (msg.from === 'bg') {//ответы из bg
        //...
    }

    //отправка было
    window.postMessage({
        from: 'content',
        id: 'startConnect',
        url: document.location.href
    }, '*');

});


safari.self.addEventListener("message", function(msg) {//глобально для всех
    var messageName = msg.name;
    var messageData = msg.message;

    //прием стало
    if (messageName === "partner-data-send") {

    }

    //отправка стало
    safari.self.tab.dispatchMessage("send-url", {
        from: 'send-url',//не исп. вместо этого первый параметр
        id: 'startConnect',
        url: window.location.href
    })

}, false);


/*BG*/

window.addEventListener("message", function (port) {//глобально для всех
    var msg = port.message;
    //прием было
    if (msg.from === 'content') {
        //...
    }

    //отправка было
    window.postMessage({
        from: 'bg',
        id: 'showModal',
        currentPartner: partner,
        timers: timers,
        modalMarkers: modalMarkers,
        loginData: _getLoginData()
    }, '*');

});

safari.application.addEventListener("message", function(msg){

    //прием стало
    var messageName = msg.name;
    var messageData = msg.message;

    if (messageName === "send-url") {
        ///...
    }


    // отправка стало
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("partner-data-send",
        {
            partner: partner
        });


}, false);
