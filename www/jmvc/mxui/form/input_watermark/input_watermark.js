steal('jquery/controller')
	.then(function($)
{

	/**
	 * Watermark Plugin to allow a input box to have default text and then removed when a user focuses in on the element.
	 */
	$.Controller.extend("MXUI.Form.InputWatermark",
	{
		defaults:
		{
			defaultText: "Enter text here",
			replaceCurrent: false
		}
	},
	{
		/**
		 * Init called by jmvc base controller.  Add some css and set the text.
		 */
		init : function()
		{
			var current = this.element.val();
			if(current == null || current == "" || this.options.replaceCurrent){
				this.element.addClass('blurred default');
				this.element.val(this.options.defaultText);
			}
		},
		
		/**
		 * Resets the input back to orig state.
		 */
		reset:function()
		{
			this.element.val(this.options.defaultText).addClass('blurred default');
		},
		
		/**
		 * Binds on the input box for when it is focused to remove default text and remove the blurred text.
		 * @param {Object} el
		 * @param {Object} ev
		 */
		"focusin" : function(el, ev){
			if(el.val() == this.options.defaultText){
				el.val("");
				el.removeClass('default');
			}
			el.removeClass('blurred');
		},

		/**
		* Binds on the input box for when it is blurred.  
		* Adds the blurred class and inputs the default text if none was provided by the user.
		* @param {Object} el The event target element.
		* @param {Object} ev The event being fired.
		*/
		"focusout" : function(el, ev){
			if(el.val() === ""){
				this.reset();
			}
		}
	});
});
