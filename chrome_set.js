const { Chromeless } = require('chromeless')
 
async function run() {
  const chromeless = new Chromeless({
    scrollBeforeClick: true,
    implicitWait: true
  })
 let defaultPath;

  const getData = await chromeless
    .goto('chrome://settings')
    .click('#advancedToggle')
    .evaluate(()=>{
        const data = {}
        const doc = document;
        const dom = dom.querySelector('settings-downloads-page');
        defaultPath = dom.querySelector('.secondary').innerText;
        return test;
    })
 
    console.log(getData)
    
    await chromeless.end()
}
 
run().catch(console.error.bind(console))