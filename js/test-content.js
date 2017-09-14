/*
* Вывод в вебстраницу
* */


/*Прием данных из global (или bg). Прием в инъецированный скрипт для вывода на вебстраницу*/
function myHendler(port) {
    var messageName = port.name;
    var messageData = port.message;
    // console.log('port ', port);

    if (messageName === "global-page-sender") {
        // console.log('messageData ', messageData);

        function renderModal(){

            var test1 = document.createElement('div');
            test1.classList.add('test1');

            if(messageData.profile){
                test1.innerText = messageData.profile.full_name;
            } else {
                test1.innerText = 'не загружено';
            }


            window.addEventListener('load', function () {

                document.body.appendChild(test1);
            });

        }
        renderModal();
    }
}

if(safari.self.addEventListener) {
    safari.self.addEventListener("message", myHendler, false);
    console.log('loginData bg ', loginData);
    console.log('_getLoginData() bg ', _getLoginData());
}

/*
* Пересылка данных из вебстраницы в глобал
* */

