const axios = require('axios')
const itemList = require('./regist/' + process.argv[2])
const Setting = require('./setting/fukada.json')

const ssUrl = Setting.ssUrl
const sheetName = Setting.sheetName

const dataJson = {};

for (let index in itemList) {
    dataJson[index] = data_checker(itemList[index])
}
postData()

function data_checker (json){
    const data = {}
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
    return data
}
function postData() {
    axios({
        method: 'POST',
        port: '443',
        url: ssUrl + `?action=writeData&sheetName=${sheetName}`,
        data: dataJson
    }).then(response => {
        console.log('\u001b[33m' + response.data.musume + '\u001b[0m')
    });
}