steal('mxui/paginator').then(function($){
	Mxui.Paginator.extend("Mxui.Paginator.Page",{
		defaults : {
			pageClass: "pages",
			pageCount: 5,
			firstText : "First",
			prevText: "Prev",
			nextText: "Next",
			lastText: "Last"
		}
	},{
		
		setOffsetLimit : function(){
			//calculate pages ...
			var page		= Math.floor(this.options.offset / this.options.limit),					//current page
				totalPages	= Math.ceil(this.options.count / this.options.limit),					//total pages
				start		=  Math.max(
							 	Math.min( page  - Math.floor(this.options.pageCount / 2), 
										 totalPages - this.options.pageCount),
								0
								)//first page
				end			= Math.min(totalPages, start+ this.options.pageCount);					//last page
			
			this.totalPages = totalPages;
			this.startPage = start;
			this.endPage = end;
			this.currentPage = page;
			this._super();
		},
		".page click" : function(el, ev){
			var page = parseInt(el.text(),10)- 1
			
			//move to the next set ...
			var to = {
				offset: page* this.options.limit,
				count: this.options.count,
				limit: this.options.limit
			}
			this.element.trigger("paginate", to)
		}
		
	})
})
.views("//mxui/paginator/page/views/init.ejs");
