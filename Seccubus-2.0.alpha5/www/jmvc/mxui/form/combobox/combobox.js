steal.plugins('jquery/controller', 'jquery/lang/json', 'mxui/util/scrollbar_width', 'jquery/event/key')
	.controllers('dropdown','selectable').then(function() {

	/**
	 * @tag home
	 * @class Combobox
	 * @plugin mxui/form/combobox
	 * @test mxui/form/combobox/funcunit.html
	 * 
	 * Combobox progressively enhances an &lt;input&gt; field.  This constructor accepts an Object of [Mxui.Combobox.static.defaults | options] used to customize the Combobox.
	 * 
	 * Features:
	 * 
	 *   * Supports autocompletion filtering.
	 *   * Supports both rich HTML as item content and plain text.
	 *   * Support loading of items via AJAX.
	 *   * Supports "watermark" text - text that is shown as a placeholder until a user makes a selection.
	 *   * Allows the user to make a non-selection.
	 *   * Customizable show/hide animations.
	 * 
	 * @demo mxui/combobox/comboboxdemo1.html
	 * @param {Object} options Options used to customize the Combobox
	 */
	$.Controller.extend("Mxui.Form.Combobox", 
	/* @static */		
	{
		/**
		 * Default setttings for the Combobox.  These can all be overridden.
		 *
		 *   * __classNames__: _String._ When mxui_form_combobox is called on an element, it is wrapped in a div.  The element is given the class that is defined by `classNames`.
		 *   * __filterEnabled__: _Boolean._ Controls whether autocompletion is enabled on the combobox.
		 *   * __displayHTML__: _Boolean._ If true, show the contents of a list item as rich HTML.  If false, show it as plain text.
		 *   * __selectedClassName__: _String._ The class that will be assigned to options that the user focuses on.
		 *   * __activatedClassName__: _String._ The class that will be assigned to options that the user clicks. 
		 *   * __disabledClassName__: _String._ The class that will be assigned to options that are disabled and the user cannot select.
		 *   * __width__: _Number/null._ The width of the Combobox.
		 *   * __emptyItemsText__: _String._ The text that is shown when the Combobox has no items to display.
		 *   * __watermarkText__: _String._ The text to display if there is no option selected.
		 *   * __showNoSelectionOption__: _Boolean._ Lets the user choose to make no selection. 
		 *   * __noSelectionMsg__: _String._ The text to show for a non-selection. 
		 *   * __storeSerializedItem__: _Boolean._ If true, store the attributes of the currently selected item as JSON in a hidden input.  If false, just store the item's &lt;option&gt; value in the hidden input.
		 *   * __nonSerializedAttrs__: _String[]._ A blacklist array of attributes to not store, assuming `storeSerializedItem` is true.
		 *   * __overrideDropdown__: _Boolean._ Determines whether to use the standard Combobox dropdown animation, or the animation function bound to the 'show:dropdown' event.
		 *   * __noItemsMsg__: _String._ Text to show when no items are available in an autocomplete-enabled field.
		 *   * __render__: _Object._ This method defines the HTML that wraps a Combobox item.  To override, initialize the Combobox with a function like so:
		 *   @codestart
		 * 
		 * $("input").mxui_form_combobox({ render : {
		 * 	  'itemTemplate': function(item, val){
		 *      // HTML wrapping logic goes here
		 *    } 
		 * });
		 * 
		 * @codeend
		 * 
		 * Where `item` is the item being drawn, and `val` is the value that the item represents internally. 
		 *   
		 */
		defaults: {
			classNames: "mxui_form_combobox_wrapper",
			
			render: {
				"itemTemplate": function( item , val) {
					if(!val){
						return "<span class='text'>" + item.text + "</span>";
					}else{
                        /*
                         * @hide
                         * We have to make sure autocomplete hightlight
                         * is case insensitive and only highligts words
                         * starting from the first character.
                         */
	                    //var pos = item.text.indexOf(val),
                        var	re = new RegExp( '\\b' + val, 'i' ),
                            pos = item.text.search( re ),
							start = item.text.substr(0, pos),
							end = item.text.substr(pos + val.length);
						return "<span class='text'>" +
							start + "<span class='item-match'>"+
							item.text.substr(pos, val.length)+
							"</span>"+end+
							"</span>";
					}
				}
			},
			/* @hide
			 * maxHeight: 320,*/
			filterEnabled: true,
			/**
			 * @hide
			 * Values to select aren't text but html.  This changes from an input to a 
			 * 'viewbox' element.
			 */
			displayHTML: false,
			selectedClassName: "selected",
			activatedClassName: "activated",
			disabledClassName: "disabled",
			width: null,
			
            /**
             * @hide
			 * Text that displays when no items are in a combo box's drop down.
			 */
			emptyItemsText: "No items available.",
			
			/**
			 * @hide
			 * Text that appears if nothing is selected.
			 */
			watermarkText: "Click for options",

			/**
			 * @hide
			 * Allows a "No Selection" item to be added to the collection.
			 */
			showNoSelectionOption: false,
            
			/**
			 * @hide
			 * When 'showNoSelectionOption' is enabled, you need to give the item a name.
			 */
            noSelectionMsg: "No Selection",
			
			storeSerializedItem: true,
			nonSerializedAttrs: ["id", "activated", "children", "level", "parentId", "forceHidden", "__type"],
			overrideDropdown: false,
			noItemsMsg: "No items available"
		}
	}, 
	/* @prototype */
	{
		/**
		 * @hide
		 * 
		 * Setup re-arranges this input's html
		 * 
		 * Replace `el` with the HTML needed to make Combobox function.  The original DOM element is saved.
		 * 
		 * @param {Object} el The element that Combobox is called upon.
		 * @param {Object} options The options to set on the Controller instance.
		 */
		setup: function( el, options ) {
			//if(!el.length) throw "Combobox initialized without an element"
			if(!el) throw "Combobox initialized without an element"
			el = $(el);
			var name = el.attr("name"),
				id = el.attr("id"),
				div = $("<div><div class='toggle'>&nbsp;</div>" + "<div class='viewbox' tabindex='0' style='display:none'/>" + "<div class='container'></div>" + "<input type='hidden' /></div>"),
				container = div.find('.container');
			this.oldElement = el.replaceWith(div).removeAttr("name");

			//probably should not be removing the id
			div.attr("id", this.oldElement.attr("id"));
			this.oldElement.removeAttr("id");
			container.append(this.oldElement);
			var hidden = div.find("input[type=hidden]")
			hidden.attr("name", name);
			hidden.attr("id", id + "_hf");
			this._super(div, options);

			if ( this.options.displayHTML ) {
				//this.oldElement.width("0");  WHY WAS THIS HERE
				this.oldElement.hide();
				this.find(".viewbox").show();
			}
		},
		
		/**
		 * @hide
		 * 
		 * Initialize the width and initial value of the Combobox, and any values that were passed in `options.items`.
		 */
		init: function() {
			this.element.addClass(this.options.classNames);
			if ( this.options.width ) {
				this.element.width(this.options.width);
			}
			// force default max height
			/* @hide 
			 * if (!this.options.maxHeight ) {
				this.options.maxHeight = this.Class.defaults.maxHeight;
			}*/
			this.currentItem = {
				"value": null
			};
			this.loadData(this.options.items);
			this.resetWatermark();
			//has the value been set already, if it has, we'll throw changes
			this.valueSet = true;
		},
		/**
		 * @hide
		 * 
		 * Set the watermark if there is no text.
		 */
		resetWatermark: function() {
			// zero is a valid value
        	var value = this.val();
            if ((value === null || value === "") &&
             !this.options.showNoSelectionOption && this.options.watermarkText) {
				this.find("input[type='text']").val(this.options.watermarkText);
			}
		},
		/**
		 * @hide
		 * 
		 * Only remove the text if it is the watermarkText.
		 */
		clearWatermark: function() {
			var input = this.find("input[type='text']");
			if ( input.val() == this.options.watermarkText ) {
				input.val("");
			}
		},
		
		/**
		 * Turn the Combobox into a Dropdown.
		 * 
		 * Internally, this creates and caches a mxui\form\_combobox\_dropdown.
		 * 
		 * @return This Controller's instance of mxui_form_combobox_dropdown.
		 */
		dropdown: function() {
			if (!this._dropdown ) {
				this._dropdown = $("<div/>").mxui_form_combobox_dropdown($.extend({parentElement : this.element}, this.options)).hide();
				this.element.after(this._dropdown[0]);

				//if there are items, load
				if ( this.options.items ) {
					this.dropdown().controller().draw(this.modelList);
				}
				this.dropdown().hide();
			}

			return this._dropdown;
		},
		
		/**
		 * Store `items` into the Combobox so that the user can access to them.
		 * 
		 * @param {Object} items The object containing the Combobox items to store.
		 */
		loadData: function( items ) {
			if (!items ) {
				return;
			}
			//convert options to something reusable, and set current if available
			var selected = this.makeModelList(items);
			if ( selected ) {
				this.val(selected.value);
			}
		},
		
		/**
		 * @hide
		 * 
		 * Initializes/empties this Controller's modelList.
		 */
		cleanData: function() {
			// TODO:  Build a test for this.
			this.modeList = []; // TODO: Is this a typo?  Should this be: this.modelList = []; 
		},
		/**
		 * @hide
		 * 
		 * Creates Model instances from an array of `items`.
		 * @param {Array} items The list of items to generate models from.
		 * @return The currently selected item.
		 */
		makeModelList: function( items ) {
			if (!items || items.length === 0 ) {
				this.modelList = [];
				return this.modelList;
			}
			//first flatten
			var data = this.flattenEls(items.slice(0), 0),
				selectedItem, instances = [],
				item;
				
            this.createNoSelectionItem(instances);
							
			for ( var i = 0; i < data.length; i++ ) {
				item = data[i];
				//item.value = parseInt(item.value, 10); CANT DO THIS, VALUES ARENT ALWAYS INTS
				item = $.extend({
					id: i + 1,
					enabled: true,
					children: [],
					level: 0
				}, typeof item == 'string' ? {
					text: item
				} : item);

				// pick initial combobox value
				if ( item.selected ) {
					selectedItem = item;
				}
				instances.push(item);
			}
			this.modelList = instances;
			return selectedItem;
		},
        /**
         * @hide
         * 
         * Adds the "No Selection" entry to the model list
         * @param {Array} list The list of Models.
         */
        createNoSelectionItem:function(list)
        {
            var noSelectionText = this.options.noSelectionMsg;
            var noSelectionEnabled = this.options.showNoSelectionOption;

            var item = {
				id: 0,
				enabled: true,
				children: [],
				level: 0,
                value: null,
                text: noSelectionText,
                forceHidden: !noSelectionEnabled
			};

            //add the item as the first always
            if(!list || list.length > 0)
            {
                var newList = [];
                newList.push(item);

                $.each(list, function(item)
                {
                    newList.push(item);
                });

                list = newList;
            }
            else
            {
                list.push(item);
            }
        },		
		/**
		 * @hide
		 * 
		 * Takes a nested hierarchy of inputted list items, de-nests them, and store them internally (as a linear structure) with a record of the nested state.
		 * @param {Object} list
		 * @param {Object} currentLevel
		 * @param {Object} items
		 */
		flattenEls: function( list, currentLevel, items ) {
			items = items || [];
			currentLevel = currentLevel || 0;
			if (!list || !list.length ) {
				return;
			}
			var item = list.shift(),
				children = item.children;

			item.level = currentLevel;
			items.push(item);

			this.flattenEls(children, currentLevel + 1, items);
			this.flattenEls(list, currentLevel, items);
			return items;
		},
		/**
		 * @hide
		 * 
		 * Called when the Combobox's .viewbox is given focus.
		 * 
		 * @param {HTMLElement} el The element that was focused (`.viewbox`).
		 * @param {Focus Event} ev The event that was fired.
		 */
		".viewbox focusin": function( el, ev ) {
			this._toggleComboboxView(el);
		},
		
		/**
		 * @hide
		 * 
		 * Hides `el` and shows this Combobox's DOM input.
		 * 
		 * @param {HTMLElement} el The element to hide (`.viewbox`).
		 */
		_toggleComboboxView: function( el ) {
			el.hide();
			var input = this.find("input[type='text']");
			input.show();
			input[0].focus();
			input[0].select();
		},
		/**
		 * Animate the dropdown into view.
		 * 
		 * @param {Function} callback The function to execute when the dropdown animation has completed. 
		 */
		showDropdown : function(callback){
			this.clearWatermark()
			this.dropdown().controller().show(callback);
		},
		/**
		 * @hide
		 * 
		 * If the dropdown is currently hidden, show it and then execute the callback.  If it is not hidden, just execute the callback.
		 * 
		 * @param {Function} callback The callback function to execute.
		 */
		showDropdownIfHidden : function(callback){
			if (!this.dropdown().is(":visible") ) {
				this.showDropdown(callback);
				//this.dropdown().children("ul").controller().showSelected();
			}else{
				callback && callback();
			}
		},
		/**
		 * @hide
		 * 
		 * Event that is fired whenever the user releases a key while typing in this Combobox's `input`.
		 * 
		 * Button actions:
		 * 
		 *   * __Esc__: Hides the dropdown.
		 *   * __Down__: Selects the next selectable item.
		 *   * __Up__: Selects the previous selectable item.
		 *   * __Enter__: If the dropdown is visible, select the currently "focused" list item.  If the dropdown is not visible, show it.
		 * 
		 * @param {HTMLInputElement} el The `input` element.
		 * @param {Keyup Event} ev The event that was fired.
		 */
		"input keyup": function( el, ev ) {
			var key = ev.key(),
				selectable = this.dropdown().children("ul").controller();
			
			switch(key){
				
				case "escape" : 
					// close dropdown 
					this.dropdown().controller().hide();
					return false;
				
				case  "down" : 
					// select the first element
					this.showDropdownIfHidden(function(){
						selectable.selectNext();
					});
					
					return;
				
				case "up" : 
					this.showDropdownIfHidden(function(){
						selectable.selectPrev();
					});
					
					return;
				case "enter" : 
					//get the selected element
					if(this.dropdown().is(":visible")){
						var selected = this.dropdown().children("ul").controller().selected();
						this.dropdown().controller().selectElement(selected);
					}else{
						this.showDropdown()
					}
					
					//this.find('input:visible')[0].select();
					return;
				default :
					if(this.options.filterEnabled){
						this.autocomplete(el.val());
					}
			}
		},
		/**
		 * Filters the items in a dropdown based on the what user has typed into the input box.
		 * 
		 * @param {Object} val The value top find matches for.
		 */
		autocomplete: function( val ) {
			// do nothing if we don't have text based list
			if (!this.modelList || !this.modelList[0] || !this.modelList[0].text) {
				return;
			}
			
			var self = this,
				isAutocompleteData = true,	
				noItemsMsg = this.dropdown().find('.noItemsMsg'), 
                matches = this.modelList;
				
            //skip if the value is null or empty string
            if(val && val != "")
            {
			    // list of matches to val & no "No Selection"
                matches = $.grep(this.modelList, function (item) {
					/* @hide
        			 * 1. searches should be case insensitive.
        			 * 2. searches should start with the first letter, 
        			 * not look for anything in the string
        			 * so typing B should only bring up something that starts with B.
        			 */
					var re = new RegExp('\\b' + val, 'i');
                    return (item.text.search(re) > -1) && item.value;
                });
            }
			
			this.dropdown().controller().draw(matches, val);
			
			this.showDropdownIfHidden();
			
			if (!matches.length ) {
				if (!noItemsMsg.length ) {
					this.dropdown().append("<div class='noItemsMsg'>" + this.options.noItemsMsg + "</div>");
				}
			} else {
				if ( noItemsMsg.length ) {
					noItemsMsg.remove();
				}
			}
			
		},	
		
		/**
		 * @hide
		 * 
		 * this is necessary because we want to be able to open the dropdown by clicking the input after an item was selected which means input has focus and dropdown is hidden input focusin doesn't work in this case
		 * 
		 * Calls `focusInputAndShowDropdown`.
		 * 
		 * @param {HTMLInputElement} el The `input` element that `click` was fired on.
		 * @param {Click event} ev The click event that was fired.
		 */
		"input click": function( el, ev ) {
			this.focusInputAndShowDropdown(el);
		},
		
		/**
		 * @hide
		 * 
		 * Calls `focusInputAndShowDropdown`.
		 * 
		 * @param {HTMLInputElement} el The `input` element that `focusin` was fired on.
		 * @param {Click event} ev The `focusin` event that was fired.
		 */
		"input focusin": function( el, ev ) {
			this.focusInputAndShowDropdown(el);
		},

		/**
		 * @hide
		 * 
		 * Gives focus to `el` if possible, and shows this Combobox's dropdown.  Also focuses on the first element.
		 * 
		 * @param {HTMLInputElement} el The input to focus and show the dropdown for.
		 */
		focusInputAndShowDropdown: function( el ) {

			// select all text
			if(el.is(":visible")){ // IE won't let you focus an invisible input
				el[0].focus();
			}
			if (!this.dropdown().is(":visible") ) {
				
				if ( this.options.overrideDropdown ) {
					el.trigger("show:dropdown", this);
				} else {
					//activate current item
					if(this.currentItem){
						var current = this.dropdown().controller()._getEl(this.currentItem.item);
						if(current.length){
							this.dropdown().controller().list.controller().selected(current, false);
						}
					}
					this.showDropdown();
				}
				setTimeout(function() {
					el[0].select();
				});
			}
			
		},
		
		/**
		 * Fetches all items based on matching key-value pairs, where `attr` is the key and `value` is the value.
		 * 
		 * @param {String} attr The key to inspect the value of.
		 * @param {String} value The value to test `attr` against.
		 * 
		 * @return {Array} A collection of Objects that match `value` for `attr`.
		 */
		modelListMatches: function( attr, value ) {
			return $.grep(this.modelList, function( item ) {
				return item[attr] == value;
			});
		},
		
		/**
		 * @hide
		 * Hides the standard DOM `input` element and shows the `.viewbox` element.  Also fills `.viewbox`.
		 * 
		 * @param {HTML} The HTML code to fill `.viewbox` with.
		 */
		_setViewboxHtmlAndShow: function( html ) {

			if ( this.options.displayHTML ) {
				this.find("input[type=text]").hide();
				this.find(".viewbox").show().html(html || "");
			}
		},
		".toggle click": function( el, ev ) {
			if ( this.dropdown().is(":visible") ) {
				this.dropdown().controller().hide();
			} else {
				this.focusInputAndShowDropdown(this.find("input[type=text]"));
			}

			var viewbox = this.find(".viewbox");
			if ( viewbox.is(":visible") ) {
				this._toggleComboboxView(viewbox);
			}
		},
		
		/**
		 * @hide
		 * 
		 * Clears the blur timeout that was set in `focusout`.
		 * 
		 * @param {HTMLInputElement} el The element that was focused
		 * @param {focusEvent} ev The focus event that was fired.
		 * 
		 */
		focusin: function( el, ev ) {            
			clearTimeout(this.closeDropdownOnBlurTimeout);
		},
		/**
		 * @hide
		 * 
		 * If the user clicks outside of this element, set a timeout to blur it.  A timeout is used because it ensures that the input isn't blurred if the user clicks on a window scrollbar.
		 * 
		 * @param {HTMLElement} el The element that was blurred
		 * @param {focusoutEvent} ev The `focusout` event that was fired.
		 */
		focusout: function( el, ev ) {
			if ( this.dropdown().is(":hidden") ) {
				return;
			}
			/* @hide
	         * Trick to make dropdown close when combobox looses focus
	         * Bug: input looses focus on scroll bar click in IE, Chrome and Safari
	         * Fix inspired in:
	         * http://stackoverflow.com/questions/2284541/form-input-loses-focus-on-scroll-bar-click-in-ie
	         */
			this.closeDropdownOnBlurTimeout = setTimeout(this.callback('blurred'), 100);
		},
		
		/**
		 * @hide
		 * 
		 * Set the viewbox with the currently selected item's content.
		 */
		blurred : function(){
			//set current item as content / value
			if ( this.currentItem.item ) {
				// update viewbox with current item html
				this._setViewboxHtmlAndShow(this.options.render.itemTemplate(this.currentItem.item));
			}
			this.dropdown().controller().hide();
		},
		/**
		 * @hide
		 * 
		 * Internet Explorer interprets two fast clicks in a row as one single-click, 
	     * followed by one double-click, while the other browsers interpret it as 
	     * two single-clicks and a double-click.
	     * And, IE has a very long time that it will count 2 clicks as a dblclick.
	     * Taken together, the user might click the toggle twice and not really be dblclicking.
		 * 
		 * @param {HTMLInputElement} el The element that was `dblclick`ed.
		 */
		".toggle dblclick": function( el ) {
			if ( $.browser.msie ) {
				if(this.dropdown().is(":visible")){
					this.dropdown().controller().hide()
				}else{
					this.showDropdown()
				}
				this.focusInputAndShowDropdown(this.find("input[type=text]"));
			}
		},
		
		/**
		 * @hide
		 * 
		 * Remove the Combobox from the DOM and replace it with the original DOM element and unbind all events.
		 */
		destroy: function() {
			this.dropdown()
				.stop()
				.remove();
				
			this._dropdown = null;
			this.modelList = null;
			this.oldElementName = null;
			var me = this.element; //save a reference
			this._super(); //unbind everything
			me.replaceWith(this.oldElement); //replace with old
			this.oldElement = null; //make sure we can't touch old            
		},


		/********************************
		 *		Combobox Public API		*
		 ********************************/
		/**
		 * Retrieves the text value of the currently selected item.
		 * 
		 * @return {String} The currently selected value.
		 */
		textVal: function() {
			return this.find("input[type=text]").val();
		},
		/**
		 * 
		 * If `value` is not supplied, the current value of the Combobox is returned.  If `value` is supplied, the new value is set (assuming the Combobox contains it).
		 * 
		 * This does not simulate a user click, which means the selected item won't get highlighted in the dropdown.  For that, use `selectItem`.
		 * 
		 * @param {String} value the new combobox value
		 * @return {Object} If no input parameter this returns the current item value
		 */
		val: function( value ) {
			if ( value === undefined ) {
				return this.currentItem.value;
			}

			var item = this.modelListMatches("value", value)[0];
			if ( item ) {
				var html = this.options.render.itemTemplate(item);
				if ( this.currentItem.item ) {
					this.currentItem.item.activated = false;
				}
				this.currentItem = {
					"value": item.value,
					"item": item,
					"html": html
				};
				item.activated = true;
                
				// value can ve null (No Select item) and in that
				// case input box must be empty
				if (item.value != null) {
				    this.oldElement[0].value = item.text;
                } else {
				    this.oldElement[0].value = "";
                }

				if ( this.options.displayHTML ) {
					this._setViewboxHtmlAndShow(html);
				}

				// bind values to the hidden input
				if ( this.options.storeSerializedItem ) {
					// (clone current item so we can remove fields  
					// that are not relevant for the postback)
					var clone = $.extend({}, this.currentItem.item);
					for ( var field in clone ) {
						if ( $.inArray(field, this.options.nonSerializedAttrs) > -1 ) {
							delete clone[field];
						}
					}
					this.find("input[type=hidden]")[0].value = $.toJSON(clone);
				} else { // just store the value
					this.find("input[type=hidden]")[0].value = this.currentItem.value;
				}

				//if we have a dropdown ... update it
				if ( this._dropdown ) {
					this.dropdown().controller().draw(this.modelList);
				}

	            if (this.valueSet) {
					this.element.trigger("change", this.currentItem.value);
				}
			}
		},
		/**
		 * @hide
		 * 
		 * Prevent IE's default change event.
		 * 
		 * @param {HTMLInputElement} el The element the event was fired upon.
		 * @param {changeEvent} ev The event that was fired.
		 */ 
		'input change': function(el, ev){
			ev.stopImmediatePropagation();
		},
		/**
		 * Programmatically selects and highlights an item.
		 * 
		 * @param {String} value The new combobox value
		 */
		selectItem: function( value ) {
			var item = this.modelListMatches("value", value)[0];
			if ( item ) {
				item.forceHidden = false;
				// delegate item selection on dropdown				
				this.dropdown().controller().selectItem(item);
			}
		},
		/**
		 * Clears Combobox's current selection.
		 */
		clearSelection: function() {
			if ( this.currentItem.item ) {
				this.find("input[type='text']").val("");
				// let dropdown handle element style cleaning
				this.dropdown().controller().clearSelection(this.currentItem.item);
				// delete current element references
				this.currentItem = {
					"value": null,
					"item": null,
					"html": null
				};
			}
		},
		/**
		 * Looks up the item that matches `value`.
		 * 
		 * @param {String} value Value of the item to be returned.
		 * @return {Object|null} Returns the first item with a `value` attribute that matches the parameter `value`.  If the item is not found, this returns `null`.	
		 */
		getItem: function( value ) {
			var item = this.modelListMatches("value", value)[0];
			if ( item ) {
				return item;
			}
			return null;
		},
		/**
		 * Returns the list of items loaded into combobox.
		 * 
		 * @return {Array} Returns the Object list of items loaded into combobox, or a new Array if nothing was loaded.
		 */
		getItems: function() {
			return this.modelList || [];
		},
		// This method should probably be under mxui/form/combobox/ajax.
		/**
		 * Forces the Ajax Combobox to fetch data from the server.
		 * 
		 * @param {Function} callback The callback to be triggered after items are loaded into Combobox. 
		 */
		populateItems: function( callback ) {
			this.find("input[type='text']").trigger("show:dropdown", [this, callback]);
		},
		/**
		 * Finds an array of Combobox item `value`s where the `text` property contains the string defined in the `text` argument.
		 * 
		 * This is an API to return filtered data from Combobox's autocomplete.
		 * 
		 * @param {String} text Query string to serve as filter for autocomplete.
		 * @return {Array} An array of strings. 	
		 * 
		 * @codestart
		 * $("#combobox_demo").mxui_form_combobox({

			items: [{ value: "1", text: "hola", enabled: "true", selected: true,
				children: [  { value: "5", text: "chicago", enabled: "true", children: [] },
					{ value: "6", text: "kansas", enabled: "true", 
						children: [ { value: "7", text: "losangeles", enabled: "true", children: [] } ] } ] }
					
					] });
					
			var result = $("#combobox_demo").controller().query('los');
			
			// result is "7"
			
		 * @codeend
		 */
		query: function( text ) {
			var matches = $.grep(this.modelList, function( item ) {
				return item.text.indexOf(text) > -1;
			});
			var results = [];
			for ( var i = 0; i < matches.length; i++ ) {
				results.push(matches[i].value);
			}
			return results;
		},
         /**
          * @hide
          * 
          * Shows/Hides "No Selection" option in the dropdown list.
		  * @param {Boolean} value Whether to show the noSelectionOption or not.
		  */
         enableNoSelection: function(value)
         {
            this.options.showNoSelectionOption = value;

            //AJAX scenario might not have the list yet so we wouldn't need to add or remove it then
            if(this.modelList && this.modelList.length > 0)
            {
                if(value)
                {
                    this.showItem(null);
                }
                else
                {
                    this.hideItem(null);
                }
            }
         },		
		/**
		 * Show the item who's `value` attribute matches the parameter `value`.
		 * 
		 * @param {String} value Value of the item that will be made visible.
		 */
		showItem: function( value ) {
			var item = this.modelListMatches("value", value)[0];
			if ( item ) {
				// delegate show/hide items on dropdown_controller				
				this.dropdown().controller().showItem(item);
				item.forceHidden = false;
			}
		},
		/**
		 * Hides an item from view.
		 * 
		 * @param {String} value Value of the item that will be hidden.
		 */
		hideItem: function( value ) {
			var item = this.modelListMatches("value", value)[0];
			if ( item ) {
				if ( this.currentItem.item && item.value === this.currentItem.item.value ) {
					this.clearSelection();
				}
				// delegate show/hide items on dropdown_controller					
				this.dropdown().controller().hideItem(item);
				item.forceHidden = true;
			}
		},
		
		/**
		 * Sets the state of a dropdown item to "enabled."  This allows the user to select it.
		 * 
		 * @param {String} value Value of the item that will be enabled.
		 */
		enable: function( value ) {
			var item = this.modelListMatches("value", value)[0];
			if ( item ) {
				item.enabled = true;
				this.dropdown().controller().enable(item);
			}
		},
		
		/**
		 * Sets the state of a dropdown item to "disabled."  This prevents the user from selecting it.
		 * 
		 * @param {String} value Value of the item that will be disabled.
		 */
		disable: function( value ) {
			var item = this.modelListMatches("value", value)[0];
			if ( item ) {
				item.enabled = false;
				item.activated = false;
				this.dropdown().controller().disable(item);
			}
		}
	});
});