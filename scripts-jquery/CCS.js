/**
 * Content-Caching System
 * Noah Shuart
 */

var cntCache = [];
var cntCached = [];

/**
 * Loads and caches website content that is stored on the server
 * in the form of .ccs files that are formatted in standard HTML.
 * Blocks of content are separated as divs. These divs are given
 * the class of "content". Images sources are converted to base64
 * strings and replaced so that images are also cached.
 *
 * @param url      String that states the relative location of the content file
 * @param div      String that states the id of the div containing the content
 * @param prefetch Array of urls to load and cache on page load
 * @return         Undefined
 */
function CCS(url, div, prefetch) {

    // Easiest way to convert image to Base64 string that doesn't use server scripting
    function convertToBase64(url, callback, outputFormat) {
        var canvas = document.createElement('CANVAS'),
            ctx = canvas.getContext('2d'),
            img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL(outputFormat || 'image/png');
            callback.call(this, dataURL);
            canvas = null;
        };
        img.src = url;
    }

    function buildContent(data) {
        $('#' + div).html(null);
        $('#' + div).html(data);
        $(document).trigger('loadComplete', [url]);
    }

    if (prefetch !== undefined && prefetch !== null &&
       url === undefined && url === null) {
        $.each(prefetch, function (index, element) {
            $.ajax({
                url: element,
                success: function (data) {
                    data = $($.parseHTML(data));
                    $.each(data.find('img'), function (i, value) {
                        value = $(value);
                        convertToBase64(value.attr('src'), function (imgEncoded) {
                            value.attr('src', imgEncoded);
                        });
                    });
                    data.siblings().attr('class', 'content');
                    var content = {
                        url: element,
                        text: data
                    };
                    cntCache.push(content);
                    console.log('Content prefetched');
                }
            });
        });
    } else if (url !== undefined && url !== null &&
       div !== undefined && div !== null) {

        cntCached = $.grep(cntCache, function (element) {
            return element.url === url;
        });

        if (cntCached.length === 0) {
            console.log('Retrieving content...');
            $.ajax({
                url: url,
                success: function (data) {
                    data = $($.parseHTML(data));
                    $.each(data.find('img'), function (i, value) {
                        value = $(value);
                        convertToBase64(value.attr('src'), function (imgEncoded) {
                            value.attr('src', imgEncoded);
                        });
                    });
                    data.siblings().attr('class', 'content');
                    var content = {
                        url: url,
                        text: data
                    };
                    cntCache.push(content);
                    buildContent(data);
                }
            });
            cntCached = [];
        } else if (cntCached.length === 1) {
            console.log('Pulling from cache and sending...');
            buildContent(cntCached[0].text);
            cntCached = [];
        }
    }
}
