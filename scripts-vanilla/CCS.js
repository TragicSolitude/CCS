/**
 * Content-Caching System
 *
 * Object constructor for CCS, initializes the url,
 * the div, and the options for the url and div. The load method
 * dispatches a 'ready' event on the provided div after the
 * content is loaded and inserted into the div.
 *
 * Note these are sort of pseudo JavaDoc comments and probably don't
 * meet the JavaDoc comment syntax rules. Instead these are just
 * here to clarify the use of this code.
 *
 * @param {String}          url     :: Required
 * @param {CSSQueryString}  div     :: Required
 * @param {Map}             options :: Optional
 *
 * @author                    Noah Shuart <> Darkstar1756
 * @example
 *  var ccs = new CCS('content.html', '#contentWrapper', {
 *    auto: false
 *  });
 */
function CCS(url, div, options) {
  /**
   * Options
   *
   * {String}   [method='GET']  XMLHttpRequest method used
   * {Boolean}  [auto=true]     Whether to load on object construction
   * {Function} onready         Function called when content is loaded
   * {Function} onerror         Function called if error occurs
   */
  this.options = {
    method: (options && options.method ? options.method : 'GET'),
    auto: (options && options.auto != undefined ? options.auto : true),
    onready: (options && options.onready ? options.onready : undefined),
    onerror: (options && options.onerror ? options.onerror : undefined)
  };

  var that = this;

  if (url == undefined || div == undefined) {
    console.error('The url and div parameters are required');
    return false;
  } else {
    this.url = url;
    this.div = document.querySelector(div);
    this.cache; // document.createElement('div');

    /**
     * Converts an image url into a Base64 String without
     * server-side scripting. Had to modify it to have an index
     * as a parameter because it is an async function running in
     * a for loop and messed up array indices.
     */
    function convertToBase64(url, index, callback, outputFormat){
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var img = new Image;
      img.crossOrigin = 'Anonymous';
      img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL, index);
        // Clean up
        canvas = null;
    	};
    	img.src = url;
    }

    /**
     * The main body of CCS, makes an XMLHttpRequest for the
     * specified data, converts any images to Base64 strings
     * then caches the entire thing in the cache property. If
     * the content is already cached, it pulls it returns the
     * cached version.
     */
    function load() {
      if (that.cache) {
        console.log('Loading from cache...');
        that.div.innerHTML = that.cache.innerHTML;
        that.div.dispatchEvent(new Event('ready'));

        if (that.options.onready) {
          that.options.onready.call();
        }
      } else {
        console.log('Downloading and caching...');
        var xhr = new XMLHttpRequest();

        xhr.onload = function () {
          that.cache = document.createElement('div');
          that.cache.innerHTML = this.responseText;
          var imgCached = 0;

          /**
           * Because asynchronous functions and loops don't play nice
           * together, it dispatches a 'imgready' event on the cache
           * to be handled by another function
           */
          var images = that.cache.querySelectorAll('img');
          for (var i = 0; i < images.length; i++) {
            convertToBase64(images[i].src, i, function (data, ndx) {
              images[ndx].src = data;
              that.cache.dispatchEvent(new Event('imgready'));
            });
          }

          /**
           * This function handles the processes after all of the
           * images are converted and cached. Is there a better way
           * of handling async functions and loops?
           */
          that.cache.addEventListener('imgready', function () {
            imgCached++;
            if (imgCached == images.length) {
              that.div.innerHTML = that.cache.innerHTML;
              that.div.dispatchEvent(new Event('ready'));

              if (that.options.onready) {
                that.options.onready.call();
              }
            }
          });
        };
        xhr.open(that.options.method, that.url, true);
        xhr.send();
      }
    }

    /**
     * Clears the div of any content and resets the cache
     */
    function unload() {
      that.div.innerHTML = '';
      that.cache = null; // document.createElement('div');
    }

    /**
     * Public method for the load function when options.auto is false
     *
     * @see load
     */
    this.load = load;

    /**
     * A shortcut for unloading the div and downloading it again
     *
     * @see load
     * @see unload
     */
    this.reload = function () {
      unload();
      load();
    };

    /**
     * Public method for the unload function
     *
     * @see unload
     */
    this.unload = unload;

    if (this.options.auto) {
      load();
    }
  }
}