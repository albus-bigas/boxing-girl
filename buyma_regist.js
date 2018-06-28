const {
    Chromeless
} = require('chromeless')
const fs = require('fs')

const setting = require('./' + process.argv[2])
const dataJson = require('./' + process.argv[3])
const comment = require('./data/comment.json')

const basePath = 'https://www.buyma.com/';
const imagePath = __dirname + '/img/';
const mail = setting.mail;
const pass = setting.pass;
const searchId = setting.searchId;

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const lastDay = new Date(year, month, 0).getDate();

const debagMode = true;

//TODO: setSize()とsetColorの依存を解消←依存している関数は全部バラす
//TODO: ユニセックス対応
//TODO: 靴、アクセサリー等対応
//TODO: エラー処理(idとエラー箇所通知)
//TODO: slack通知

let chromeless = new Chromeless({
    scrollBeforeClick: true,
    implicitWait: true
})

async function run() {
    await console.log('start')
    await login()
    await input()
    await logout()
    await end();
}

// MARK: login()
async function login() {
    if (debagMode) await console.log('login')
    await chromeless
        .goto(basePath + 'login/')
        .type(mail, '#txtLoginId')
        .type(pass, '#txtLoginPass')
        .click('#login_do')
        .wait(5000)
}
// MARK: input()
async function input() {
    for (let value of dataJson) {
        const data = value;
        // 出品ページへ
        await chromeless.goto(basePath + 'my/itemedit/?tab=b')
            .wait('.js-duty-edit-type')

        await setData(data)
        await searchHistoricalData()
        await setCategoly(data)
        await setBrand()
        await setImage(data)
        // await setColor(data)
        // await setSize(data)
        await setTag(data)
        await setThema()
        await setText(data, data.id)
        await submit(data)
        const ranTime = Math.floor(Math.random() * (420000 - 180000) + 180000)
        await chromeless.wait(ranTime)
    }
}

// MARK: setData() 日付取得、フォルダから画像のパスを取得
function setData(data) {
    if (debagMode) console.log('setData')
    data.category = data.category.split(',');
    data.keyword = data.keyword.split(',');
    data.limit = year + '/' + month + '/' + lastDay;
    data.image = fs.readdirSync(imagePath + data.id)
    for (let i = 0; i < data.image.length; i++) {
        if (data.image[i] == '.DS_Store') data.image.splice(i, 1);
    }
    for (let i = 0; i < data.image.length; i++) {
        data.image[i] = imagePath + data.id + '/' + data.image[i];
    }
}

// MARK: 過去の出品を検索してコピー
async function searchHistoricalData() {
    if (debagMode) await console.log('searchHistoricalData')
    await chromeless
        .click('.itemedit-copy-btn')
        .wait('#formmain_select')
        .type(searchId, '#conditional_text')
        .click('#conditional_submit')
        .wait(`input[onclick="$('#rdoitems').val('36281020')"]`)
        .click(`input[onclick="$('#rdoitems').val('36281020')"]`)
        .evaluate(() => {})
}

// MARK: setCategoly() カテゴリ選択
async function setCategoly(data) {
    await console.log('setCategoly')
    await chromeless
        .wait('.js-duty-edit-type')
        .click('.popup_category')
        .wait('.cate_link')
        .evaluate((json) => {
            const cateRow = document.querySelectorAll('.cat_list')
            const cateLink = cateRow[1].querySelectorAll('.cate_link')
            for (let i = 0; i < cateLink.length; i++) {
                if (cateLink[i].innerText == json.category[0]) {
                    cateLink[i].click();
                }
            }
        }, data)
    await chromeless
        .wait('.cate_list')
        .evaluate((json) => {
            const cateList = document.querySelectorAll('a')
            for (let i = 0; i < cateList.length; i++) {
                if (cateList[i].innerText == json.category[1]) {
                    cateList[i].click()
                }
            }
        }, data)
}

// MARK: setBrand() ブランド選択
// TODO: ブランドがある場合ブランド選択
async function setBrand() {
    if (debagMode) await console.log('setBrand')
    await chromeless
        .click('.popup_brand')
        .wait('#brand_popup_tab')
        .click('.select_box.fab-button.fab-button--back')
}

// MARK: setImage() 画像選択
async function setImage(data) {
    if (debagMode) await console.log('setImage')
    await chromeless
        .setFileInput('input[type=file]', data.image)
        .wait(10000)
}

// MARK: setColor() カラー選択
async function setColor(data) {
    if (debagMode) await console.log('setColor')
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
                .evaluate(() => {
                    const colorAddBtn = document.querySelector('.js-add-color')
                    colorAddBtn.click();
                })

            // TODO: 後で消す
            await chromeless.evaluate(() => {
                const popup = document.querySelector('.js-color-size-popup-box')
                const submitBtn = popup.querySelectorAll('.fab-button--primary')[2];
                submitBtn.click();
            })
        }
    })()
}

