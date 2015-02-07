(function() {

    // used for jsonp callback name
    var count = 0,
        callbackPrefix = 'jsonp' + (Math.random() * 10000 | 0);

    var head = document.getElementsByTagName('head')[0];

    var TIMEOUT_LENGTH = 5000;



    function serializeObject(obj) {
        
        if (typeof obj !== 'object') { return obj; }
        
        var pairs = [];
        
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop) && obj[prop] !== null) {
                pairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]));
            }
        }

        return pairs.join('&');
    }



    // expects options can be a url string, or
    // { url: <string>, timeout: <number>, callbackKey: <string> } object
    // callback is a node-style (err, data) callback
    function jsonpRequest(options, data, callback) {

        if (typeof options !== 'object') {
            options = { url: options };
        }
        
        var callbackName = callbackPrefix + (count++),
            callbackKey = options.callbackKey || 'callback',
            jsonpUrl = options.url + '?' + serializeObject(data) + '&' + callbackKey + '=' + callbackName,
            elem = document.createElement('script'),
            called = false,
            timeoutId;

        var done = function(err, data) {

            // ensure callback is called only once:
            if (called) { return; }

            called = true;

            //clean up
            delete window[callbackName];
            head.removeChild(elem);
            window.clearTimeout(timeoutId);

            callback(err, data);

        };

        // make sure there isn't an (unlikely) name clash:
        while (typeof window[callbackName] !== 'undefined') {
            callbackName = callbackPrefix + (count++);
        }

        window[callbackName] = function(data) {

            done(null, data);

        };

        elem.async = true;
        elem.src = jsonpUrl;
        elem.onerror = function() {

            done(new Error('JSONP request has failed'));

        };

        // certain errors (e.g. CSP errors) are thrown synchronously so use 
        // setTimeout to ensure request is consistently async
        window.setTimeout(function() {
            head.appendChild(elem);
        }, 0);

        timeoutId = window.setTimeout(function() {

            done(new Error('JSONP request has timed out.'));

        }, options.timeout || TIMEOUT_LENGTH);

    }

    // export jsonpRequest:
    if (typeof module === 'object' && typeof module.exports === 'object') {
        // browserify
        module.exports = jsonpRequest;
    } else {
        window.jsonpRequest = jsonpRequest;
    }

})();