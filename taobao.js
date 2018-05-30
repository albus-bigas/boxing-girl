const {
    Chromeless
} = require('chromeless')
// const html2canvas = require('html2canvas')

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
        .evaluate(() => {
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
            const cdn = doc.createElement("script");
            cdn.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.js';
            doc.body.appendChild(cdn);

            const script = doc.createElement("script");
            script.innerHTML = "function createImage(dom){\
                html2canvas(dom, {\
                    dpi: 144,\
                    useCORS: true,\
                    taintTest: false,\
                    onrendered: function (canvas) {\
                        var a = document.createElement('a');\
                        a.href = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');\
                        a.download = 'somefilename.jpg';\
                        a.click();\
                    }});\
            };"
            doc.body.appendChild(script);
            return data;
        })
    console.log(dataJson)
}
async function screenshot() {
    await chromeless.evaluate(()=>{
        const dom = document.querySelector('#description');
        createImage(dom);
    })
}

async function end() {
    await chromeless.end()
    console.log('end')
}

run().then(getData()).then(screenshot()).catch(console.error.bind(console))