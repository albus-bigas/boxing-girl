const fs = require('fs')
const puppeteer = require('puppeteer')
const axios = require('axios')
const im = require('imagemagick');
const async = require('async');

const TaobaoGetter = require('./lib/taobao_getter.js')
const TmallGetter = require('./lib/tmall_getter.js')
const ImageSlicer = require('./lib/image_slicer.js')
const Setting = require('./setting/fukada.json')

const itemList = require('./regist/' + process.argv[2])
const fileName = process.argv[2].replace('.json', '_dist.json')

const ssUrl = Setting.ssUrl
const sheetName = Setting.sheetName

let browser;
const dataJson = {};

async function run() {
    // browser = await puppeteer.connect({
    //     browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/52079509-927e-467f-a0ab-783f3a832b85'
    // })
    // browser = await puppeteer.launch({
    //     headless: true,
    //     // executablePath: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    //     slowMo: 0, // 遅延時間
    //     args: ['--no-sandbox', '--use-gl=swiftshader', '--disable-gpu']
    // });
    // await getData(itemList, browser)
    // await end(browser)
    // await postData()
    for (let index in itemList) {
        await ImageSlicer(itemList[index]['独自商品ID'])
        await console.log('end', itemList[index]['独自商品ID'])
    }
    process.exit()
}

async function getData(itemList, browser) {
    console.log('start')
    for (let index in itemList) {
        const page = await browser.newPage()
        page._networkManager.setMaxListeners(100);
        page._frameManager.setMaxListeners(100);
        await page.setViewport({
            width: 1280,
            height: 1080
        })
        await new Promise(async (resolve) => {
            if (itemList[index]['リンク'].indexOf('item.taobao.com') != -1) {
                dataJson[index] = await TaobaoGetter(itemList[index], page)
            }
            if (itemList[index]['リンク'].indexOf('detail.tmall.com') != -1) {
                dataJson[index] = await TmallGetter(itemList[index], page)
            }
            resolve();
        })
    }
}

async function end(browser) {
    await browser.close();
}

async function postData() {
    await new Promise((resolve) => {
        async.retry({
            times: 5,
            interval: 1000,
            errorFilter: (err) => {
                console.log(err)
                return true
            }
        },async () => {
            const response = await axios({
                method: 'POST',
                port: '443',
                url: ssUrl + `?action=writeData&sheetName=${sheetName}`,
                data: dataJson
            })
            return response
        }, (err, response) => {
            if (err) {
                console.error('postData failed', )
                console.error(err)
                resolve();
            }
            if (response) {
                fs.writeFileSync('dist/' + fileName, JSON.stringify(response.data.res_data, null, '    '))
                console.log('\u001b[33m' + response.data.musume + '\u001b[0m')
                resolve();
            }
        })
    })
}

run().catch(console.error.bind(console))