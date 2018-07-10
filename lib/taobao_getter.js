const async = require('async');

module.exports = async function TaobaoGetter(json, page) {
    return new Promise(async (resolve) => {
    await async.retry({
        times: 5,
        interval: 1000
    }, async function (callback) {
        await page.goto(json["リンク"], {
                waitUntil: 'networkidle2',
                timeout: 3000
            })
            .catch(e => {});
        await page.waitFor('.tb-rmb-num')
        await page.waitFor(1000)
        await scrollToBottom(page, 1080)
        await page.evaluate(function () {
            return Promise.resolve(window.scrollTo(0, 0))
        })
        const dataJson = await page.evaluate((json) => {
                const data = {}
                const doc = document
                data.defaultName = doc.querySelector('.tb-main-title').getAttribute('data-title');
                if (json['商品名']) {
                    data.name = json['商品名'];
                }
                if (json['独自商品ID']) {
                    data.id = json['独自商品ID'];
                }
                if (json['注意点']) {
                    data.attention = json['注意点'];
                }
                data.url = json["リンク"]

                let dom = doc.querySelectorAll('.tb-rmb-num');
                let index;
                if (dom[0] && dom[0].innerText != null) data.price1 = dom[0].innerText;
                if (dom[1] && dom[1].innerText != null) data.price2 = dom[1].innerText;
                dom = doc.querySelector('#J_WlServiceTitle');
                if (dom) {
                    if (dom.innerText.indexOf('¥') == -1) {
                        data.shipping = 0;
                    } else {
                        index = dom.innerText.indexOf('¥') + 1;
                        data.shipping = dom.innerText.slice(index);
                    }
                }
                const AttributesList = doc.querySelector(".attributes-list").querySelectorAll("li");
                const AttributesArray = [];
                for (let i = 0; i < AttributesList.length; i++) {
                    if (AttributesList[i].innerText != null)
                        AttributesArray.push(AttributesList[i].innerText);
                }
                for (let i = 0; i < AttributesArray.length; i++) {
                    if (AttributesArray[i].indexOf("颜色") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.color = AttributesArray[i].slice(index).split(" ");
                    }
                    if (AttributesArray[i].indexOf("季节") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.season = AttributesArray[i].slice(index).split(" ");
                    }
                    if (AttributesArray[i].indexOf("领型") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.neckTipe = AttributesArray[i].slice(index)
                    }
                    if (AttributesArray[i].indexOf("材质成分") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.material = AttributesArray[i].slice(index)
                    }
                    if (AttributesArray[i].indexOf("对象") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.target = AttributesArray[i].slice(index)
                    }
                    if (AttributesArray[i].indexOf("厚薄") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.thick = AttributesArray[i].slice(index)
                    }
                    if (AttributesArray[i].indexOf("基础风格") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.style = AttributesArray[i].slice(index)
                    }
                    if (AttributesArray[i].indexOf("版型:") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.bodyStyle = AttributesArray[i].slice(index)
                    }
                    if (AttributesArray[i].indexOf("款式版型") != -1) {
                        index = AttributesArray[i].indexOf(':') + 2;
                        data.bodyStyle2 = AttributesArray[i].slice(index)
                    }
                }
                return data;
            },
            json)
        const clip = await page.evaluate(() => {
            const detailDom = document.querySelector('#description');
            const {
                width,
                height,
                left: x,
                top: y
            } = detailDom.getBoundingClientRect()
            return {
                width: width,
                height: height,
                x: x,
                y: y
            };
        })
        await page.screenshot({
            path: __dirname + `/../img/${json['独自商品ID']}.png`,
            clip: clip,
            omitBackground: false
        })
        return [json['独自商品ID'] + ' success', dataJson];
    }, async function (err, result) {
        if (err) {
            console.error(json['独自商品ID'] + 'failed',)
            console.error(err)
            await page.close();
            resolve();
        }
        if (result) {
            console.log(result[0])
            await page.close();
            resolve(result[1]);
        }
        });
    })
}

async function scrollToBottom(page, viewportHeight) {
    const getScrollHeight = () => {
        return Promise.resolve(document.documentElement.scrollHeight)
    }

    let scrollHeight = await page.evaluate(getScrollHeight)
    let currentPosition = 0
    let scrollNumber = 0

    while (currentPosition < scrollHeight) {
        scrollNumber += 1
        const nextPosition = scrollNumber * viewportHeight
        await page.evaluate(function (scrollTo) {
            return Promise.resolve(window.scrollTo(0, scrollTo))
        }, nextPosition)
        await page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: 3000
        })
            .catch(e => {});

        currentPosition = nextPosition;
        // console.log(`scrollNumber: ${scrollNumber}`)
        // console.log(`currentPosition: ${currentPosition}`)

        // 2
        scrollHeight = await page.evaluate(getScrollHeight)
        // console.log(`ScrollHeight ${scrollHeight}`)
    }
}