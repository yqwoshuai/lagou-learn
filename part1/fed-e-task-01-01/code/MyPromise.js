/*
尽可能还原 Promise 中的每一个 API, 并通过注释的方式描述思路和原理.
*/

// promise状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

// 对回调的返回值进行处理
function resolvePromise(promise, value, resolve, reject) {
  // 返回原来promise时，出现循环调用，报错
  if (promise === value) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }
  if (value instanceof MyPromise) {
    // 回调值为promise时定义成功回调
    value.then(resolve, reject);
  } else {
    // 回调值为普通值时直接执行成功回调
    resolve(value);
  }
}

class MyPromise {
  // 使用try catch，在执行器函数报错时也能捕获错误并reject
  constructor(executor) {
    try {
      executor(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }

  // 初始状态
  status = PENDING;
  // resolve 值
  value = undefined;
  // reject 原因
  reason = undefined;
  // then 方法成功回调
  successCb = [];
  // then 方法失败回调
  failCb = [];

  // 成功回调
  resolve = (value) => {
    // 只有pending状态可以修改
    if (this.status !== PENDING) return;
    // 储存回调值，修改状态，执行成功回调函数
    this.value = value;
    this.status = FULFILLED;
    while (this.successCb.length) {
      this.successCb.shift()();
    }
  };
  // 失败回调
  reject = (reason) => {
    // 只有pending状态可以修改
    if (this.status !== PENDING) return;
    // 储存失败原因，修改状态，执行失败回调函数
    this.reason = reason;
    this.status = REJECTED;
    while (this.failCb.length) {
      this.failCb.shift()();
    }
  };
  // 定义回调
  then(successCb, failCb) {
    // 将 successCb 和 failCb 格式化为函数
    successCb = successCb ? successCb : (value) => value;
    failCb = failCb
      ? failCb
      : (reason) => {
          throw reason;
        };
    // 生成新 promise 用于返回
    const promise = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 处理 FULFILLED 状态，执行成功回调，因为需要 用到 promise 变量，所以用 setTimeout 0 包一层异步调用
        setTimeout(() => {
          // try catch 执行，方便捕获成功回调的错误
          try {
            let returnValue = successCb(this.value);
            resolvePromise(promise, returnValue, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        // try catch 执行，方便捕获失败回调的错误
        setTimeout(() => {
          try {
            let returnValue = failCb(this.reason);
            resolvePromise(promise, returnValue, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        // 异步的情况下，状态会是pending，先把回调函数储存起来，等待状态变化后再执行回调
        this.successCb.push(() => {
          setTimeout(() => {
            try {
              let returnValue = successCb(this.value);
              resolvePromise(promise, returnValue, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.failCb.push(() => {
          setTimeout(() => {
            try {
              let returnValue = failCb(this.reason);
              resolvePromise(promise, returnValue, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    // 返回生成的 promise
    return promise;
  }
  finally(cb) {
    // 成功或者失败的情况下都会执行finally，并返回一个promise，给后续链式调用
    return this.then(
      (value) => {
        return MyPromise.resolve(cb()).then(() => value);
      },
      (reason) => {
        return MyPromise.resolve(cb()).then(() => {
          throw reason;
        });
      }
    );
  }
  // 捕获reject错误
  catch(cb) {
    return this.then(undefined, cb);
  }
  static all(array) {
    const result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      // 添加结果进数组，全部添加完成之后resolve最终结果
      function addData(key, value) {
        result[key] = value;
        index++;
        if (index === array.length) {
          resolve(result);
        }
      }
      // 给数组中的每个值都添加then回调，有一个失败就reject
      for (let i = 0; i < array.length; i++) {
        const current = array[i];
        if (current instanceof MyPromise) {
          current.then(
            (value) => addData(i, value),
            (reason) => reject(reason)
          );
        } else {
          addData(i, array[i]);
        }
      }
    });
  }
  // 静态resolve方法将传入的值包装成一个promise
  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }
  // 静态rece方法将返回数组中首个resolve或者reject的结果
  static race(array) {
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < array.length; i++) {
        const current = array[i];
        if (current instanceof MyPromise) {
          current.then(
            (value) => resolve(value),
            (reason) => reject(reason)
          );
        } else {
          resolve(current);
        }
      }
    });
  }
}
