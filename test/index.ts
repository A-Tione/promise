import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
chai.use(sinonChai)

const assert = chai.assert
import Promise from '../src/index'

describe('Promise', ()=> {
    it('是一个类', () => {
        assert.isFunction(Promise)
        assert.isObject(Promise.prototype)
    });
    it('new Promise() 如果不接受一个函数就报错', () => {
        // assert.throw(fn)的用法：期待报错
        assert.throw(()=> {
            // @ts-ignore
            new Promise()
        })
        assert.throw(()=> {
            // @ts-ignore
            new Promise(1)
        })
        assert.throw(()=> {
            // @ts-ignore
            new Promise(true)
        })
    });
    it('new Promise(fn) 会生成一个对象，对象有then方法', () => {
        const promise = new Promise(()=> {})
        assert.isFunction(promise.then)
    });
    it('new Promise(fn) 中的 fn 立即执行', () => {
        let fn = sinon.fake()
        new Promise(fn)
        assert(fn.called)
    });
    it('new Promise(fn) 中的fn执行时接收resolve和reject两个函数', () => {
        new Promise((resolve, reject)=>{
            assert.isFunction(resolve)
            assert.isFunction(reject)
        })
    });
    it('promise.then(success) 中的 success 会在 resolve 被调用的时候执行', (done) => {
        const fn = sinon.fake()
        const promise = new Promise((resolve, reject)=>{
            assert.isFalse(fn.called)
            resolve()
            setTimeout(()=>{
                assert.isTrue(fn.called)
                done()
            },0)
        })
        // @ts-ignore
        promise.then(fn)
    });
    it('promise.then(null, fail) 中的 fail 会在 reject 被调用的时候执行', (done) => {
        const fn = sinon.fake()
        const promise = new Promise((resolve, reject)=>{
            assert.isFalse(fn.called)
            reject()
            setTimeout(()=>{
                assert.isTrue(fn.called)
                done()
            },0)
        })
        // @ts-ignore
        promise.then(null, fn)
    });
    it('2.2.1 then的两个参数：onFulfilled和onRejected都是可选参数', () => {
        const promise = new Promise(resolve=> {
            resolve()
        })
        promise.then(false, null)
        assert(1 === 1)
    });
    it('2.2.2 如果onFulfilled是函数', (done) => {
        const succeed = sinon.fake()
        const promise = new Promise(resolve=>{
            assert.isFalse(succeed.called)
            resolve(789);
            resolve(999)
            setTimeout(()=>{
                assert(promise.state === 'fulfilled')
                assert.isTrue(succeed.calledOnce)// 期待函数传值不会超过一次
                assert(succeed.calledWith(789))// 期待succeed被called的时候resolve传了一个参数
                done()
            }, 0)
        })
        promise.then(succeed)
    });
    it('2.2.3 如果onRejected是函数', (done) => {
        const fail = sinon.fake()
        const promise = new Promise((resolve, reject)=>{
            assert.isFalse(fail.called)
            reject(789);
            reject(999)
            setTimeout(()=>{
                assert(promise.state === 'rejected')
                assert.isTrue(fail.calledOnce)// 期待函数传值不会超过一次
                assert(fail.calledWith(789))// 期待fn被called的时候resolve传了一个参数
                done()
            }, 0)
        })
        promise.then(null, fail)
    });
    it('2.2.4 在我的代码执行完前，不得调用then后面的两个函数', (done) => {
        const fn = sinon.fake()
        const promise = new Promise((resolve, reject)=>{
          resolve()
        })
        promise.then(fn)
        assert.isFalse(fn.called)// 在执行完fn.called后才调用then后面的函数
        setTimeout(()=>{
            assert.isTrue(fn.called)
            done()
        }, 0)
    });
    it('2.2.4 失败回调', (done) => {
        const fn = sinon.fake()
        const promise = new Promise((resolve, reject)=>{
            reject()
        })
        promise.then(null, fn)
        assert.isFalse(fn.called)// 在执行完fn.called后才调用then后面的函数
        setTimeout(()=>{
            assert.isTrue(fn.called)
            done()
        }, 0)
    });
    it('2.2.5 期待this上下文环境被promise传递', () => {
        const promise = new Promise((resolve, reject)=>{
            resolve()
        })
        promise.then(function () {
            'use strict'
            assert(this === undefined)
        })
    });
    it('2.2.6 then可以在同一个promise里被调用多次(成功)', (done) => {
        const promise = new Promise((resolve, reject)=>{
            resolve()
        })
        const callBacks = [sinon.fake(), sinon.fake(), sinon.fake()]
        promise.then(callBacks[0])
        promise.then(callBacks[1])
        promise.then(callBacks[2])
        setTimeout(()=>{
            assert(callBacks[0].called)
            assert(callBacks[1].called)
            assert(callBacks[2].called)
            assert(callBacks[1].calledAfter(callBacks[0]))// 期待函数[1]在函数[0]之后调用
            assert(callBacks[2].calledAfter(callBacks[1]))// 期待函数[2]在函数[1]之后调用
            done()
        }, 0)
    });
    it('2.2.6.2 then可以在同一个promise里被调用多次(失败)', (done) => {
        const promise = new Promise((resolve, reject)=>{
            reject()
        })
        const callBacks = [sinon.fake(), sinon.fake(), sinon.fake()]
        promise.then(null, callBacks[0])
        promise.then(null, callBacks[1])
        promise.then(null, callBacks[2])
        setTimeout(()=>{
            assert(callBacks[0].called)
            assert(callBacks[1].called)
            assert(callBacks[2].called)
            assert(callBacks[1].calledAfter(callBacks[0]))// 期待函数[1]在函数[0]之后调用
            assert(callBacks[2].calledAfter(callBacks[1]))// 期待函数[2]在函数[1]之后调用
            done()
        }, 0)

    });
})