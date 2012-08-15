steal.plugins('jquery/controller',
	'jquery/model/list/cookie',
	'jquery/view/ejs',
	'jquery/controller/view').then(function($){

/**
 * Provides a cookie-stored list of model instances. 
 * It allows you to remove these items from the list. 
 * @tag controllers, home
 */
$.Controller.extend("Srchr.History",
/* @static */
{
	defaults : {
		//what cookie to store this in
		storeName : "searchHistory",
		//returns html to be displayed for each item on the list
		titleHelper : function(instance){
			return "Item"+instance[instance.Class.id];
		}
	}
},
/* @prototype */
{
	/**
	 * Waits for the page to be loaded
	 */
	init : function(){
		this.instances = new $.Model.List.Cookie([]).retrieve(this.options.storeName);
		this.append(this.instances);
		
	},
	/**
	 * Adds an instance to this list.
	 * @param {Object} newInstance The data to add to the instances list.
	 */
	add : function(newInstance){
		
		if(!this.instances.get(newInstance).length){
			this.instances.push(newInstance);
			this.append([newInstance]);
		}
	},
	
	/**
	 * Add some history entry instances to the list.
	 * @param {Object} instances The instances to add.
	 */
	append : function(instances){
		
		this.element.append(this.view('add',{
			data: instances,
			titleHelper : this.options.titleHelper
		}));
		this.instances.store(this.options.storeName);
	},
	
	/**
	 * Binds the "remove" class on click.  Removes a history entry.
	 * @param {Object} el The history event to remove.
	 * @param {Object} ev The event that was fired.
	 */
	".remove click" : function(el, ev){
		var li = el.closest('li'),
			toBeRemoved = li.model();
		this.instances.remove(toBeRemoved);
		this.instances.store(this.options.storeName);
		
		li.fadeOut(function(){
			li.remove();
		});
		ev.stopImmediatePropagation();
	},
	
	/**
	 * Fires "selected" and passes el.model().
	 * @param {Object} el The history entry that was clicked
	 * @param {Object} ev The event that was fired.
	 */
	"li click" : function(el, ev){
		el.trigger("selected", el.model())
	}
});
	
});