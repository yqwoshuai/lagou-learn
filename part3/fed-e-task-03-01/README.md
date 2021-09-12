## 一、简答题

### 1、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如何把新增成员设置成响应式数据，它的内部原理是什么

```js
let vm = new Vue({
 el: '#el'
 data: {
  o: 'object',
  dog: {}
 },
 method: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})
```

按钮的时候动态给 data 增加的成员不是响应式的，可以通过Vue.set或者Vue.$set方法新增响应式的属性。他的内部调用了Object.defineProperty给新增的属性添加了get和set，将其转为了响应式属性。

### 2、请简述 Diff 算法的执行过程

1. 判断新旧节点是否相同，通过key相等且sel相等；

2. 新节点有text属性的情况（即新节点为文本节点）：如果老节点有children属性，则移除老节点的子节点，再将老节点的textContent设置为新节点的text；

3. 新节点没有text属性的情况（即新节点为元素节点）：
    1. 新旧节点都有子节点： diff两者子节点

    2. 新节点有子节点，老节点为text: 清空老节点的textContent，调用addVnodes添加子节点

    3. 新节点为text，老节点有子节点：调用removeVnodes移除老节点的子节点，设置textContent为新节点的text

## 二、编程题

### 1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 # 后面的内容作为路由的地址，可以通过 hashchange 事件监听路由地址的变化。

[源码地址](https://yqwoshuai.github.io/note/fe-learn/3.html)

### 2、在模拟 Vue.js 响应式源码的基础上实现 v-html 指令，以及 v-on 指令。

[源码地址](https://github.com/yqwoshuai/myVue/blob/master/js/compiler.js#L66)

### 3、参考 Snabbdom 提供的电影列表的示例，利用Snabbdom 实现类似的效果，如图：

<img src="images/Ciqc1F7zUZ-AWP5NAAN0Z_t_hDY449.png" alt="Ciqc1F7zUZ-AWP5NAAN0Z_t_hDY449" style="zoom:50%;" />

[官方案例](https://github.com/yqwoshuai/snabbdom-demo/blob/master/snabbdom.js)