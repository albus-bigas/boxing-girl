const fs = require('fs')
const Canvas = require('canvas'),
    Image = Canvas.Image;

module.exports = function ImageSlicer(name) {
    fs.mkdir(__dirname + `/../img/${name}`, function (err) {
        if (err) console.log(err);
    });
    fs.readFile(__dirname + `/../img/${name}.png`, function (err, data) {
        if (err) throw err;

        const img = new Image;
        img.src = data;
        const canvas = new Canvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        let isImage = false;
        let cropAreaArray = [];
        let cropArea = []

        for (let y = 0; y < img.height; y++) {
            const imagedata = ctx.getImageData(0, y, img.width, 1);
            const isWhite = checkWhite(imagedata.data);
            if (!isImage && isWhite) {
                if (!cropAreaArray[cropAreaArray.length - 1] || y - cropAreaArray[cropAreaArray.length - 1][0] > 10) {
                    cropArea.push(y);
                    isImage = true;
                }
            }
            if (isImage && !isWhite) {
                if (y - cropArea[0] > 30) {
                    cropArea.push(y - 1);
                    cropAreaArray.push(cropArea);
                    isImage = false;
                    cropArea = [];
                }
            }
        }
        for (let i = 0; i < cropAreaArray.length; i++) {
            const cropCanvas = new Canvas(img.width, cropAreaArray[i][1] - cropAreaArray[i][0]);
            const cropCtx = cropCanvas.getContext('2d');
            cropCtx.drawImage(img, 0, cropAreaArray[i][0], img.width, cropAreaArray[i][1] - cropAreaArray[i][0], 0, 0, img.width, cropAreaArray[i][1] - cropAreaArray[i][0])
            const b64 = cropCanvas.toDataURL('image/png').split(',')[1];
            var buf = new Buffer(b64, 'base64');
            fs.writeFileSync(__dirname + `/../img/${name}/${name}_${i}.png`, buf, function (err) {
                console.log(err);
            });
        }
    });
}
const checkWhite = (array) => {
    const whiteArray = [255, 255, 255, 255];
    for (let x = 0; x < array.length / 4; x++) {
        if (whiteArray.toString() != array.slice(x * 4, x * 4 + 4).toString()) {
            return true;
        }
        if (x == array.length / 4) {
            return false;
        }
    }
}