module.exports = async function TmallGetter(json, chromeless) {
    const dataJson = await chromeless
        .goto(json["リンク"])
        .wait('.main-wrap', 50000)
        .wait(1000)
        .evaluate((json) => {
            const data = {}
            const doc = document
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
            // MARK: 名前
            data.defaultName = doc.querySelector('.tb-detail-hd h1').innerText;
            // MARK: 値段
            let dom = doc.querySelectorAll('.tm-price');
            let index;
            if (dom[0].innerText != null) data.price1 = dom[0].innerText;
            if (dom[1].innerText != null) data.price2 = dom[1].innerText;
            // MARK: 送料
            dom = doc.querySelector('#J_PostageToggleCont > span');
            if (dom) {
                index = dom.innerText.indexOf(':') + 1;
                data.shipping = dom.innerText.slice(index);
            } else {
                data.shipping = 0;
            }
            const AttributesList = doc.querySelector("#J_AttrUL").querySelectorAll("li");
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
                if (AttributesArray[i].indexOf("材质") != -1) {
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
            return data;
        }, json)
    return dataJson;
}