// MARK: setSize() サイズ選択
// TODO: 日本参考サイズ入力
async function setSize(data) {
    if (debagMode) await console.log('setSize')
    await (async function () {
        for (let i = 0; i < data.size.length; i++) {
            await chromeless.type(data.size[i], `[data-id="${i + 1}"] .js-size-text`)
                //     .click(`[data-id="${i + 1}"] select`)
                // if (data.size[i] == 'S') {
                //     await chromeless.press(40, 1)
                // } else if (data.size[i] == 'M') {
                //     await chromeless.press(40, 2)
                // } else if (data.size[i] == 'L') {
                //     await chromeless.press(40, 3)
                // } else if (data.size[i].indexOf('L') > 0) {
                //     await chromeless.press(40, 4)
                // }
                // await chromeless.press(13)
                // await chromeless.type('\r')

                .evaluate((size, i) => {
                    const japanSize = document.querySelector(`[data-id="${i + 1}"] select`)
                    if (size == 'S') {
                        japanSize.children[1].selected = true;
                        japanSize.value = 2;
                    } else if (size == 'M') {
                        japanSize.children[2].selected = true;
                        japanSize.value = 3;
                    } else if (size == 'L') {
                        japanSize.children[3].selected = true;
                        japanSize.value = 4;
                    } else if (size.indexOf('L') >= 0) {
                        japanSize.children[4].selected = true;
                        japanSize.value = 5;
                    }
                }, data.size[i], i)
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

// TODO: サイズ詳細

// MARK: setTag() タグ選択
// TODO: 有名人、雑誌ランダム選択
async function setTag(data) {
    if (debagMode) await console.log('setTag')
    if (data.tag) {
        await chromeless.evaluate(() => {
            const btn = document.querySelector('.itemedit-tag__btn')
            btn.click()
        })
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
}

// MARK: setThema() テーマ選択
async function setThema() {
    if (debagMode) await console.log('setThema')
    await chromeless.click('.popup_thema')
        .wait('.thema_list')
        .evaluate(() => {
            const ele = document.querySelector('tr[value="1"]');
            ele.click();
        })
}

// MARK: setText() 文字入力->登録
async function setText(data, index) {
    if (debagMode) await console.log('setText')
    await chromeless.evaluate((json, comment) => {
        let ele = document.querySelector('#item_name');
        let title = json.name;
        if (json.keyword) {
            for (var i = 0; i < json.keyword.length; i++) {
                comment = comment + " " + json.keyword[i];
            }
        }
        title = title + " " + json.id;
        ele.value = title;
        ele = document.querySelector('#price');
        ele.value = json.ex_price;
        ele = document.querySelector('.js-reference-price-reference');
        ele.click();
        ele = document.querySelector('#reference_price');
        ele.value = json.re_price;
        ele = document.querySelector('#pieces');
        ele.value = 2;
        ele = document.querySelector('#item_color_size');
        // ele.value = json.size_description;
        ele = document.querySelector('#item_comment');
        ele.value = comment;

        // MARK: 関税込み選択
        ele = document.querySelector('#itemedit_duty_flg');
        ele.click();

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
    }, data, comment.comment)
}

// TODO: setShipping() 配送方法 保留
async function setShipping() {
    if (debagMode) await console.log('setShipping')
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

// TODO: setLocation() 買い付け地 保留
async function setLocation() {
    if (debagMode) await console.log('setLocation')
    await chromeless.evaluate(() => {
        ele = document.querySelector('#rdoMyActArea2')
        ele.checked = true
        ele = document.querySelector('#itemedit_purchase_area[name="itemedit[purchase_area_over_sea_primary][]"')
        ele.value = '2002000000'
        ele.onchange()
        setTimeout(() => {
            ele = document.querySelector('#itemedit_purchase_area[name="itemedit[purchase_area_over_sea][]"]')
            ele.value = '2002003000'
        }, 5000)
    })
}

// MARK: submit() 確定
// NOTE: エラー出たら下書き保存にしてもいいかも。
async function submit(data) {
    if (debagMode) await console.log('submit')
    await (async function () {
        if (data.draft) {
            await chromeless.evaluate(() => {
                ele = document.querySelector('#draftButton');
                ele.click();
            })
            await chromeless.wait('.fab-design-mg--tb20')
        }
    })()
}

async function logout() {
    await chromeless.goto(basePath + 'logout/')
        .evaluate(() => { })
    await console.log('logout')
}

// MARK: end() 終了
async function end() {
    // await chromeless.end()
    await console.log('end')
}
run().catch(console.error.bind(console))