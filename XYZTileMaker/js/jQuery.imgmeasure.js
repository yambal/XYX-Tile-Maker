jQuery.imgmeasure = (function($) {

    function _measure(url, callback) {
        var width = 0;
        var height = 0;

        var img = new Image();
        img.src = url;
        img.style.cssText = "";
        img.removeAttribute("width");
        img.removeAttribute("height");
        img.style.display = 'none';

        img.onload = function() {
            if(img.naturalWidth === undefined){
              width  = img.naturalWidth;
            }else if(img.naturalHeight === undefined){
              height = img.naturalHeight;
            }else{
              width  = img.width;
              height = img.height;
            }
            document.body.removeChild(img);

            callback(width, height);
        };

        document.body.appendChild(img);
    };

    return {
        measure:_measure
    };

})(jQuery);
