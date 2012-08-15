// Author:  Jacek Becela
// Source:  http://gist.github.com/399624
// License: MIT

// modified with comments from webxl (see http://gist.github.com/399624)

jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
	return this.each(function() {
	    var clicks = 0, self = this;
	    if ($.browser.msie) { // ie triggers dblclick instead of click if they are fast
	        $(this).bind("dblclick", function(event) {
	            clicks = 2;
	            double_click_callback.call(self, event);
	        });
	        $(this).bind("click", function(event) {
	            setTimeout(function() {
	                if (clicks != 2) {
	                    single_click_callback.call(self, event);
	                }
	                clicks = 0;
	            }, timeout || 300);
	        });
	    } else {
	        $(this).bind("click", function(event) {
	            clicks++;
	            if (clicks == 1) {
	                setTimeout(function() {
	                    if (clicks == 1) {
	                        single_click_callback.call(self, event);
	                    } else {
	                        double_click_callback.call(self, event);
	                    }
	                    clicks = 0;
	                }, timeout || 300);
	            }
	        });
	    }
	});
}
