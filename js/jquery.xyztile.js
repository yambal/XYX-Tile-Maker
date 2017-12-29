jQuery.xyztile = (function($) {

    function _make(url, width, height, filename_prefix, callback, progressCallback) {
        var img = new Image();
        img.src = url;

        var mSize = 0; // 原本画像の最大サイズ
        var maxZoom = 0; // 最大ズームサイズ 0
        var rSize = 256;
        var offsetX = 0;
        var offsetY = 0;

        // ---------------------------------------------------------
        mSize = width;
        if (mSize < height) {
            mSize = height;
        }

        // ---------------------------------------------------------
        // 拡大縮小無しのタイルサイズを計算する
        if (mSize <= 256) {} else {
            maxZoom = 1;
            while (Math.pow(2, maxZoom) * 256 <= height) {
                maxZoom++;
            };
            maxZoom++;
            rSize = Math.pow(2, maxZoom) * 256;
        }

        // ---------------------------------------------------------
        offsetX = (rSize - width) / 2;
        offsetY = (rSize - height) / 2;

        // ---------------------------------------------------------
        $("body").append('<canvas id="xyztile" width="256" height="256" style="display:none;">');
        var canvas = document.getElementById('xyztile');
        var ctx = canvas.getContext('2d');
        var imgFileArraybuffer = [];

        //
        var pregress = 0;
        var progressMax = 0;
        for (var zoom = 0; zoom < maxZoom + 1; zoom++) {
            var mtxNum = 1;
            if (zoom == 0) {} else {
                mtxNum = Math.pow(2, zoom);
            };
            for (var x = 0; x < mtxNum; x++) {
                for (var y = 0; y < mtxNum; y++) {
                    progressMax++;
                }
            }
        }

        for (var zoom = 0; zoom < maxZoom + 1; zoom++) {
            var mtxNum = 1;
            if (zoom == 0) {} else {
                mtxNum = Math.pow(2, zoom);
            };

            for (var x = 0; x < mtxNum; x++) {
                for (var y = 0; y < mtxNum; y++) {

                    ctx.clearRect(0, 0, 256, 256);
                    ctx.fillStyle = "rgb(125, 125, 125)";
                    ctx.fillRect(0, 0, 256, 256);

                    var currentScale = ((mtxNum) * 256) / rSize;

                    var x1 = (x * (-256 / currentScale) + offsetX) * currentScale;
                    var y1 = (y * (-256 / currentScale) + offsetY) * currentScale;

                    ctx.drawImage(img, 0, 0, width, height, x1, y1, width * currentScale, height * currentScale);

                    var dataurl = canvas.toDataURL('image/png');
                    var bin = atob(dataurl.split(',')[1]);
                    var buffer = new Uint8Array(bin.length);
                    for (var i = 0; i < bin.length; i++) {
                        buffer[i] = bin.charCodeAt(i);
                    };
                    imgFileArraybuffer.push({
                        name: filename_prefix + "-" + zoom + "-" + x + "-" + y + ".png",
                        data: buffer
                    });

                    pregress++;
                    if (typeof progressCallback == "function") {
                        progressCallback(pregress, progressMax);
                    }

                }
            }
        }

        callback(imgFileArraybuffer, filename_prefix + "-{z}-{x}-{y}.png", maxZoom);
        $("#xyztile").remove();
    };

    return {
        make: _make
    };

})(jQuery);