steal('jquery').then(function($){
	/**
	 * Wraps an element with another element .. returns new element
	 */
	var tags = /canvas|textarea|input|select|button|img/i
	$.fn.mxui_layout_wrap = function(){
		var ret = [];
		this.each(function(){
			if(this.nodeName.match(tags)) {
				var $el = $(this),
				    $org =  $el
				//Opera fix for relative positioning
				if (/relative/.test($el.css('position')) && $.browser.opera)
					$el.css({ position: 'relative', top: 'auto', left: 'auto' });
	
				//Create a wrapper element and set the wrapper to the new current internal element
				var position = $el.css('position')
				$el.wrap(
					$('<div class="ui-wrapper"></div>').css({
						position: position == 'static' ? "relative" : position,
						width: $el.outerWidth(),
						height: $el.outerHeight(),
						top: $el.css('top'),
						left: $el.css('left')
					})
				);
			
				//Overwrite the original $el
				$el = $el.parent()
	
				$elIsWrapper = true;
	
				//Move margins to the wrapper
				$el.css({ marginLeft: $org.css("marginLeft"), marginTop: $org.css("marginTop"), marginRight: $org.css("marginRight"), marginBottom: $org.css("marginBottom") });
				$org.css({ marginLeft: "0px", marginTop: "0px", marginRight: "0px", marginBottom: "0px"});
	
				//Prevent Safari textarea resize
				//this.originalResizeStyle = $org.css('resize');
				//$org.css('resize', 'none');
	
				//Push the actual element to our proportionallyResize internal array
				//$org.css({ position: 'static', zoom: 1, display: 'block' })
				//this._proportionallyResizeElements.push();
	
				// avoid IE jump (hard set the margin)
				//$org.css({ margin: $org.css('margin') });
	
				// fix handlers offset
				//this._proportionallyResize();
				ret.push($el)
			}else{
				ret.push(this)
			}
			
		})
		
		return $(ret);
		
		
		
	}
	
})
