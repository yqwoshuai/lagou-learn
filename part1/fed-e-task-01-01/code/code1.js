/*
  将下面异步代码使用 Promise 的方法改进
  尽量用看上去像同步代码的方式
  setTimeout(function () {
    var a = 'hello'
    setTimeout(function () {
      var b = 'lagou'
      setTimeout(function () {
        var c = 'I ♥ U'
        console.log(a + b +c)
      }, 10)
    }, 10)
  }, 10)
*/

new Promise((resolve, reject) => {
  setTimeout(function () {
    var a = "hello";
    resolve(a);
  }, 10);
})
  .then((value) => {
    return new Promise((resolve) => {
      setTimeout(function () {
        var b = "lagou";
        resolve(value + b);
      }, 10);
    });
  })
  .then((value) => {
    setTimeout(function () {
      var c = "I ♥ U";
      console.log(value + c);
    }, 10);
  });
