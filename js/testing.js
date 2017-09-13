// alert('test!!!');
console.log('test0');




function myHendler(port) {
    var messageName = port.name;
    var messageData = port.message;
    console.log('test1');
    console.log('port ', port);
    console.log('test1');

    if (messageName === "mysender") {
        console.log('messageData ', messageData)
    }
}
console.log('test2');
if(safari.self.addEventListener) {
    safari.self.addEventListener("message", myHendler, false);
    console.log('test3');
}

