const html2canvas = require('html2canvas')
function createImage(dom) {
    html2canvas(dom, {
        scale: 2,
        dpi: 144,
        useCORS: true,
        taintTest: false,
        onrendered: function (canvas) {
            const image = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
            return image;
        }});
};