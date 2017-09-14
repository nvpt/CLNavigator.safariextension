console.log('загрузка testing');

// alert('test!!!');
// console.log('test0');
//
//
//
//
// function myHendler(port) {
//     var messageName = port.name;
//     var messageData = port.message;
//     console.log('test1');
//     console.log('port ', port);
//     console.log('test1');
//
//     if (messageName === "mysender") {
//         console.log('messageData ', messageData)
//     }
// }
// console.log('test2');
// if(safari.self.addEventListener) {
//     safari.self.addEventListener("message", myHendler, false);
//     console.log('test3');
// }
//

// document.addEventListener('DOMContentLoaded', function () {
//
//     var bg = safari.extension.globalPage.contentWindow;
//
//     console.log('bg.loginData html testing ', bg.loginData);
//     console.log('bg._getLoginData() testing ', bg._getLoginData());
//
// });

/*Прием данных из bg. Прием в инъецированный скрипт*/
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
