const TaobaoGetter = require('./taobao.js')
const {
    Chromeless
} = require('chromeless')

const itemList = process.argv[1]

let chromeless;
const dataJson = {};

async function run() {
    chromeless = new Chromeless({
        scrollBeforeClick: true,
        implicitWait: true
    })
    await console.log('test')
    await getData(chromeless)
}

async function getData(itemList, chromeless) {
    for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].indexOf('item.taobao.com')) {
            dataJson.push(await TaobaoGetter(url, chromeless))
        }
        if (itemList[i].indexOf('detail.tmall.com')) {
            console.log('猫だよ')
        }
        console.log(dataJson)
    }
}

async function end() {
    await chromeless.end()
    console.log('end')
}

run().catch(console.error.bind(console))