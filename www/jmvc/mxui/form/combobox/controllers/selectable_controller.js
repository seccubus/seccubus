$.fn.scrollableParent = function(){
	var el = this[0],
		parent = el;
	while( ( parent = parent.parentNode ) && parent != document.body){
		if(parent.scrollHeight != parent.offsetHeight){
			return $(parent);
		}
	}
}

/**
 * Maintains a selectable behavior
 */
$.Controller.extend("Mxui.Form.Combobox.Controllers.Selectable",{
    defaults : {
        selectableClassName: "selectable",
        selectedClassName : "selected",
        activatedClassName : "activated"
    }
},{
	".{selectableClassName} mouseenter": function(el, ev){
		this.selected(el, false);
    },
	".{selectableClassName} deselect" : function(el, ev){
		el.removeClass( this.options.selectedClassName );
	},
	showSelected : function(el){
		el = el || this.selected();
		if(!el.length){
			return;
		}
		var scrollParent = el.scrollableParent(),
			scrollOff = scrollParent.offset(),
			scrollTop = scrollParent[0].scrollHeight,
			clientHeight = scrollParent[0].clientHeight,
			pos = el.offset(),
			scrollUp = scrollOff.top - pos.top,
			scrollDown = pos.top + el.outerHeight()  - (scrollOff.top + clientHeight);
		
		if( scrollUp > 0   ){
			//console.log('scroll up')
			scrollParent.scrollTop( scrollParent.scrollTop() - scrollUp  )
		}else if( scrollDown > 0 ) {
			
			scrollParent.scrollTop( scrollParent.scrollTop() + scrollDown  )
		}
	},
	selected : function(el, autoFocus){
		var oldSelected = 
			this._selected && this._selected.hasClass(this.options.selectedClassName) ?
			this._selected :
			(this._selected = this.element.find("."+this.options.selectedClassName) )
		
		if(!el){
			return oldSelected;
		}else{
			el = $(el)
			oldSelected.trigger("deselect");
			this._selected = el.addClass( this.options.selectedClassName );
			
			if(autoFocus !== false){
				this.showSelected(el)
			}
			
			
			
			el.trigger("select");
		}
	},
	cache : function(){
		this._cache = this.element.find("."+this.options.selectableClassName);
	},
	selectable : function(){
		return this._cache ?
				this._cache.filter(":visible") :
				this.element.find("."+this.options.selectableClassName+":visible")
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
        el = el && el.length ? el : this.selected();
		
        if (!el.length || el[0] == last[0]) {
            return this.selected(first);
        }
            
        var nextEl;
        for(var i=0;i<els.length;i++) {
            if(el[0] == els[i]) {
                nextEl =  els[i + 1];
                break;
            }
        }
		this.selected(nextEl || first);
		return nextEl;
    },
    selectPrev: function(el){
        var els = this.selectable(),
			first = els.eq(0),
            last = els.eq(-1);
        el = el && el.length ? el : this.selected();
		
        if (!el.length && el[0] == last[0]) {
            return this.selected(last);
        }

        var prevEl;
        for(var i=0;i<els.length;i++) {
            if(el[0] == els[i]) {
                prevEl = els[i - 1];
                break;
            }
        }
		this.selected(prevEl || last); 
		return prevEl;                 
    }
})
