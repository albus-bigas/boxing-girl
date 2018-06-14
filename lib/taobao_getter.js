const im = require('imagemagick');

module.exports = async function TaobaoGetter(json, page) {
    await page.goto(json["リンク"], {
        waitUntil: 'networkidle2'
    })
    await page.waitFor('.tb-rmb-num')
    await page.waitFor(1000)
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
            if (dom[0].innerText != null) data.price1 = dom[0].innerText;
            if (dom[1].innerText != null) data.price2 = dom[1].innerText;
            dom = doc.querySelector('#J_WlServiceTitle');
            if (dom.innerText.indexOf('¥') == -1) {
                data.shipping = 0;
            } else {
                index = dom.innerText.indexOf('¥') + 1;
                data.shipping = dom.innerText.slice(index);
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

            // for (let i = 0; i < AttributesArray.length; i++) {
            //     if (AttributesArray[i].indexOf("对象") != -1) {
            //         data.Target = AttributesArray[i]
            //     }
            // }
            // for (let i = 0; i < AttributesArray.length; i++) {
            //     if (AttributesArray[i].indexOf("对象") != -1) {
            //         data.Target = AttributesArray[i]
            //     }
            // }

        },
        json)
    const clip = await page.evaluate(() => {
        const detailDom = document.querySelector('#description');
        const {
            width,
            height,
            left: left,
            top: top
        } = detailDom.getBoundingClientRect()
        return {
            width: width,
            height: height,
            left: left,
            top: top
        };
    })
    await scrollToBottom(page, 1080)
    console.log(clip)
    await page.screenshot({
        path: __dirname + '/../img/test.png',
        fullPage: true,
        // clip: clip,
        omitBackground: false
    })
    await cropImage(__dirname + '/../img/test.png', clip)
    // await im.convert([__dirname + '/../img/test.png', '-crop', `${clip.width}x${clip.height}+${clip.left}+${clip.top}`, '../img/output.png'])
    // const imagePath = await page.screenshot('body', {
    //     filePath: __dirname + `/../img/${json['独自商品ID']}.png`
    // });
    return dataJson;
}

async function cropImage(path, data) {
    im.convert([path, '-crop', `${data.width}x${data.height}+${data.left}+${data.top}`, __dirname + '../img/output.png'],
    function(err, stdout){
        if (err) throw err;
        console.log('stdout:', stdout);
        });
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
                timeout: 1000
            })
            .catch(e => console.log('timeout exceed. proceed to next operation'));

        currentPosition = nextPosition;
        // console.log(`scrollNumber: ${scrollNumber}`)
        // console.log(`currentPosition: ${currentPosition}`)

        // 2
        scrollHeight = await page.evaluate(getScrollHeight)
        // console.log(`ScrollHeight ${scrollHeight}`)
    }
}