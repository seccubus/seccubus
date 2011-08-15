steal('jquery/controller')
     .then(function(){
         $.Controller.extend("Mxui.ModelHookup",{
        },
        {
            init : function(){
                this.model = this.options.model;
                this.origAttrs = $.extend(true, {}, this.model.attrs());
            },
            change : function(el, ev){
                var name = $(ev.target).attr('name');
                var value = $(ev.target).val();
                if(name) {
                	var oldValue = this.model.attr(name);
                    this.model.attr(name, value);
                    this.handleValueChange(el, ev, name, oldValue, value);
                }
            },
            handleValueChange : function(el, ev, name, oldValue, newValue){
                if(newValue != oldValue && newValue != this.origAttrs[name]) $(ev.target).trigger('dirty');
                if(newValue != oldValue && newValue == this.origAttrs[name]) $(ev.target).trigger('clean');
                // in case the original model attribute was undefined
                if(newValue != oldValue && newValue == "" && !this.origAttrs[name]) $(ev.target).trigger('clean');
            }
        })
        
     })