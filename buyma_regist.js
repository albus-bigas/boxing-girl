const {
    Chromeless
} = require('chromeless')
const setting = require('./' + process.argv[2])
const dataJson = require('./' + process.argv[3])
const comment = require('./comment.json')



const basePath = 'https://www.buyma.com/';
const imagePath = setting.imagePath;
const mail = setting.mail;
const pass = setting.pass;

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const lastDay = new Date(year, month, 0).getDate();

let chromeless = new Chromeless({
    scrollBeforeClick: true,
    implicitWait: true
})

async function run() {
    await console.log('start')
    await login()
    await input()
    await end();
}

async function login() {
    await console.log('login')
    await chromeless
        .goto(basePath + 'login/')
        .type(mail, '#txtLoginId')
        .type(pass, '#txtLoginPass')
        .click('#login_do')
        .wait(3000)
}
// MARK: input
async function input() {
    for (let index in dataJson) {
        dataJson[index].limit = year + '/' + month + '/' + lastDay;
        for (let i = 0; i < dataJson[index].image.length; i++) {
            dataJson[index].image[i] = imagePath + dataJson[index].image[i];
        }
        // TODO: 色変換システム
        const data = dataJson[index]

        // 出品ページへ
        await chromeless.goto(basePath + 'my/itemedit/?tab=b')

        await setCategoly(data)
        await setImage(data)
        await setColor(data)
        await setSize(data)
        await setTag(data)
        await setText(data, index)
    }
}

// MARK: 過去の出品からコピー、カテゴリ選択
async function setCategoly(data) {
    await console.log('setCategoly')
    await chromeless.wait('.js-duty-edit-type')
        .click('.itemedit-copy-btn')
        .wait('#formmain_select')
        .click(`input[onclick="$('#rdoitems').val('36354335')"]`)
        .wait('.js-duty-edit-type')
        .click('.popup_category')
        .wait('.cate_link')
        .evaluate((json) => {
            const cateRow = document.querySelectorAll('.cat_list')
            const cateLink = cateRow[1].querySelectorAll('.cate_link')
            for (let i = 0; i < cateLink.length; i++) {
                if (cateLink[i].innerText == json.category[0]) {
                    cateLink[i].click();
                    return
                }
            }
        }, data)
    await chromeless.wait('.cate_list')
        .evaluate((json) => {
            const cateList = document.querySelectorAll('a')
            for (let i = 0; i < cateList.length; i++) {
                if (cateList[i].innerText == json.category[1]) {
                    cateList[i].click()
                    return
                }
            }
        }, data)
}

// MARK: ブランド選択->画像選択
async function setImage(data) {
    await console.log('setImage')
    await chromeless.click('.popup_brand')
        .wait('#brand_popup_tab')
        .click('.select_box.fab-button.fab-button--back')
        .setFileInput('input[type=file]', data.image)
        .wait(3000)
}

// TODO: カラー選択
async function setColor(data) {
    await console.log('setColor')
    await chromeless.click('.js-popup-color-size')
        .wait('.js-size-input-wrap')
    let index;
    await (async function () {
        for (let i = 0; i < data.color.length; i++) {
            await chromeless.evaluate((json, colorName) => {
                const colorDoms = document.querySelectorAll('.item_color');
                for (let i = 0; i < colorDoms.length; i++) {
                    if (colorDoms[i].classList[1] == colorName) {
                        colorDoms[i].parentElement.click();
                    }
                }
            }, data, data.color[i])
            await chromeless.type(data.colorName[i], '.js-color-size-color-name')
                // .click('.js-add-color')
                .evaluate(() => {
                    const colorAddBtn = document.querySelector('.js-add-color')
                    colorAddBtn.click();
                })
        }
    })()
}

