const {
    Chromeless
} = require('chromeless')
const dataJson = require(process.argv[2])
const comment = require('./comment.json')

const setting = require('./setting.json')


const basePath = 'https://www.buyma.com/';
const imagePath = setting.imagePath;
const mail = setting.mail;
const pass = setting.pass;

let chromeless;

async function run() {
    chromeless = new Chromeless({
        scrollBeforeClick: true,
        implicitWait: true
    })
    return
}

async function login() {
    console.log('start');
    await chromeless
        .goto(basePath + 'login/')
        .type(mail, '#txtLoginId')
        .type(pass, '#txtLoginPass')
        .click('#login_do')
        .wait(3000)
}
async function input() {
    for (let index in dataJson) {
        for (let i = 0; i < dataJson[index].image.length; i++) {
            dataJson[index].image[i] = imagePath + dataJson[index].image[i];
        }
        // 出品ページへ
        chromeless.goto(basePath + 'my/itemedit/?tab=b')
        // カテゴリ選択
        await chromeless.wait('.js-duty-edit-type')
            .click('.popup_category')
        await chromeless.wait('.cate_link')
            .evaluate((json) => {
                const cateRow = document.querySelectorAll('.cat_list')
                const cateLink = cateRow[1].querySelectorAll('.cate_link')
                for (let i = 0; i < cateLink.length; i++) {
                    if (cateLink[i].innerText == json.category[0]) {
                        cateLink[i].click();
                        return
                    }
                }
            }, dataJson[index])
        await chromeless.wait('.cate_list')
            .evaluate((json) => {
                const cateList = document.querySelectorAll('a')
                for (let i = 0; i < cateList.length; i++) {
                    if (cateList[i].innerText == json.category[1]) {
                        cateList[i].click()
                        return
                    }
                }
            }, dataJson[index])

        // ブランド選択->画像選択
        chromeless.click('.popup_brand')
            .wait('#brand_popup_tab')
            .click('.select_box.fab-button.fab-button--back')
            .setFileInput('input[type=file]', dataJson[index].image)
            .wait(3000)
        // TODO: サイズ

        // TODO: 配送方法

        // 文字入力->登録
        chromeless.evaluate((json, comment) => {
            let ele = document.querySelector('#item_name');
            ele.value = json.name;
            ele = document.querySelector('#price');
            ele.value = json.price;
            ele = document.querySelector('#pieces');
            ele.value = 2;
            ele = document.querySelector('#item_color_size');
            ele.value = json.size_description;
            // TODO: キーワード追加
            ele = document.querySelector('#item_comment');
            ele.value = comment;
            // TODO: 購入期限
            // ele = document.querySelector('#itemedit_yukodate');
            // ele.value = json.limit;
            
            // シーズン
            ele = document.querySelector('#season')
            if (json.season.indexOf('春') != -1 || json.season.indexOf('夏') != -1 ){
                ele.value = '27'
            }
            else if (json.season.indexOf('秋') != -1 || json.season.indexOf('冬') != -1 ){
                ele.value = '28'
            }

            // 買い付け地
            ele = document.querySelector('#rdoMyActArea2')
            ele.checked = true
            ele = document.querySelector('#itemedit_purchase_area[name="itemedit[purchase_area_over_sea_primary][]"')
            ele.value = '2002000000'
            // ele.onchange()
            // setTimeout(()=>{
            //     ele = document.querySelector('#itemedit_purchase_area[name="itemedit[purchase_area_over_sea][]"]')
            //     ele.value = '2002003000'
            // },5000)


            // ele = document.querySelector('#draftButton');
            // ele.click();
        }, dataJson[index], comment.comment.comment)

        // 登録完了画面待機
        await chromeless.wait('.fab-design-mg--tb20');
    }
}
async function end() {
    await chromeless.end()
    console.log('end')
}
run().then(login()).then(input()).catch(console.error.bind(console))