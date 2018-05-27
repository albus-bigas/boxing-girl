const { Chromeless } = require('chromeless')
const html2canvas = require('html2canvas')

let chromeless;
let dataJson;

async function run() {
    chromeless = new Chromeless({
        scrollBeforeClick: true,
        implicitWait: true
    })
}
async function getData() {
    console.log('start')
    dataJson = await chromeless
        .goto('https://item.taobao.com/item.htm?id=565039294076')
        .wait('.tb-rmb-num')
        .evaluate((html2canvas) => {
            const data = {}
            const doc = document
            data.name = doc.querySelector('.tb-main-title').getAttribute('data-title');
            let dom = doc.querySelectorAll('.tb-rmb-num');
            data.price1 = dom[0].innerText;
            data.price2 = dom[1].innerText;
            // date.color = doc.querySelector(".attributes-list").querySelectorAll("title");
            const AttributesList = doc.querySelector(".attributes-list").querySelectorAll("li");
            const AttributesArray = [];
            for (let i = 0; i < AttributesList.length; i++) {
                AttributesArray.push(AttributesList[i].innerText);
            }
            for (let i = 0; i < AttributesArray.length; i++) {
                if (AttributesArray[i].indexOf("颜色") != -1) {
                    data.color = AttributesArray[i]
                }
            }
            return data;
        })
    console.log(dataJson)
}
async function screenshot() {
    const photo = await chromeless.scrollToElement('#description').screenshot("#description")
    console.log(photo)
}

async function end() {
    await chromeless.end()
    console.log('end')
}

run().then(getData()).catch(console.error.bind(console))