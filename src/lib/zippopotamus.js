import $ from "jquery";


    var requests = {};
    var zipValid = {
        us: /[0-9]{5}(-[0-9]{4})?/,
        ca: /[ABCEGHJKLMNPRSTVXY] ?\d[A-Za-z]\d[A-Za-z]\d/
    };

 export default function zippopotamus(country, zip, callback){
        // If only zip and callback are given default to US
        if (arguments.length == 2 && typeof arguments[1] == 'function') {
            callback = arguments[1];
            zip = arguments[0];
            country = 'US';
        }

        country = country.toUpperCase();
        // Only make unique requests
        if(!requests[country]) {
            requests[country] = {};
        }
        if(!requests[country][zip]) {
            requests[country][zip] = $.getJSON('http://api.zippopotam.us/' + country + '/' + zip);
        }

        // Bind to the finished request
        requests[country][zip].done(function(data) {
            if (typeof callback == 'function') {
                var place = data['places'][0];
                callback(data['country abbreviation'], place['state'], place['state abbreviation'], place['place name'], zip);
            }
        }) 
	    .error(function() {
	        callback(null);
	    });

        // Allow for binding to the deferred object
        return requests[country][zip];
    };

    $.fn.ziptastic = function( options ) {
        return this.each(function() {
            var ele = $(this);

            ele.on('keyup', function() {
                var zip = ele.val();
                zip = zip.toUpperCase().replace(/\s/g, '');
                // TODO Non-US zip codes?
                if(zipValid.us.test(zip) || zipValid.ca.test(zip)) {
                    $.zippopotamus = (zip, function (country, state, state_short, city) {
                        // Trigger the updated information
                        ele.trigger('zipChange', [country, state, state_short, city, zip]);
                    });
                }
            });
        });
    };
