  function handleFileSelect(evt) {
      evt.stopPropagation();
      evt.preventDefault();

      $("#log").html("");

      var files = evt.dataTransfer.files; // FileList object.

      if (files[0].type == "image/png" || files[0].type == "image/jpeg") {
          var fileNames = files[0].name.split(".");
          var fileName = fileNames[0];

          var blobUrl = window.URL.createObjectURL(files[0]);

          // サイズ計測　- - - - - - - - - - - - - - - - - - - - - - - - - - - 
          var img = new Image();
          img.src = blobUrl;
          img.style.cssText = "";
          img.removeAttribute("width");
          img.removeAttribute("height");
          img.style.display = 'none';

          img.onload = function() {
              var width = 0; // 原本画像の幅
              var height = 0; // 原本画像の高さ
              var mSize = 0; // 原本画像の最大サイズ
              var maxZoom = 0; // 最大ズームサイズ 0-
              var rSize = 256;
              var offsetX = 0;
              var offsetY = 0;
              var canvas = document.getElementById('c1');
              var ctx = canvas.getContext('2d');
              var imgFileArraybuffer = [];

              if (img.naturalWidth === undefined) {
                  width = img.naturalWidth;
              } else if (img.naturalHeight === undefined) {
                  height = img.naturalHeight;
              } else {
                  width = img.width;
                  height = img.height;
              }
              document.body.removeChild(img);

              $("#log").append("<li>" + width + ", " + height + "</li>");

              mSize = width;
              if (mSize < height) {
                  mSize = height;
              }

              // ---------------------------------------------------------
              // 拡大縮小無しのタイルサイズを計算する
              if (mSize <= 256) {

              } else {
                  maxZoom = 1;
                  while (Math.pow(2, maxZoom) * 256 <= height) {
                      maxZoom++;
                  };
                  maxZoom++;
                  rSize = Math.pow(2, maxZoom) * 256;
              }

              offsetX = (rSize - width) / 2;
              offsetY = (rSize - height) / 2;

              $("#log").append("<li>最大領域:" + rSize + "px　(オフセット:" + offsetX + ", " + offsetY + ")</li>");
              $("#log").append("<li>最大ズームレベル：" + 　maxZoom + "</li>");

              for (var zoom = 0; zoom < maxZoom + 1; zoom++) {
                  var mtxNum = 1;
                  if (zoom == 0) {} else {
                      mtxNum = Math.pow(2, zoom);
                  }

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
                              name: fileName + "-" + zoom + "-" + x + "-" + y + ".png",
                              data: buffer
                          });
                      }
                  }
              }

              console.log(imgFileArraybuffer);
              dozip(fileName + ".zip", imgFileArraybuffer, fileName + '-{z}-{x}-{y}.png', maxZoom);
          };

          document.body.appendChild(img);
      } else {
          $("#alert").append('<div class="alert alert-warning alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>エラー</strong> 使用できるのは JPEG と PNG ファイルです</div>');
      }
  }

  function dozip(fileName, files, fmt, maxZoom) {
      var zip = new JSZip();

      //
      var sampleHTML = '<!DOCTYPE html>' +
          '\n<html>' +
          '\n<head>' +
          '\n\t<title>' + fileName + '</title>' +
          '\n\t<meta charset="utf-8" />' +
          '\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
          '\n\t<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />' +
          '\n\t<link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css"/>' +
          '\n\t<script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js"></script>' +
          '\n\t<style>' +
          '\n\t\tbody {' +
          '\n\t\t\tpadding: 0;' +
          '\n\t\t\tmargin: 0;' +
          '\n\t\t}' +
          '\n\t\thtml, body, #map {' +
          '\n\t\t\theight: 100%;' +
          '\n\t\t\twidth: 100%;' +
          '\n\t\t}' +
          '\n\t</style>' +
          '\n</head>' +
          '\n<body>' +
          '\n\t<div id="map"></div>' +
          '\n\t<script>' +
          '\n\t\tvar std = L.tileLayer("tiles/' + fmt + '", {' +
          '\n\t\t\tmaxZoom:' + maxZoom + ',' +
          '\n\t\t\tmaxNativeZoom:' + maxZoom + ',' +
          '\n\t\t\tminZoom:0,' +
          '\n\t\t\tminNativeZoom:0,' +
          '\n\t\t\terrorTileUrl:"http://placehold.jp/256x256.png?text=no%20tile"' +
          '\n\t\t});' +
          '\n\t\tvar myMap = L.map("map", {' +
          '\n\t\t\tcenter: [0, 0],' +
          '\n\t\t\tzoom: 0,' +
          '\n\t\t\tlayers: [std]' +
          '\n\t\t});' +
          '\n\t</script>' +
          '\n</body>' +
          '\n</html>';

      zip.file("sample.html", sampleHTML);

      var img = zip.folder("tiles");
      for (var i = 0; i < files.length; i++) {
          img.file(files[i].name, files[i].data);
      }
      zip.generateAsync({ type: "blob" })
          .then(function(content) {
              saveAs(content, fileName);
          });
  }

  function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy';
      $('#drop_zone').addClass('drag-over');
  }

  function handleDragLeave(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      $('#drop_zone').removeClass('drag-over');
  };

  // Setup the dnd listeners.
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileSelect, false);
  dropZone.addEventListener('dragleave', handleDragLeave, false);