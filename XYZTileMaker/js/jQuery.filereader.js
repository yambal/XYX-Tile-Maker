(function($) {
    $.fn.filereader = function(options) {
        var me = this;
        var settings = $.extend({
            'dragover': 'drag-over',

        }, options);

        $(this).on('dragover', function(event) {
            event.stopPropagation();
            event.preventDefault();
            event.originalEvent.dataTransfer.dropEffect = 'copy';
            $(me).addClass(settings.dragover);
        });

        $(this).on('dragleave', function(event) {
            event.stopPropagation();
            event.preventDefault();
            $('#drop_zone').removeClass(settings.dragover);
        });

        $(this).on('drop', function(event) {
            event.stopPropagation();
            event.preventDefault();
            //console.log(event);
            var files = event.originalEvent.dataTransfer.files;
            var myEvent = new $.Event('files', {files:files});
            $(me).trigger(myEvent);

            $('#drop_zone').removeClass(settings.dragover);
        });

        return this;

    };
})(jQuery);
