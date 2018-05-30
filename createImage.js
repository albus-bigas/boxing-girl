function createImage(dom){
    html2canvas(dom, {
        scale: 2,
        dpi: 144,
        useCORS: true,
        taintTest: false,
        onrendered: function (canvas) {
            var a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
            a.download = 'somefilename.jpg';
            a.click();
        }});
};