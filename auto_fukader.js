const fs = require('fs')
const puppeteer = require('puppeteer')
const axios = require('axios')
const im = require('imagemagick');

const TaobaoGetter = require('./lib/taobao_getter.js')
const TmallGetter = require('./lib/tmall_getter.js')
const ImageSlicer = require('./lib/image_slicer.js')
const Setting = require('./setting/fukada.json')

const itemList = require('./regist/' + process.argv[2])
const fileName = process.argv[2].replace('.json', '_dist.json')

const ssUrl = Setting.ssUrl
const sheetName = Setting.sheetName

let browser;
let page;
const dataJson = {};

async function run() {
    browser = await puppeteer.launch({
        headless: false,
        slowMo: 0, // 遅延時間
        args: ['--no-sandbox','--use-gl=swiftshader', '--disable-gpu', '--headless']
    });
    page = await browser.newPage()
    await page.setViewport({width: 1280, height: 1080})
    await getData(itemList, page)
    await end()
    postData()
}

async function getData(itemList, page) {
    console.log('start')
    for (let index in itemList) {
        if (itemList[index]['リンク'].indexOf('item.taobao.com') != -1) {
            dataJson[index] = await TaobaoGetter(itemList[index], page)
        }
        if (itemList[index]['リンク'].indexOf('detail.tmall.com') != -1) {
            dataJson[index] = await TmallGetter(itemList[index], page)
        }
        ImageSlicer(itemList[index]['独自商品ID'])
    }
}

async function end() {
    await browser.close();
    console.log('end')
}

function postData() {
    axios({
        method: 'POST',
        port: '443',
        url: ssUrl + `?action=writeData&sheetName=${sheetName}`,
        data: dataJson
    }).then(response => {
        fs.writeFileSync('dist/' + fileName, JSON.stringify(response.data.res_data, null, '    '))
        console.log('\u001b[33m' + response.data.musume + '\u001b[0m')
    });
}

run().catch(console.error.bind(console))