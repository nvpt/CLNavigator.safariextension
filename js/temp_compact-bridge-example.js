/*
* Мост связи с веб
* */
// function globalBridge(message) {
//     var messageName = message.name;
//     var messageData = message.message;
//
//     //<<прием
//     if (messageName === "send-url") {
//
//         receiveWebUrl(message);//тестовое
//
//         // console.log('web-url bg ', message.message);
//
//         var contentUrl = message.message;
//         var clearUrl = getClearUrl(contentUrl);
//         // console.log('partnersData ', partnersData);
//         // console.log('clearUrl ', clearUrl);
//         // console.log('partnersData[clearUrl]', partnersData[clearUrl]);
//
//         if (partnersData[clearUrl]) {
//             var partner = partnersData[clearUrl];
//             // console.log(partner);
//             //>>отправка
//             // sendPartnerDataForModal(partner);
//             safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("partner-data-send",
//                 {
//                 partner: partner
//                 });
//
//         }
//
//     }
//
//     //<<прием
//     // if (messageName === "send-cookies") {
//     //     return function(message){
//     //         console.log('setCookies bg ', message);
//     //     }
//     // }
//
//
//
//     //>>отправка
//     sendLoginData(_getLoginData());
//
// }
// safari.application.addEventListener("message", globalBridge, false);


/*
* Методы обработки принимаемых данных из веба
* */
// function receiveWebUrl(val) {
//     var name = val.name;
//     var data = val.message;
//
//     // console.log('web-url bg ', data);
// }


/**
 * Методы отправки данных в веб
 */
// function sendLoginData(data){
//     // console.log('sendLoginData bg ', data);
//     if(data){
//     safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("login-data-send", data);
//     }
// }

// function sendPartnerDataForModal(data){
//     safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("partner-data-send", data);
// }