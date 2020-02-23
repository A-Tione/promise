class Promise2 {
    state = 'pending'
    callbacks= []

    resolve(result) {
        setTimeout(()=>{
            if (this.state !=='pending') return
            this.state = 'fulfilled'
            this.callbacks.forEach((handle)=>{
                if (typeof handle[0] === "function") {
                    handle[0].call(undefined, result)
                }
            })
        },0)
    }

    reject(reason) {
        setTimeout(()=>{
            if (this.state !== 'pending') return
            this.state = 'rejected'
            this.callbacks.forEach((handle)=>{
                if (typeof handle[1] === "function") {
                    handle[1].call(undefined, reason)
                }
            })
        },0)
    }

    constructor(fn) {
        if (typeof fn !== "function") {
            throw new Error('我只接受一个函数')
        }
        fn(this.resolve.bind(this), this.reject.bind(this))
    }

    then(succeed?, fail?) {
        const handle = [];// 成功与失败的处理器
        if (typeof succeed === "function") {
            handle[0] = succeed
        }
        if (typeof fail === "function") {
            handle[1] = fail
        }
        this.callbacks.push(handle)
        //then后面需要return一个promise，后续补充
        return undefined
    }
}


export default Promise2