console.log('--test-content--');
if(window === window.top){
function webHandler(message) {
    var messageName = message.name;
    var messageData = message.message;


    if (messageName === "partner-data-send") {
        renderTestModal(message);
    }
}
safari.self.addEventListener("message", webHandler, false);


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




function sendWebUrl(data){
    safari.self.tab.dispatchMessage("send-url", data);
}


var cookiesMain = document.cookie.split(';');

function sendCookies(data){
    safari.self.tab.dispatchMessage("send-cookies", data);
}


    sendWebUrl(
        window.location.href
    );


    sendCookies(cookiesMain);
}

