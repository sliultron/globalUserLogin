import config from "../gulConfig";
import _ from "underscore";

export default (function(){

    var _iframe = null;
    var _iframeReady = false;
    var _origin = config.domain;
    var _path = config.crossdomainPagePath;
    var _queue = [];
    var _requests = {};
    var id = 0;

    var supported = (function() {
        try {
            return window.postMessage && window.JSON && 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    })();

    //private methods
    var sendRequest = function(data) {
        if (_iframe) {
            _requests[data.request.id] = data;
            _iframe.contentWindow.postMessage(data.request, _origin);
        }
    };

    var iframeLoaded = function() {
        _iframeReady = true;
        if (_queue.length) {
            for (var i = 0, len = _queue.length; i < len; i++) {
                sendRequest(_queue[i]);
            }
            _queue = [];
        }
    };

    var handleMessage = function(event) {
        var data = event.data;
        var request = _requests[data.id];
        if(request){
            if(event.origin ===  _origin){
                request._deferred.resolve(data.value);
                _requests = _.filter(_requests, function(r) { return !r || r.id !== data.id; });
            }
            else
                request._deferred.reject(null);
        }
    }

    //Public methods

    var removeItem = function(key) {
        if (supported) {
            var request = {
                id: ++id,
                type: 'unset',
                key: key
            },
                data = {
                    request: request,
                };
           
            if (_iframeReady) {
                sendRequest(data);
            } else {
                _queue.push(data);
            } 
        }
    }

    var getItem = function(key) {
        if (supported) {
            var request = {
                id: ++id,
                type: 'get',
                key: key
            },
                data = {
                    request: request,
                };
           
       

            data._deferred = config.promiseProvider();
            

            if (_iframeReady) {
                sendRequest(data);
            } else {
                _queue.push(data);
            }

            var timer  = setTimeout(function(){
                data._deferred.reject(null);
            }, 5000)
           
            return data._deferred.promise.then(function(data)
            {
                clearTimeout(timer);
                return data;
            }, 
            function(error){
                clearTimeout(timer);
                return error;
            });
            
        }
    }

    var setItem = function(key, value) {
        if (supported) {
            var request = {
                id: ++id,
                type: 'set',
                key: key,
                value: value
            },
                data = {
                    request: request
                };
 
            if (_iframeReady) {
                sendRequest(data);
            } else {
                _queue.push(data);
            }
        }
    }


    //Init
    if (!_iframe && supported) 
    {
        _iframe = document.createElement("iframe");
        _iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
        document.body.appendChild(_iframe);

        if (window.addEventListener) {
            _iframe.addEventListener("load", iframeLoaded, false);
            window.addEventListener("message", handleMessage, false);
        } else if (_iframe.attachEvent) {
            _iframe.attachEvent("onload", iframeLoaded, false);
            window.attachEvent("onmessage", handleMessage);
        }
        _iframe.src = _path;
    }
    

    return {
        setItem: setItem,
        getItem: getItem,
        removeItem: removeItem

    }
})();