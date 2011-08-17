steal.plugins('jquery/dom/dimensions').then(function ($) {

    var scrollableParent2 = function (el) {
		
        var parent = el;
        while ((parent = parent.parentNode) && parent != document.body) {
            var $p = $(parent);
			/*
			 * To find the closest scrollable container
			 * we have to take into account not only if the the container 
			 * is scrollable but also if the overflow css property is not
			 * visible or hidden. We also must check if height is not zero.
			 */
            if (parent.scrollHeight > parent.offsetHeight &&
                   $p.height() > 0 &&
                   $.inArray( $p.css("overflow"), ["hidden","visible"]  ) === -1) {
                return $p;
            }
        }
    };

    var fit = function (dropdown, combobox, within, maxHeight, keep) {
        dropdown.css({
            "opacity": 0,
            "height": "",
            "top": "0px",
            "left": "0px"
        });
		/*
		 * After setting opacity to zero we must make
		 * make sure dropdown display property is not "none"
		 * so the offset methods work properly.
		 */		
        dropdown.show();

        var scrollableParent =scrollableParent2(combobox[0]),
				spaceAvailableAbove,
				spaceAvailableBelow,
				belowPosition,
				fitAbove = false,

				comboOff = combobox.offset(),
				comboHeight = combobox.outerHeight(),

				dropHeight = dropdown.outerHeight();

        if (maxHeight) {
            dropHeight = dropHeight > maxHeight ? maxHeight : dropHeight;
            dropdown.height(dropHeight);
        }

        if (scrollableParent) {
            /*
             * If keep option is true dropdown is appended to the scrollable 
             * container. This is because when the dropdown is left next
             * to the combobox, sometimes when it opens it goes off bellow 
             * its container's border.
             */		
            if (keep) {
                dropdown[0].parentNode.removeChild(dropdown[0]);
                scrollableParent.append(dropdown);
            }

            var scrollStyles = scrollableParent.curStyles(
					"borderTopWidth",
					"paddingTop",
					"paddingBottom"
					)

			/*
			 * We must take into account the fact that border
			 * may not be a number.
			 */
            var borderNormalizer = {
                "thin": 1,
                "medium": 2,
                "thick": 4
            },
            borderTopWidth = parseInt(scrollStyles.borderTopWidth);
            borderTopWidth = isNaN(borderTopWidth) ?
                 borderNormalizer[scrollStyles.borderTopWidth] : borderTopWidth;

            var scrollableOff = scrollableParent.offset(),
					scrollTop = scrollableOff.top + borderTopWidth; // + 
            //parseInt(scrollStyles.paddingTop);

            scrollBottom = scrollTop + scrollableParent.height() + parseInt(scrollStyles.paddingTop) +
						parseInt(scrollStyles.paddingBottom);

            spaceAvailableAbove = comboOff.top - scrollTop;
            spaceAvailableBelow = scrollBottom - (comboOff.top + comboHeight);
        } else {
            /*
            * If keep option is true dropdown is appended to the scrollable 
            * container. This is because when the dropdown is left next
            * to the combobox, sometimes when it opens it goes off bellow 
            * its container's border.
            */		
            if (keep) {
                dropdown[0].parentNode.removeChild(dropdown[0]);
                document.body.appendChild(dropdown[0]);
            }

            spaceAvailableAbove = comboOff.top - $(window).scrollTop();
            spaceAvailableBelow = $(window).scrollTop() + $(window).height() - (comboOff.top + comboHeight);
        }
        belowPosition = { top: comboOff.top + comboHeight, left: comboOff.left }

        /* 
         * If the element can be positioned without scrolling below target, draw it.
         * 
		 * We use dropdown.offset(top, left) because dropdown.css(top, left) doesn't position 
		 * the element relative to the document when there are positioned elements
		 * between the dropdown and the document.
		 * 
		 * We use dropdown.css(top,left) if the scrollable parent is the document because 
		 * dropdown.offset(top, left) uses getBoundingClientRect()
		 * and in ie7 this native API returns absurd values sometimes.
		 */
        if (spaceAvailableBelow >= dropHeight) {
			if (!scrollableParent) { // scrollable parent is the document	
				dropdown.css({
					top: belowPosition.top + "px",
					left: belowPosition.left + "px"
				});
			} else {
				dropdown.offset({
					top: belowPosition.top,
					left: belowPosition.left
				});
			}
        } else if (spaceAvailableBelow >= within) {
            // If the element can be positioned with scrolling greater than min height, draw it
            dropdown.outerHeight(spaceAvailableBelow);
            dropdown.css({
                overflow: "auto"
            });
			if (!scrollableParent) { // scrollable parent is the document	
				dropdown.css({
					top: belowPosition.top + "px",
					left: belowPosition.left + "px"
				});
			} else {
				dropdown.offset({
					top: belowPosition.top,
					left: belowPosition.left
				});
			}
        } else if (spaceAvailableAbove > spaceAvailableBelow) {
            // If the space above is greater than the space below, draw it above
            if (spaceAvailableAbove >= dropHeight) {
				if (!scrollableParent) { // scrollable parent is the document	
					dropdown.css({
						top: (comboOff.top - dropHeight) + "px",
						left: comboOff.left + "px"
					});
				} else {
					dropdown.offset({
						top: (comboOff.top - dropHeight),
						left: comboOff.left
					});
				}
            } else {
                //we have to shrink it
                dropdown.outerHeight(spaceAvailableAbove);
                dropdown.css({
                    overflow: "auto"
                });
				if (!scrollableParent) { // scrollable parent is the document	
					dropdown.css({
						top: (comboOff.top - spaceAvailableAbove) + "px",
						left: comboOff.left + "px"
					});
				} else {
					dropdown.offset({
						top: (comboOff.top - spaceAvailableAbove),
						left: comboOff.left
					});
				}
            }
            fitAbove = true;
        } else if (true) {
            //  If the space above is less than the space below, draw it to fit in the space remaining
            dropdown.outerHeight(spaceAvailableBelow);
            dropdown.css({
                overflow: "auto"
            });
			if (!scrollableParent) { // scrollable parent is the document	
				dropdown.css({
					top: belowPosition.top + "px",
					left: belowPosition.left + "px"
				});
			} else {
				dropdown.offset({
					top: belowPosition.top,
					left: belowPosition.left
				});
			}
        }
        dropdown.css("opacity", 1);

        return fitAbove;
    }

    $.fn.mxui_layout_fit = function (options) {
        // check if we have all necessary data before doing the work
        var of = options.of,
				within = options.within,
				maxHeight = options.maxHeight,
                keep = options.keep;

        if (!of || !within) {
            return;
        }

        // make element absolute positioned	
		
        var fitAbove = fit(this, of, within, maxHeight, keep);

		/*
		 * Allow fittable user to detect the dropdown direction
		 * by looking up for "fitAbove" in its $.data. 
		 */
        $.data(this[0], 'fitAbove', fitAbove);

        return this;
    };

});