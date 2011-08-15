steal('jquery/controller/subscribe',
			  'jquery/view/ejs')
	 .then('./views/list.ejs').then(function($){

//helper determines if identical params
var same = function(a, b){
    a = $.extend({},a);
    for(var name in b){
        if(b[name] != a[name]){
            return false;
        }else{
            delete a[name];
        }
    }
    //there should be nothing left in a
    for(var name in a){
        return false;
    }
    return true;
}

/**
 * A reusable list widget
 */
$.Controller('Mxui.Data.List',
{
    defaults : {
        model : null,
        activateEvent : "click",
        list : "//mxui/data/list/views/list.ejs",
        show : null,
        params : {},
        className : "",
        // provide if you don't need to make a query
        items: null,
        callback : null,
		// function to sort with
		sort: null,
		// callback for when an item is updated
		updated: null,
		remove: null,
		insert: null, 
		// what each row should be wrapped with
		nodeType: "li"
    }
},
{
    init : function(){
        this.update();
    },
    update : function(options){
        // if the params are the exact same, don't query
        var oldParams = $.extend({},this.options.params);
        this._super(options || {});
        if(options && same(oldParams, this.options.params)){ //cache?
            this.options.callback && this.options.callback(this.items)
        }else{
            this.draw();
        }
    },
    draw : function(){
        if(this.options.items){
            this.list(this.options.items);
        }else{
            this.options.model.findAll(this.options.params, this.callback('list'))
        }
    },
    list : function(items){
        this.element.html(this.options.list,{
            items : this.options.sort ? items.sort(this.options.sort) : items,
            options: this.options
        });
        this.items = items;
        this.options.callback && this.options.callback(items)
    },
    ".item {activateEvent}" : function(el, ev){
		if(el.hasClass("activated")){
			this._deactivate(el)
		} else {
			var old = this.find(".activated");
			this._deactivate(old);
			this._activate(el);
		}
	},
	_deactivate: function(el){
		el.removeClass("activated");
		el.trigger("deactivate", el.model());
	},
	_activate: function(el){
		el.addClass("activated");
		el.trigger("activate", el.model());
	},
    /**
     * Listen for updates and replace the text of the list
     * @param {Object} called
     * @param {Object} item
     */
    "{model._shortName}.updated subscribe" : function(called, item){
        var el = item.elements(this.element).html(this.options.show, item);
        if(this.options.updated){
            this.options.updated(this.element, el, item)
        }
    },
    "{model._shortName}.created subscribe" : function(called, item){
        var newEl = $($.View(this.options.list,{
            items : [item],
            options: this.options
        })).hide()
        if(this.options.insert){
            this.options.insert(this.element, newEl, item)
        }else{
            newEl.appendTo(this.element).slideDown();
        }
        
        //needs to add to items
        //this.element.append().hide().slideDown();
    },
    "{model._shortName}.destroyed subscribe" : function(called, item){
        var el = item.elements(this.element)
        if(this.options.remove){
            this.options.remove(this.element,el, item)
        }else{
            el.slideUp( function(){
                el.remove();
            })
        }
    }
})

});