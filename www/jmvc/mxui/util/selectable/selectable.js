steal.plugins('jquery/controller', 
	'jquery/event/key')
     .then(function(){

//we have to clear out activate
$.event.special.activate = {
	setup : function(){return true},
	teardown : function(){return true}
}

/**
 * Provides keyboard and mouse selection and multi selection to a group of items.
 * Instead of listening to click and key events, you can add selectable and listen to
 * activate and select events.
 * 
 * Selectable also provides multi-selection and activation with the shift and ctrl key.
 * It also adds a 'selected' and 'activated' className.
 * 
 * ## Use
 * 
 * Instead of listening to hover, focus, click and keypress, listen to select
 * and activate.  Select happens when a user focuses on an element or 
 * moves the mouse over the element.  
 * 
 *     $('#list').mxui_selectable()
 *     ;
 */
$.Controller.extend('Mxui.Util.Selectable',{
	/**
	 * @attribute defaults
	 * 
	 * . selectOn - The element to 
	 */
    defaults : {
        // what can be selected
		selectOn: "[tabindex]",
		// what class is selected
        selectedClassName : "selected",
		// 
        activatedClassName : "activated",
		multiActivate: true,
		// caches 
		cache : false
    }
},
{
    //initializing does nothings
	init: function() {
		this.lastSelected = null;
    },
    "{selectOn} mouseenter": function(el, ev){
        this._select(el, false);
    },
	"{selectOn} mouseleave" : function(el, ev){
		if(!this._focused || el[0] !== this._focused[0]){ //make sure it's deselected
			this._getSelected().trigger("deselect");
		}
	},
	_getSelected : function(){
		return this._selected && this._selected.hasClass(this.options.selectedClassName) ?
			this._selected :
			(this._selected = this.element.find("."+this.options.selectedClassName) )
	},
	/**
	 * Gets or sets the selected element
	 * @param {Object} el
	 * @param {Object} autoFocus
	 */
	_select : function(el, autoFocus){
		// get old selected
		var oldSelected = this._getSelected();
		
		// if getter
		if(!el){
			return oldSelected;
		}else{
			//we are setting ...
			el = $(el);
			// deselect old
			oldSelected.trigger("deselect");
			
			// set new selected
			this._selected = el.addClass( this.options.selectedClassName );
			
			// if we should focus
			if(autoFocus !== false){
				this.showSelected(el)
			}
			
			//add select event
			el.trigger("select", el.model && el.model());
		}
	},
	// shows the selected
	showSelected : function(el){
		el[0].focus()
	},
	/**
	 * 
	 * @param {Object} el
	 * @param {Object} ev
	 */
	_activate : function(el, ev){
		// if we should only select on element ...
		if(!this.options.multiActivate || (!ev.shiftKey && !ev.ctrlKey)){
			// remove the old activated ...
			this.element
				.find("." + this.options.activatedClassName)
				.trigger('deactivate');
			
			// activate the new one
			
			el.trigger("activate", el.models ? [el.models()] : undefined);
			
		}else if(ev.ctrlKey){ // if we add to the 'activated' list
			
			// Toggle
			if(el.hasClass(this.options.activatedClassName)){
				el.trigger("deactivate");
			}else{
				var activated = this.find("."+this.options.activatedClassName);
				if(el.models){
					el.trigger("activate", [ activated.add(el).models() ]);
				}else{
					el.trigger("activate");
				}
				
			}
		}else if(ev.shiftKey){
			
			// Find everything between and activate
			var selectable = this.element.find( this.options.selectOn+":visible"),
				found = false,
				lastSelected= this.lastSelected,
				activated = $().add(el).add(lastSelected);
				
			if(lastSelected.length && lastSelected[0] != el[0]){
				for(var i =0; i < selectable.length;i++){
					var select = selectable[i];
					if( select ===  lastSelected[0] || select == el[0] ){
						if(!found){
							found = true;
						}else{
							break;
						}
					}else if(found){
						activated.push(select)
					}
				}
			}
			activated.addClass(this.options.activatedClassName)
			el.trigger("activate",el.models ? 
					[activated.models()] :
					undefined);
		}
	},
	
    "{selectOn} click": function(el, ev){
		this._activate(el, ev);
		
    },
    "{selectOn} focusin": function(el, ev){
        this._select(el, false);
		this._focused = el;
    },
	"{selectOn} focusout": function(el, ev){
		this._focused = null;
    },
    "{selectOn} activate": function(el, ev, keys){
        // if event is synthetic (not IE native activate event)
		el.addClass(this.options.activatedClassName);
		this.lastSelected = el;
		
    },
    "{selectOn} deactivate": function(el, ev){
        // if event is synthetic (not IE native deactivate event)
        if (!ev.originalEvent) {
			el.removeClass(this.options.activatedClassName);
		}
    },
    "{selectOn} select" : function(el, ev){
       
		var selected = this.element.find( "."+this.options.selectedClassName );
        if (selected.length) {
            selected.trigger('deselect');
        }
        el.addClass( this.options.selectedClassName );
    },
    "{selectOn} deselect": function(el, ev){
        el.removeClass( this.options.selectedClassName );
    },
    "{selectOn} keydown": function(el, ev){
        var key = ev.key()
        if(key == "down"){
			this.selectNext(el);
			ev.preventDefault()
		}else if(key == "up") {
			this.selectPrev(el);
			ev.preventDefault()
		}else  if(key == "\r") {
			this._activate(el, ev);
		}
    },
	cache : function(){
		this._cache = this.element.find(this.options.selectOn);
	},
	selectable : function(){
		return this._cache ?
				this._cache.filter(":visible") :
				this.element.find(this.options.selectOn+":visible")
	},
	
    /**
	 * Selects the next element
	 * if an element is provided, select the first after the element
	 * if an element is not provided, selects after the current.  If
	 * there is no current, selects the first.
	 * @param {Object} el
	 */
    selectNext: function(el){
        var els = this.selectable(),
			first = els.eq(0),
            last = els.eq(-1);
        el = el && el.length ? el : this._select();
		
        if (!el.length || el[0] == last[0]) {
            return this._select(first);
        }
            
        var nextEl;
        for(var i=0;i<els.length;i++) {
            if(el[0] == els[i]) {
                nextEl =  els[i + 1];
                break;
            }
        }
		this._select(nextEl || first, true);
		return nextEl;
    },
    selectPrev: function(el){
        var els = this.selectable(),
			first = els.eq(0),
            last = els.eq(-1);
        el = el && el.length ? el : this._select();
		
        if (!el.length && el[0] == last[0]) {
            return this._select(last);
        }

        var prevEl;
        for(var i=0;i<els.length;i++) {
            if(el[0] == els[i]) {
                prevEl = els[i - 1];
                break;
            }
        }
		this._select(prevEl || last, true); 
		return prevEl;                 
    }
});

})
