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
    browser = await puppeteer.launch({
        headless: true,
        // executablePath: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        slowMo: 0, // 遅延時間
        args: ['--no-sandbox', '--use-gl=swiftshader', '--disable-gpu']
    });
    await getData(itemList, browser)
    await end(browser)
    await postData()
    for (let index in itemList) {
        await ImageSlicer(itemList[index]['独自商品ID'])
        await console.log('end', itemList[index]['独自商品ID'])
    }
    process.exit()
}

async function getData(itemList, browser) {
    console.log('start')
    //ぶち殺すやつ書き途中
    // const loginPage = await browser.newPage()
    // await loginPage.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36")
    // await loginPage.setViewport({
    //     width: 1280,
    //     height: 1080
    // })
    // await loginPage.goto('https://www.taobao.com/', {
    //     waitUntil: 'networkidle2',
    //     timeout: 3000
    // }).catch(() => {})
    // const frames = await loginPage.frames()
    // for (let i = 0; i < frames.length; i++)console.log(frames[i].name())
    // const frame = await loginPage.frames().find(f => f.name() === 'login-iframe')
    // await frame.type('#TPL_username_1', 'albus1997')
    // await frame.type('#TPL_password_1', '1991Albust')
    // await loginPage.waitFor(500000)
    // await frame.click('#J_SubmitStatic')
    // await frame.type('#TPL_password_1', '1991Albust')
    // const dragArea = await frame.$('#nc_1_n1z')
    //     const {
    //         width,
    //         height,
    //         left: x,
    //         top: y
    //     } = dragDom.getBoundingClientRect()
    //     return {
    //         width: width,
    //         height: height,
    //         x: x,
    //         y: y
    //     };
    // })
    // await frame.click('#J_SubmitStatic')

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