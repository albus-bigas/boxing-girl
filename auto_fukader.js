const fs = require('fs')
const {
    Chromeless
} = require('chromeless')
const TaobaoGetter = require('./taobao.js')

const itemList = require('./' + process.argv[2])
const fileName = process.argv[2].replace( '.json', '_dist.json' )

let chromeless;
const dataJson = {};

async function run() {
    chromeless = new Chromeless({
        scrollBeforeClick: true,
        implicitWait: true
    })
    await getData(itemList,chromeless)
}

async function getData(itemList, chromeless) {
    for (let index in itemList) {
        if (itemList[index]['リンク'].indexOf('item.taobao.com') != -1) {
            dataJson[index] = await TaobaoGetter(itemList[index], chromeless)
        }
        if (itemList[index]['リンク'].indexOf('detail.tmall.com') != -1) {
            console.log('猫だよ')
        }
    }
    fs.writeFileSync(fileName,JSON.stringify(dataJson, null, '    '))
}

async function end() {
    await chromeless.end()
    console.log('end')
}

run().catch(console.error.bind(console))