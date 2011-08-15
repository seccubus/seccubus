steal('mxui/data/grid')
     .resources()
     .models()
     .controllers()
     .views()
     .then(function($){

    Mxui.Grid.extend("Mxui.Data.Grid.Tree",{
        defaults: {
            indentedColumn: null
        }
    },
    {
        init : function(){
            var indentedColumn = this.options.indentedColumn;
            
            if(this.options.render && this.options.render[indentedColumn]){
                var oldRender = this.options.render[indentedColumn];
                
                this.options.render[indentedColumn] = function(instance){
                    var content = [];
            
			         content.push('<span ');
                     if (instance.childCount) {
					 	content.push('class="expand ui-icon ui-icon-triangle-1-e" ');
					 } else {
						content.push('class="ui-icon ui-icon-document" ');					 	
					 }
                     content.push('style="float: left; margin-left: ',
					 				instance.depth * 20,
									'px; display: block;height:13px;">',
									'</span>',
									oldRender.apply(this, arguments));
                     return content.join("");
                }
            }
            
            this._super(this.element[0], this.options)
        },
        
        ".expand click" : function(el, ev){
            var tr = el.closest("tr");
            var children = tr.data("children"); 
            if (!children || !children.length) {
                this.options.model.findAll({
                    parentId: tr.model().id
                }, this.callback('foundChildren', el));
                return;
            }
            
            tr.after("//mxui/grid/tree/views/rows.ejs", {
                options: this.options,
                children: children,
                parent: tr.model()
            });            
            
          tr.find(".ui-icon").removeClass("ui-icon-triangle-1-e expand").addClass("ui-icon-triangle-1-s collapse");                
        },
        
        ".collapse click" : function(el, ev){
            var tr = el.closest("tr");
            this.removeSubTree(tr);
            
            tr.find(".ui-icon").removeClass("ui-icon-triangle-1-s collapse").addClass("ui-icon-triangle-1-e expand");            
        },
        
        removeSubTree : function(tr){
            var self = this;
            var childrenEls = tr.data ? tr.data("childrenEls") : $(tr).data("childrenEls");
            if (childrenEls) {
                $.each(childrenEls, function(i, el){
                    self.removeSubTree(el);
	                $(el).remove();
                })
            }
        },
        
        foundChildren : function(el, children){ 
            var self = this;
            
            var tr = el.closest("tr");
            var parentEl, parentId, parentMatch = tr.attr("class").match(/parent_([\w\d_]+)/);
            if (parentMatch && parentMatch[1]) {
                parentEl = this.find("." + parentMatch[1])[0];
            }
            
            var depth = parentEl ? $(parentEl).data("depth") + 1 : 1;
            tr.data("depth", depth);
            
            
            $(children).each(function(i, child){
                if(!child.depth) child.depth = depth;
            })
             
            tr.after("//mxui/grid/tree/views/rows.ejs", {
                options: this.options,
                children: children,
                parent: tr.model()
            });
            
            var childrenEls = [];
            $.each(children, function(i, child){
                var child = self.find("." + child.identity())[0];
                if(child !== tr[0])
                    childrenEls.push(child)                
            });
            tr.data("childrenEls", childrenEls);

            tr.data("children", children);
            
            tr.find(".ui-icon").removeClass("ui-icon-triangle-1-e expand").addClass("ui-icon-triangle-1-s collapse");

        }
    })
     
})

