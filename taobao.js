const { Chromeless } = require('chromeless')
 
async function run() {
  const chromeless = new Chromeless({
    scrollBeforeClick: true,
    implicitWait: true
  })
 
  const getData = await chromeless
    .goto('https://www.buyma.com/item/13192255')
    .click('.js-size-selector')
    .evaluate(()=>{
        const data = {}
        const doc = document
        const dom = doc.getElementById('detail_ttl')
        data.name = dom.querySelector('[itemprop="name"]').firstChild.data;
        data.price = doc.querySelector('[itemprop="price"]').innerText;
        const sizeList = doc.querySelector('.js-size-list').querySelectorAll('span');
        data.size = [];
        for(let i = 0; i < sizeList.length; i++){
            data.size.push(sizeList[i].textContent);
        }
        return data;
    })
 
    console.log(getData)
    
    await chromeless.end()
}
 
run().catch(console.error.bind(console))