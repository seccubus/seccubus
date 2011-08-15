steal('jquery/dom/dimensions', 'jquery/event/resize').then(function( $ ) {
	//evil things we should ignore
	var matches = /script|td/,

		// if we are trying to fill the page
		isThePage = function( el ) {
			return el === document || el === document.documentElement || el === window || el === document.body
		},
		//if something lets margins bleed through
		bleeder = function( el ) {
			if ( el[0] == window ) {
				return false;
			}
			var styles = el.curStyles('borderBottomWidth', 'paddingBottom')
			return !parseInt(styles.borderBottomWidth) && !parseInt(styles.paddingBottom)
		},
		//gets the bottom of this element
		bottom = function( el, offset ) {
			//where offsetTop starts
			return el.outerHeight() + offset(el);
		}
		pageOffset = function( el ) {
			return el.offset().top
		},
		offsetTop = function( el ) {
			return el[0].offsetTop;
		},
		inFloat = function( el, parent ) {
			while ( el && el != parent ) {
				var flt = $(el).css('float')
				if ( flt == 'left' || flt == 'right' ) {
					return flt;
				}
				el = el.parentNode
			}
		},
		/**
		 * @function jQuery.fn.mxui_layout_fill
		 * @parent mxui
		 * Fills a parent element's hieght with the jQuery element.
		 * 
		 * @param {Object} options
		 */
		filler = $.fn.mxui_layout_fill = function( options ) {
			options || (options = {});
			options.parent || (options.parent = $(this).parent())
			options.parent = $(options.parent)
			var thePage = isThePage(options.parent[0])
			if ( thePage ) {
				options.parent = $(window)
			}
			var evData = {
				filler: this,
				inFloat: inFloat(this[0], thePage ? document.body : options.parent[0]),
				options: options
			};
			$(options.parent).bind('resize', evData, filler.parentResize);
			//if this element is removed, take it out

			this.bind('destroyed', evData, function( ev ) {
				$(ev.target).removeClass('mxui_filler')
				$(options.parent).unbind('resize', filler.parentResize)
			});

			this.addClass('mxui_filler')
			//add a resize to get things going
			var func = function() {
				//logg("triggering ..")
				//setTimeout(function() {
				options.parent.resize();
				//}, 13)
			}
			if ( $.isReady ) {
				func();
			} else {
				$(func)
			}
			return this;
		};


	$.extend(filler, {
		parentResize: function( ev ) {
			var parent = $(this),
				isWindow = this == window,
				container = (isWindow ? $(document.body) : parent),

				//if the parent bleeds margins, we don't care what the last element's margin is
				isBleeder = bleeder(parent),
				children = container.children().filter(function() {
					if ( matches.test(this.nodeName.toLowerCase()) ) {
						return false;
					}

					var get = $.curStyles(this, ['position', 'display']);
					return get.position !== "absolute" && get.position !== "fixed" && get.display !== "none" && !jQuery.expr.filters.hidden(this)
				}),
				last = children.eq(-1),
				parentHeight = parent.height() - (isWindow ? parseInt(container.css('marginBottom'), 10) || 0 : 0),
				currentSize;

			if ( isBleeder ) {
				//temporarily add a small div to use to figure out the 'bleed-through' margin
				//of the last element
				last = $('<div style="height: 0px; line-height:0px;overflow:hidden;' + (ev.data.inFloat ? 'clear: both' : '') + ';"/>').appendTo(container);
			}

			//for performance, we want to figure out the currently used height of the parent element
			// as quick as possible
			// we can use either offsetTop or offset depending ...
			if ( last && last.length > 0 ) {
				if ( last.offsetParent()[0] === container[0] ) {
					currentSize = last[0].offsetTop + last.outerHeight();
				} else {
					currentSize = last.offset().top - container.offset().top + last.outerHeight()
				}
			}

			// what the difference between the parent height and what we are going to take up is
			var delta = parentHeight - currentSize,
				// the current height of the object
				fillerHeight = ev.data.filler.height();

			//adjust the height
			if ( ev.data.options.all ) {
				// we don't care about anything else ... we are likely absolutely positioned
				//we need to fill the parent width ...
				// temporarily collapse ... then expand ...
				ev.data.filler.height(0).width(0);
				var parentWidth = parent.width(),
					parentHeight = parent.height();

				ev.data.filler.outerHeight(parentHeight);
				ev.data.filler.outerWidth(parentWidth);
			} else {
				ev.data.filler.height(fillerHeight + delta)
			}


			//remove the temporary element
			if ( isBleeder ) {
				last.remove();
			}

			//ev.data.filler.triggerHandler('resize');
		}
	});

})