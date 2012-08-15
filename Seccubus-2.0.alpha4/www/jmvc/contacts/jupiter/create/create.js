steal.plugins('jquery/controller/view', 
	'jquery/view/ejs', 
	'jquery/dom/form_params',
	'mxui/util/keycode')
	.css('create')
	.then(function($){

/**
 * @class Jupiter.Create
 */
$.Controller('Jupiter.Create',
/* @Static */
{
	defaults : {
		model : null,
		insertInto : null,
		form: null
	}
},
/* @Prototype */
{
	init : function(){
		this.element.html(this.view());
		this.forms = $([]);
	},
	'.createbutton click': function(){
		var form = $($.View(this.options.form, {})).prependTo(this.options.insertInto);
		this.forms = this.forms.add(form);
		this.element.hide();
	},
	"{insertInto} form keyup": function(el, ev){
		if($.keycode(ev, "enter")){ // user hit enter
			this.options.insertInto.find("form").submit();
		}
	},
	"{insertInto} form submit": function(el, ev){
		ev.preventDefault()
		var params = el.formParams();
		var item = new this.options.model(params);
		item.save();
		this.forms.remove();
		this.forms = $([]);
		this.element.show();
	}
})

});