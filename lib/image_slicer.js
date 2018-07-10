const fs = require('fs')
const im = require('imagemagick');
const Canvas = require('canvas'),
    Image = Canvas.Image;

module.exports = async function ImageSlicer(name) {
    return new Promise(async (resolve) => {
        await fs.access(__dirname + `/../img/${name}`, fs.constants.R_OK | fs.constants.W_OK, (error) => {
            if (error) {
                if (error.code === "ENOENT") {
                    fs.mkdir(__dirname + `/../img/${name}`, function (err) {
                        if (err) console.error(err);
                    });
                }
            }
        })
        await new Promise(async (resolve, reject) => {
            await fs.readFile(__dirname + `/../img/${name}.png`, async function (err, data) {
                if (err) throw err;
                const img = new Canvas.Image;
                img.src = data;
                const canvas = new Canvas(img.width, img.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height)

                let isImage = false;
                let cropAreaArray = [];
                let cropArea = []

                for (let y = 0; y < img.height; y++) {
                    const imagedata = ctx.getImageData(0, y, img.width, 1);
                    const isBG = checkBG(imagedata.data, 40);
                    if (!isImage && isBG) {
                        if (!cropAreaArray[cropAreaArray.length - 1] || y - cropAreaArray[cropAreaArray.length - 1][0] > 10) {
                            cropArea.push(y);
                            isImage = true;
                        }
                    }
                    if (isImage && !isBG) {
                        if (y - cropArea[0] > 1) {
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
                        if (err) console.log(err);
                    });
                }
                resolve();
            });
        })
        await new Promise((resolve, reject) => {
            const slicedImages = fs.readdirSync(__dirname + `/../img/${name}`)
            for (let i = 0; i < slicedImages.length; i++) {
                if (slicedImages[i] == '.DS_Store') slicedImages.splice(i, 1);
            }
            for (let i = 0; i < slicedImages.length; i++) {
                slicedImages[i] = __dirname + `/../img/${name}/${slicedImages[i]}`
            }
            const args = ['-format', '%h,']
            let imageHeights;
            const mergeImageList = [];
            im.identify(args.concat(slicedImages), function (err, output) {
                if (err) throw err;
                imageHeights = output.split(',')
                for (let i = 0; i < slicedImages.length; i++) {
                    if (imageHeights[i] < 200) mergeImageList.push(slicedImages[i])
                }
                const convertArgs = mergeImageList.concat();
                convertArgs.unshift('-append');
                convertArgs.push(__dirname + `/../img/${name}/merged_image.png`)
                im.convert(convertArgs, function (eer, stdout) {
                    if (err) throw err;
                    for (let i = 0; i < mergeImageList.length; i++) {
                        fs.unlinkSync(mergeImageList[i])
                    }
                    resolve();
                })
            })
        })
        await new Promise((resolve, reject) => {
            const splitImages = fs.readdirSync(__dirname + `/../img/${name}`)
            for (let i = 0; i < splitImages.length; i++) {
                if (splitImages[i] == '.DS_Store') splitImages.splice(i, 1);
                if (splitImages[i] == 'merged_image.png') splitImages.splice(i, 1);
            }
            new Promise((resolve, reject) => {
                for (let i = 0; i < splitImages.length; i++) {
                    fs.readFile(__dirname + `/../img/${name}/${splitImages[i]}`, function (err, data) {
                        if (err) throw err;
                        const img = new Image;
                        img.src = data;
                        const canvas = new Canvas(img.width, img.height);
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, img.width, img.height);

                        let isImage = false;
                        let cropAreaArray = [];
                        let cropArea = []

                        for (let x = 0; x < img.width; x++) {
                            const imagedata = ctx.getImageData(x, 0, 1, img.height);
                            const isBG = checkBG(imagedata.data, 10);
                            if (!isImage && isBG) {
                                if (!cropAreaArray[cropAreaArray.length - 1] || x - cropAreaArray[cropAreaArray.length - 1][0] > 10) {
                                    cropArea.push(x);
                                    isImage = true;
                                }
                            }
                            if (isImage && !isBG) {
                                if (x - cropArea[0] > 1) {
                                    cropArea.push(x - 1);
                                    cropAreaArray.push(cropArea);
                                    isImage = false;
                                    cropArea = [];
                                }
                            }
                            if (x == img.width && !isImage) {
                                cropArea.push(x - 1);
                                cropAreaArray.push(cropArea);
                                isImage = false;
                                cropArea = [];
                            }
                        }
                        if (cropAreaArray.length > 0) {
                            for (let c = 0; c < cropAreaArray.length; c++) {
                                const cropCanvas = new Canvas(cropAreaArray[c][1] - cropAreaArray[c][0], img.height);
                                const cropCtx = cropCanvas.getContext('2d');
                                cropCtx.drawImage(img, cropAreaArray[c][0], 0, cropAreaArray[c][1] - cropAreaArray[c][0], img.height, 0, 0, cropAreaArray[c][1] - cropAreaArray[c][0], img.height)
                                const b64 = cropCanvas.toDataURL('image/png').split(',')[1];
                                const buf = new Buffer(b64, 'base64');
                                const fileName = splitImages[i].replace(/.png/g, "")
                                fs.writeFileSync(__dirname + `/../img/${name}/${fileName}_${c}.png`, buf, function (err) {
                                    if (err) console.log(err);
                                });
                            }
                            fs.unlinkSync(__dirname + `/../img/${name}/${splitImages[i]}`)
                        }
                        if (splitImages.length == i) resolve();
                    });
                }
            }).then(
                resolve()
            )
        })
        await new Promise((resolve, reject) => {
            const splitedImages = fs.readdirSync(__dirname + `/../img/${name}`)
            for (let i = 0; i < splitedImages.length; i++) {
                if (splitedImages[i] == '.DS_Store') splitedImages.splice(i, 1);
            }
            for (let i = 0; i < splitedImages.length; i++) {
                splitedImages[i] = __dirname + `/../img/${name}/${splitedImages[i]}`
            }
            const args = ['-format', '%w,']
            let imageWidths;
            const deleteImageList = [];
            im.identify(args.concat(splitedImages), function (err, output) {
                if (err) throw err;
                imageWidths = output.split(',')
                for (let i = 0; i < splitedImages.length; i++) {
                    if (imageWidths[i] < 200) deleteImageList.push(splitedImages[i])
                }
                for (let i = 0; i < deleteImageList.length; i++) {
                    fs.unlinkSync(deleteImageList[i])
                }
                resolve();
            })
        })
        await resolve()
    })
}
const checkBG = (array, threshold) => {
    const bgColor = array.slice(0, 4);
    for (let x = 0; x < array.length / 4; x++) {
        const checkColor = array.slice(x * 4, x * 4 + 4);
        const r = bgColor[0] - checkColor[0]; // R値の差
        const g = bgColor[1] - checkColor[1]; // G値の差
        const b = bgColor[2] - checkColor[2]; // B値の差
        const d = Math.sqrt(r * r + g * g + b * b); // 2つの色の距離
        if (d > threshold) return true; // 閾値（60）以下なら、その色は近似色
        if (x == array.length / 4) return false;
    }
}