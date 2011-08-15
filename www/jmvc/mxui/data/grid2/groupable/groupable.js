steal('mxui/data/grid','jquery/event/drop','mxui/layout/sortable').then(function($){

	//creates a grid inside
	$.Controller.extend("Mxui.Data.Grid.Groupable",{
		defaults: {
			dragToGroupText: "Drag a column name here to group the items by the values within that column."
		}
	},{
		init : function(){
			this.element.html("//mxui/grid/groupable/views/init",this.options);
			this.groups = [];
			
			
			this.element.children(".gridarea").mxui_filler().mxui_grid($.extend({
				renderer : this.callback('renderRows')
			},this.options));
			
			
			
			
			var da = this.element.children(".droparea").mxui_sortable({
				makePlaceHolder : function(el){
					//check that we haven't already added
					return $("<div class='groupDrag'>"+
					 		  el.text()+
							"<a href='javascript://' class='remove'>&nbsp;</a></div>").
							addClass(el.parent()[0].className)
						
				}
			})
			this.bind(da,"sortable:removePlaceholder","removePlaceholder")
			this.bind(da,"sortable:addPlaceholder","addPlaceholder")
		},
		renderRows : function(item, options, itemNum, items){
			//which group are we comparing?
			var numGroups = options.group ? options.group.length : 0
			if(numGroups == 0){
				return $.View("//mxui/grid/views/row",{item: item, options: options, i: itemNum, items: items})
			}
			//column we are matching ....
			var group,html = [], colsNum = 0;
			$.each(options.columns, function(){
				colsNum++;
			})
			if(itemNum==0){
				for(var i =0; i < numGroups;i++){
					var group = options.group[i]
					html.push("<tr class='group-col'>")
					html.push( new Array(i+1).join("<td></td>") );
					html.push( "<td>"+options.columns[group]+":",
								options.render && options.render[group] ?  options.render[group](item) : item[group],
								"</td>")
					html.push( new Array(colsNum-i ).join("<td></td>") );
					html.push("</tr>")
				}
			}else{
				var equal = true;
				for(var i = 0; i< numGroups ; i++){
					var group = options.group[i]
					if(!equal || item[group] !== items[itemNum-1][group]){
						html.push("<tr class='group-col'>")
						html.push( new Array(i+1).join("<td></td>") );
						html.push( "<td>"+options.columns[group]+":",
									options.render && options.render[group] ?  options.render[group](item) : item[group],
									"</td>")
						html.push( new Array(colsNum - i).join("<td></td>") );
						html.push("</tr>")
						equal = false;
					}
				}
			}
            html.push($.View("//mxui/grid/views/row", { item: item, options: options, i: itemNum, items: items }))
			return html.join('')
			//is it the same as the previous?
			//deal with groups
		},
		".gridarea updating" : function(){
			this.groupLevel = 0;
		},
		".droparea change" : function(el, ev){
			ev.stopPropagation();
			//figure out the new grouping and tell the grid
			var groupOrder = []
			this.element.children(".droparea").children(".sortable").each(function(){
				groupOrder.push(this.className.match(/([\w_]+)\-column\-header/)[1]);
			})
			this.element.children(".gridarea").mxui_grid({group: groupOrder})
		},
		".groupDrag .remove click" : function(el){
			var droparea = this.element.children(".droparea");
			el.parent().remove();
			droparea.trigger("sortable:removePlaceholder");
			droparea.trigger("change")
		},
		addPlaceholder : function(){
			$("#dragToGroupText").remove();
		},
		removePlaceholder : function(){
			var da = this.element.children(".droparea")
			if(da.children().length ==0){
				da.append("<span id='dragToGroupText'>"+this.options.dragToGroupText+"</span>")
			}
		},
		".droparea dropinit" : function(el, ev, drop, drag){
			if(!drag.movingElement.hasClass('grid-group-drag')){
				drop.cancel();
			}
		},
		".droparea dropover" : function(el){
			el.addClass('dropareaOver')
		},
		".droparea dropout": function(el){
			el.removeClass('dropareaOver')
		},
		".droparea dropend": function(el){
			el.removeClass('dropareaOver')
		},
		".gridarea th a draginit" : function(el, ev, drag){
			drag.ghost(document.body).addClass("grid-group-drag");
		},
		".gridarea th a dragend" : function(el, ev){
			ev.preventDefault();
		}
	})

})
.views("//mxui/grid/groupable/views/init.ejs");