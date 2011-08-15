steal('jquery/controller', 'jquery/event/drag/limit', 'jquery/dom/dimensions', 'jquery/event/key', 'jquery/event/resize')
	.then('./split.css').then(function( $ ) {

	/**
	 * 
	 * MXUI.Layout.Split is a splitter control that will split two or more elements
	 * and allow the end-user to size the elements using a 'splitter bar'.
	 * 
	 * It allows for floating and absolutely positioned elements ,although, 
	 * floating is higher performance.
	 * 
	 * It tries to auto-detect whether it should be vertical or horizontal but
	 * sometimes it's not able to so you might have to pass the direction in the options.
	 * 
	 * Example Usage:
	 * $('.parent).mxui_layout_split();
	 * <div class='parent'><div class='panel'><div class='panel'></div>
	 * 
	 * API Notes:
	 * 
	 * To hide panels by default, apply the 'hidden' css class to the panel.
	 * 
	 * To make a panel collapsible, apply the 'collapsible' css class to the panel. 
	 * Currently you can't have 2 collasible panels beside each other. 
	 * E.g. <div class='collapsible'><div class='split'><div class='collapsible'> Only one or the other can be collapsible.
	 * 
	 */
	$.Controller.extend("MXUI.Layout.Split", {
		defaults: {
			active: "active",
			hover: "split-hover",
			splitter: "splitter",
			direction: null,
			dragDistance: 5,
			panelClass: null
		},
		listensTo: ["insert", "remove"],
		directionMap: {
			vertical: {
				dim: "width",
				cap: "Width",
				outer: "outerWidth",
				pos: "left",
				dragDir: "horizontal"
			},
			horizontal: {
				dim: "height",
				cap: "Height",
				outer: "outerHeight",
				pos: "top",
				dragDir: "vertical"
			}
		}
	}, {
		/**
		 * Init method called by JMVC base controller.
		 */
		init: function() {
			var c = this.panels();

			//- Determine direction.  
			//- TODO: Figure out better way to measure this since if its floating the panels and the 
			//- width of the combined panels exceeds the parent container, it won't determine this correctly.
			if (!this.options.direction ) {
				this.options.direction = c.eq(0).position().top == c.eq(1).position().top ? "vertical" : "horizontal";
			}

			$.Drag.distance = this.options.dragDistance;
			this.dirs = this.Class.directionMap[this.options.direction];
			this.usingAbsPos = c.eq(0).css('position') == "absolute";
			if(this.usingAbsPos){

				if(!/absolute|relative|fixed/.test(this.element.css('position'))){
					this.element.css('position','relative')
				}
			}
			
			this.initalSetup(c);
		},

		/**
		 * Sizes the split bar and split elements initally.  This is different from size in that fact
		 * that intial size retains the elements widths and resizes what can't fit to be within the parent dims.
		 * @param {Object} c
		 */
		initalSetup: function( c ) {
			//- Insert the splitter bars
			for ( var i = 0; i < c.length - 1; i++ ) {
				var $c = $(c[i]);
				$c.after(this.splitterEl(
				$c.hasClass('collapsible') ? "left" : ($(c[i + 1]).hasClass('collapsible') ? "right" : undefined)));
			}

			var splitters = this.element.children(".splitter")
			splitterDim = splitters[this.dirs.outer](),
				total = this.element[this.dirs.dim]() - splitterDim * (c.length - 1),
				pHeight = this.element.height();


			//- If its vertical, we need to set the height of the split bar
			if ( this.options.direction == "vertical" ) {
				splitters.height(pHeight);
			}

			//- Size the elements				  
			for ( var i = 0; i < c.length; i++ ) {
				var $c = $(c[i]);
				// store in data for faster lookup
				$c.data("split-min-" + this.dirs.dim, parseInt($c.css('min-' + this.dirs.dim)));


				$c.addClass("split");
			}

			this.size();
		},

		/**
		 * Appends a split bar.
		 * @param {Object} dir
		 */
		splitterEl: function( dir ) {
			var splitter = $("<div class='" + this.options.direction.substr(0, 1) + "splitter splitter' tabindex='0'>");

			if ( this.usingAbsPos ) {
				splitter.css("position", "absolute");
			}

			if ( dir ) {
				splitter.append("<a class='" + dir + "-collapse collapser' href='javascript://'></a>")
			}

			return splitter;
		},

		/**
		 * Returns all the panels.
		 */
		panels: function() {
			return this.element.children((this.options.panelClass ? "." + this.options.panelClass : "") + ":not(.splitter):visible")
		},

		/**
		 * Adds hover class to splitter bar.
		 * @param {Object} el
		 * @param {Object} ev
		 */
		".splitter mouseenter": function( el, ev ) {
			if (!this.dragging ) {
				el.addClass(this.options.hover)
			}
		},

		/**
		 * Removes hover class from splitter bar.
		 * @param {Object} el
		 * @param {Object} ev
		 */
		".splitter mouseleave": function( el, ev ) {
			if (!this.dragging ) {
				el.removeClass(this.options.hover)
			}
		},

		/**
		 * For accessibility support, listen to key inputs on the split bar.
		 * @param {Object} el
		 * @param {Object} ev
		 */
		".splitter keydown": function( el, ev ) {
			var offset = el.offset();
			switch ( ev.key() ) {
			case 'right':
				this.moveTo(el, offset.left + 1);
				break;
			case 'left':
				this.moveTo(el, offset.left - 1);
				break;
			case '\r':
				this.toggleCollapse(el);
				break;
			}
		},

		/**
		 * Drag init event for the '.splitter' split bar.
		 * @param {Object} el
		 * @param {Object} ev
		 * @param {Object} drag
		 */
		".splitter draginit": function( el, ev, drag ) {
			drag.noSelection();
			drag.limit(this.element);

			// limit motion to one direction
			drag[this.dirs.dragDir]();
			var hoverClass = this.options.hover;
			el.addClass("move").addClass(this.options.hover);
			this.moveCache = this._makeCache(el);
			
			if(this.moveCache.next.hasClass('collapsed') 
			|| this.moveCache.prev.hasClass('collapsed')){
				el.addClass('disabled');
				drag.cancel();
				
				setTimeout(function(){ el.removeClass('disabled')
										 .removeClass("move")
										 .removeClass(hoverClass); }, 800);
			} else {
				this.dragging = true;
			}
		},

		/**
		 * Internal method for getting the cache info for an element
		 * @param {Object} el
		 */
		_makeCache: function( el ) {
			var next = el.next(),
				prev = el.prev();
			return {
				offset: el.offset()[this.dirs.pos],
				next: next,
				prev: prev,
				nextD: next[this.dirs.dim](),
				prevD: prev[this.dirs.dim]()
			};
		},

		/**
		 * Moves a slider to a specific offset in the page
		 * @param {jQuery} el
		 * @param {Number} newOffset The location in the page in the direction the slider moves
		 * @param {Object} [cache] A cache of dimensions data to make things run faster (esp for drag/drop). It looks like
		 * 
		 *     {
		 *       offset: {top: 200, left: 200},
		 *       prev: 400, // width or height of the previous element
		 *       next: 200  // width or height of the next element
		 *     }
		 * @return {Boolean} false if unable to move
		 */
		moveTo: function( el, newOffset, cache ) {
			cache = cache || this._makeCache(el);

			var prevOffset = cache.offset,
				delta = newOffset - prevOffset || 0,
				prev = cache.prev,
				next = cache.next,
				prevD = cache.prevD,
				nextD = cache.nextD,
				prevMin = prev.data("split-min-" + this.dirs.dim),
				nextMin = next.data("split-min-" + this.dirs.dim);

			// we need to check the 'getting smaller' side
			if ( delta > 0 && (nextD - delta < nextMin) ) {
				return false;
			} else if ( delta < 0 && (prevD + delta < prevMin) ) {
				return false;
			}

			// make sure we can't go smaller than the right's min
			if ( delta > 0 ) {
				next[this.dirs.dim](nextD - delta);
				prev[this.dirs.dim](prevD + delta);
			} else {
				prev[this.dirs.dim](prevD + delta);
				next[this.dirs.dim](nextD - delta);
			}

			if ( this.usingAbsPos ) {
				//- Sets the split bar element's offset relative to parents
				var newOff = $(el).offset();
				newOff[this.dirs.pos] = newOffset;
				el.offset(newOff);
				
				//- Sets the next elements offset relative to parents
				var off = next.offset();
				off[this.dirs.pos] = newOffset + el[this.dirs.outer]();
				next.offset(off);
			}

			// this can / should be throttled
			clearTimeout(this._moveTimer);
			this._moveTimer = setTimeout(function() {
				prev.trigger("resize",[false]);
				next.trigger("resize",[false]);
			}, 1);
		},

		/**
		 * As the split bar is dragged, resize.
		 * @param {Object} el
		 * @param {Object} ev
		 * @param {Object} drag
		 */
		".splitter dragmove": function( el, ev, drag ) {
			var moved = this.moveTo(el, drag.location[this.dirs.pos](), this.moveCache)

			if ( moved === false ) {
				ev.preventDefault();
			}
		},

		/**
		 * Drag end event for the '.splitter' split bar.
		 * @param {Object} el
		 * @param {Object} ev
		 * @param {Object} drag
		 */
		".splitter dragend": function( el, ev, drag ) {
			this.dragging = false;
			el.removeClass(this.options.hover)
			drag.selection();
		},

		/**
		 * Resizes the panels.
		 * @param {Object} el
		 * @param {Object} ev
		 * @param {Object} data
		 */
		resize: function( el, ev, data ) {
			//if not visible do nothing
			if (!this.element.is(":visible") ) {
				this.oldHeight = this.oldWidth = 0;
				return;
			}

			if (!(data && data.force === true) && !this.forceNext ) {
				var h = this.element.height(),
					w = this.element.width()
					if ( this.oldHeight == h && this.oldWidth == w ) {
						ev.stopPropagation();
						return;
					}
					this.oldHeight = h;
				this.oldWidth = w;
			}

			this.forceNext = false;
			this.size(null, null, data && data.keep, false);
		},

		/**
		 * Inserts a new splitter.
		 * @param {Object} el
		 * @param {Object} ev
		 */
		insert: function( el, ev ) {
			ev.stopPropagation();

			if ( ev.target.parentNode != this.element[0] ) {
				return;
			}

			var target = $(ev.target),
				prevElm = target.prev();

			target.addClass("split");
			target.before(this.splitterEl(target.hasClass('collapsible') && "right"));
			this.size(null, true, target);

			if ( this.options.direction == "vertical" ) {
				var splitBar = target.prev(),
					pHeight = this.element.height();

				splitBar.height(pHeight);
				target.height(pHeight);
			}
		},

		/**
		 * If an element is removed from this guy, react to it.
		 * @param {Object} el
		 * @param {Object} ev
		 */
		remove: function( el, ev ) {
			if ( ev.target.parentNode != this.element[0] ) {
				return;
			}

			var target = $(ev.target);

			//remove the splitter before us
			var prev = target.prev(),
				next;
			if ( prev.length && prev.hasClass('splitter') ) {
				prev.remove();
			} else {
				next = target.next();
				if ( next.hasClass('splitter') ) next.remove();
			}

			//what if I am already not visible .. I should note that
			if (!this.element.is(':visible') ) {
				this.forceNext = true;
			}

			this.size(this.panels().not(target), true);

			target.remove();
		},

		/**
		 * Collasper button in split panel was clicked.
		 * @param {Object} el
		 * @param {Object} event
		 */
		".collapser click": function( el, event ) {
			this.toggleCollapse(el.parent());
		},

		/**
		 * Collapses a splitter ..
		 * @param {Object} el
		 */
		toggleCollapse: function( splitBar ) {
			// check the next and prev element should be collapsed
			var prevElm = splitBar.prev(),
				nextElm = splitBar.next(),
				elmToTakeActionOn = (prevElm.hasClass('collapsible') && prevElm) || (nextElm.hasClass('collapsible') && nextElm);
			if (!elmToTakeActionOn ) {
				return;
			}

			if (!elmToTakeActionOn.is(':visible') ) {
				this.showPanel(elmToTakeActionOn);
			} else {
				this.hidePanel(elmToTakeActionOn, true);
			}

			elmToTakeActionOn.toggleClass('collapsed');
			splitBar.children().toggleClass('left-collapse').toggleClass('right-collapse');
		},

		/**
		 * Shows a panel that is currently hidden.
		 * @param {Object} panel
		 * @param {Object} width
		 */
		showPanel: function( panel, width ) {
			if (!panel.is(':visible') ) {

				if ( width ) {
					panel.width(width);
				}

				panel.removeClass('hidden');

				var prevElm = panel.prev();
				if ( prevElm.hasClass('splitter') ) {
					prevElm.removeClass('hidden');
				} else {
					//- if it was hidden by start, it didn't get a 
					//- splitter added so we need to add one here
					panel.before(this.splitterEl(
					prevElm.hasClass('collapsible') ? "left" : (
					panel.hasClass('collapsible') ? "right" : undefined)));
				}

				this.size(null, false, panel);
			}
		},

		/**
		 * Hides a panel that is currently visible.
		 * @param {Object} panel
		 * @param {Object} keepSplitter
		 */
		hidePanel: function( panel, keepSplitter ) {
			if ( panel.is(':visible') || panel.hasClass('collapsed') ) {
				panel.addClass('hidden');

				if (!keepSplitter ) {
					panel.prev().addClass('hidden');
				}

				this.size();
			}
		},

		/**
		 * Takes elements and animates them to the right size
		 * @param {jQuery} [els] child elements
		 * @param {Boolean} [animate] animate the change
		 * @param {jQuery} [keep] keep this element's width / height the same
		 * @param {Boolean} [resizePanels] resize the panels or not.
		 */
		size: function( els, animate, keep, resizePanels ) {
			els = els || this.panels();
			resizePanels = resizePanels == undefined ? true : false;

			var splitters = this.element.children(".splitter:visible"),
				splitterDim = splitters[this.dirs.outer](),
				total = this.element[this.dirs.dim]() - (splitterDim * splitters.length),
				// rounding remainder
				remainder = 0,
				dims = [],
				newDims = [],
				sum = 0,
				i, c$, dim, increase, keepSized = false,
				curLeft = 0,
				index, rawDim, newDim, pHeight = this.element.height(),
				pWidth = this.element.width(),
				length, start;

			//makes els the right height
			if ( keep ) {
				els = els.not(keep);
				total = total - $(keep)[this.dirs.outer]();
			}

			length = els.length;
			start = Math.floor(Math.random() * length);

			// round down b/c some browsers don't like fractional dimensions
			total = Math.floor(total);

			//calculate current percentage of height
			for ( i = 0; i < length; i++ ) {
				$c = $(els[i]), dim = $c[this.dirs.outer](true);
				dims.push(dim);
				sum += dim;
			}

			increase = total / sum;

			// this randomly adjusts sizes so scaling is approximately equal
			for ( i = start; i < length + start; i++ ) {
				index = i >= length ? i - length : i;
				dim = dims[index];
				rawDim = (dim * increase) + remainder;
				newDim = (i == length + start - 1 ? total : Math.round(rawDim));
				newDims[index] = newDim;
				total = total - newDim;
			}

			//resize splitters to new height if vertical (horizontal will automatically be the right width)
			if ( this.options.direction == "vertical" ) {
				splitters.height(pHeight);
			}

			// Adjust widths for each pane and account for rounding
			for ( i = 0; i < length; i++ ) {

				$c = $(els[i]);

				var dim = this.options.direction == "horizontal" ? {
					outerHeight: newDims[i],
					outerWidth: pWidth
				} : {
					outerWidth: newDims[i],
					outerHeight: pHeight
				};

				if ( animate && !this.usingAbsPos ) {
					$c.animate(dim, "fast", function() {

						if ( resizePanels ) {
							$(this).trigger('resize', [false]);
						}

						if ( keep && !keepSized ) {
							keep.trigger('resize', [false])
							keepSized = true;
						}
					});
				}
				else {
					$c.outerHeight(dim.outerHeight).outerWidth(dim.outerWidth);

					if ( resizePanels ) {
						$c.trigger('resize', [false]);
					}
				}

				// adjust positions if absolutely positioned
				if ( this.usingAbsPos ) {
					//set splitter in the right spot
					$c.css(this.dirs.pos, curLeft)
					splitters.eq(i).css(this.dirs.pos, curLeft + newDims[i])
				}

				// move the next location
				curLeft = curLeft + newDims[i] + splitterDim;
			}
		}
	})
})