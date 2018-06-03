module.exports = async function TaobaoGetter(json, chromeless) {
    console.log('taobao_getter start')
    const dataJson = await chromeless
        .goto(json["リンク"])
        .wait('.tb-rmb-num')
        .evaluate((json) => {
            const data = {}
            const doc = document
            data.defaultName = doc.querySelector('.tb-main-title').getAttribute('data-title');
            if (json['商品名']) {
                data.name = json['商品名'];
            }
            if (json['独自商品ID']) {
                data.id = json['独自商品ID'];
            }
            //適当に作ったので後で削除
            data.url = json["リンク"]
            data.season = ''
            data.tag = ['ダミー', 'ダミー']
            data.category = ['ダミー', 'ダミー']
            data.colorName = ['ダミー', 'ダミー']
            data.image = ['ダミー', 'ダミー']
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
                if (AttributesArray[i].indexOf("领型") != -1) {
                    data.neckTipe = AttributesArray[i]
                }
                if (AttributesArray[i].indexOf("材质成分") != -1) {
                    data.material = AttributesArray[i]
                }
                if (AttributesArray[i].indexOf("对象") != -1) {
                    data.target = AttributesArray[i]
                }
                if (AttributesArray[i].indexOf("厚薄") != -1) {
                    data.thick = AttributesArray[i]
                }
                if (AttributesArray[i].indexOf("基础风格") != -1) {
                    data.style = AttributesArray[i]
                }
                if (AttributesArray[i].indexOf("版型:") != -1) {
                    data.bodyStyle = AttributesArray[i]
                }
                if (AttributesArray[i].indexOf("款式版型") != -1) {
                    data.bodyStyle2 = AttributesArray[i]
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
            return data;
        },json)
    return dataJson;
}
