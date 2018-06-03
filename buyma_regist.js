const {
    Chromeless
} = require('chromeless')
const fs = require('fs')

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

//TODO: ユニセックス対応
//TODO: 靴、アクセサリー等対応
//TODO: エラー処理
//TODO: slack通知

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

// MARK: login()
async function login() {
    await console.log('login')
    await chromeless
        .goto(basePath + 'login/')
        .type(mail, '#txtLoginId')
        .type(pass, '#txtLoginPass')
        .click('#login_do')
        .wait(5000)
}
// MARK: input()
async function input() {
    for (let index in dataJson) {
        const data = dataJson[index];

        // TODO: 色変換システム

        // 出品ページへ
        await chromeless.goto(basePath + 'my/itemedit/?tab=b')

        await setData(data)
        await setCategoly(data)
        await setImage(data)
        // await setColor(data)
        // await setSize(data)
        await setTag(data)
        await setText(data, index)
        await submit(data)
    }
}

// MARK: setData() データ整形
async function setData(data) {
    console.log('setData')
    data.limit = year + '/' + month + '/' + lastDay;
    // data.image = await fs.readdir(imagePath + data.id, function (err, files) {
    //     if (err) {
    //         throw err;
    //     } else {
    //         for (let i = 0; i < files.length; i++) {
    //             if (files[i] == '.DS_Store') files.splice(i, 1);
    //             else {
    //                 files[i] = imagePath + data.id + '/' + files[i];
    //                 console.log(files[i])
    //             }
    //         }
    //         return files;
    //     }
    // })
    data.image = fs.readdirSync(imagePath + data.id)
    for (let i = 0; i < data.image.length; i++) {
        if (data.image[i] == '.DS_Store') data.image.splice(i, 1);
    }
    for (let i = 0; i < data.image.length; i++) {
        data.image[i] = imagePath + data.id + '/' + data.image[i];
    }
}

// MARK: setCategoly() 過去の出品からコピー、カテゴリ選択
async function setCategoly(data) {
    await console.log('setCategoly')
    await chromeless.wait('.js-duty-edit-type')
        .click('.itemedit-copy-btn')
        .wait('#formmain_select')
        .click(`input[onclick="$('#rdoitems').val('36421853')"]`)
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

// MARK: setImage() ブランド選択->画像選択
async function setImage(data) {
    await console.log('setimage', data.image)
    await console.log('setImage')
    await chromeless.click('.popup_brand')
        .wait('#brand_popup_tab')
        .click('.select_box.fab-button.fab-button--back')
        .setFileInput('input[type=file]', data.image)
        .wait(3000)
}

// MARK: setColor() カラー選択
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
    await console.log('setSize')
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
    await console.log('setTag')
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

// MARK: setText() 文字入力->登録
async function setText(data, index) {
    await console.log('setText')
    await chromeless.evaluate((json, comment, index) => {
        let ele = document.querySelector('#item_name');
        let title = json.name;
        for (var i = 0; i < json.keyword.length; i++) {
            title = title + " " + json.keyword[i];
        }
        title = title + " " + json.id;
        ele.value = title;
        ele = document.querySelector('#price');
        if (json.price2) {
            ele.value = json.price2;
        } else if (json.price1) {
            ele.value = json.price1;
        }
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
    }, data, comment.comment, index)
}

// TODO: setShipping() 配送方法 保留
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

// TODO: setLocation() 買い付け地 保留
async function setLocation() {
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
// TODO: 出品と下書き分岐
async function submit(data) {
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

// MARK: end() 終了
async function end() {
    // await chromeless.end()
    await console.log('end')
}
run().catch(console.error.bind(console))