// MARK: サイズ選択
async function setSize(data) {
    await console.log('setSize')
    await (async function () {
        for (let i = 0; i < data.size.length; i++) {
            await chromeless.type(data.size[i], `[data-id="${i+1}"] .js-size-text`)
            if (i + 1 < data.size.length) {
                await chromeless.evaluate(() => {
                    const addSizeBtn = document.querySelector('.js-add-size')
                    addSizeBtn.click()
                })
            }
        }
    }())
    await chromeless.evaluate(() => {
        const popup = document.querySelector('.js-color-size-popup-box')
        const submitBtn = popup.querySelectorAll('.fab-button--primary')[2];
        submitBtn.click();
    })
}

// MARK: タグ選択
async function setTag(data) {
    await console.log('setTag')
    await chromeless.evaluate(()=>{
        const btn = document.querySelector('.itemedit-tag__btn')
        btn.click()
    })
    // .click('.itemedit-tag__btn')
    await chromeless.wait('.r_tag_select_box_content')
        .evaluate((tag) => {
            const doms = document.querySelectorAll('.m_tag_title');
            for (var i = 0; i < doms.length; i++) {
                for (var n = 0; n < tag.length; n++) {
                    if (doms[i].innerText == tag[n]) {
                        doms[i].parentElement.parentElement.click();
                    }
                }
            }
            const content = document.querySelector('.r_tag_select_box_content');
            setTimeout(() => {
                content.querySelector('button').click();
            }, 300)
        }, data.tag)
}

// MARK: 文字入力->登録
async function setText(data, index) {
    await console.log('setText')
    await chromeless.evaluate((json, comment, index) => {
        let ele = document.querySelector('#item_name');
        let title = json.name;
        for (var i = 0; i < json.keyword.length; i++) {
            title = title + " " + json.keyword[i];
        }
        title = title + " " + index;
        ele.value = title;
        ele = document.querySelector('#price');
        ele.value = json.price;
        ele = document.querySelector('#pieces');
        ele.value = 2;
        ele = document.querySelector('#item_color_size');
        ele.value = json.size_description;
        ele = document.querySelector('#item_comment');
        for (var i = 0; i < json.keyword.length; i++) {
            comment = comment + " " + json.keyword[i];
        }
        ele.value = comment;

        // MARK: 購入期限
        ele = document.querySelector('#itemedit_yukodate');
        ele.value = json.limit;

        // MARK: シーズン
        ele = document.querySelector('#season')
        if (json.season.indexOf('春') != -1 || json.season.indexOf('夏') != -1) {
            ele.value = '27'
        } else if (json.season.indexOf('秋') != -1 || json.season.indexOf('冬') != -1) {
            ele.value = '28'
        }

        // TODO: 買い付け地 保留
        // ele = document.querySelector('#rdoMyActArea2')
        // ele.checked = true
        // ele = document.querySelector('#itemedit_purchase_area[name="itemedit[purchase_area_over_sea_primary][]"')
        // ele.value = '2002000000'
        // ele.onchange()
        // setTimeout(()=>{
        //     ele = document.querySelector('#itemedit_purchase_area[name="itemedit[purchase_area_over_sea][]"]')
        //     ele.value = '2002003000'
        // },5000)

        // TODO: 出品と下書き分岐
        // ele = document.querySelector('#draftButton');
        // ele.click();
    }, data, comment.comment, index)

    // MARK: 登録完了画面待機
    // await chromeless.wait('.fab-design-mg--tb20')
}

// TODO: 配送方法 保留
async function setShipping() {
    await chromeless.click('.js-popup-shipping-method')
        .wait('.shipping-method-popup-area')
        .evaluate(() => {
            let ele = document.querySelector('#shipping_method_select');
            ele.value = 304;
            ele = document.querySelector('.shipping_price');
            ele.value = 2100;
            ele = document.querySelector('#with-tracking');
            ele.checked = true;
            elm = document.querySelector('.js-commit-shipping-method');
            ele.click();
        })
}

// MARK: 終了
async function end() {
    // await chromeless.end()
    await console.log('end')
}
run().catch(console.error.bind(console))