(function( $ ) {
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
		filler = $.fn.mxui_filler = function( options ) {
			options || (options = {});
			options.parent || (options.parent = $(this).parent())
			options.parent = $(options.parent)
			var thePage = isThePage(options.parent[0])
			if ( thePage ) {
				options.parent = $(window)
			}
			var evData = {
				filler: this,
				inFloat: inFloat(this[0], thePage ? document.body : options.parent[0])
			};
			$(options.parent).bind('resize', evData, filler.parentResize);
			//if this element is removed, take it out


			this.bind('destroyed', evData, function( ev ) {
				ev.filler.removeClass('mxui_filler')
				$(options.parent).unbind('resize', filler.parentResize)
			});

			this.addClass('mxui_filler')
			//add a resize to get things going
			var func = function() {
				//logg("triggering ..")
				setTimeout(function() {
					options.parent.triggerHandler("resize");
				}, 13)
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

				offsetParentIsContainer = ev.data.filler.offsetParent()[0] === container[0]
				//if the last element shares our containers offset parent or is the container
				//we can just use offsetTop
				offset = offsetParentIsContainer || last.offsetParent()[0] == container.offsetParent()[0] ? offsetTop : pageOffset;
			//the offset of the container
			firstOffset = offsetParentIsContainer ? 0 : offset(container), parentHeight = parent.height();

			if ( isBleeder ) {
				//temporarily add a small div to use to figure out the 'bleed-through' margin
				//of the last element
				last = $('<div style="height: 0px; line-height:0px;overflow:hidden;' + (ev.data.inFloat ? 'clear: both' : '') + ';"/>')



				.appendTo(container);
			}

			// the current size the content is taking up
			var currentSize = (bottom(last, offset) - 0) - firstOffset,

				// what the difference between the parent height and what we are going to take up is
				delta = parentHeight - currentSize,
				// the current height of the object
				fillerHeight = ev.data.filler.height();

			//adjust the height
			ev.data.filler.height(fillerHeight + delta)

			//remove the temporary element
			if ( isBleeder ) {
				last.remove();
			}
			ev.data.filler.triggerHandler('resize');
		}
	});

})(jQuery)