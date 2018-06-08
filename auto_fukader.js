const fs = require('fs')
const {
    Chromeless
} = require('chromeless')
const axios = require('axios')
var events = require('events');

const TaobaoGetter = require('./lib/taobao_getter.js')
const TmallGetter = require('./lib/tmall_getter.js')

const itemList = require('./regist/' + process.argv[2])
const fileName = process.argv[2].replace('.json', '_dist.json')

const ssUrl = "https://script.google.com/macros/s/AKfycbyk_zhAydAohrcLVlvItjRY_KtBKPabl3zqpqCa4kHJ_RM9K-wL/exec"
const sheetName = 'dist_data'


let chromeless;
const dataJson = {};

async function run() {
    chromeless = new Chromeless({
        scrollBeforeClick: true,
        implicitWait: true,
        waitTimeout:50000
    })
    await getData(itemList, chromeless)
    await end();
}

async function getData(itemList, chromeless) {
    console.log('start')
    for (let index in itemList) {
        if (itemList[index]['リンク'].indexOf('item.taobao.com') != -1) {
            dataJson[index] = await TaobaoGetter(itemList[index], chromeless)
        }
        if (itemList[index]['リンク'].indexOf('detail.tmall.com') != -1) {
            dataJson[index] = await TmallGetter(itemList[index], chromeless)
        }
    }
    
    axios({
        method: 'POST',
        url: ssUrl + `?action=writeData&sheetName=${sheetName}`,
        data: dataJson
    }).then(response => {
        fs.writeFileSync('dist/' + fileName, JSON.stringify(response.data.res_data, null, '    '))
        console.log('\u001b[33m' + response.data.musume + '\u001b[0m')
    });
}

async function end() {
    await chromeless.end()
    console.log('end')
}

run().catch(console.error.bind(console))