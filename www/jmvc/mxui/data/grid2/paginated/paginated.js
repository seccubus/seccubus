steal('mxui/data/grid','mxui/nav/paginator/page').then(function($){
	$.Controller.extend("Mxui.Data.Grid.Paginated",
	{
		defaults : {
			paginatorType : Mxui.Nav.Paginator.Page,
			paginatorOptions : {},
			gridType :  Mxui.Grid,
			pageListingText : function(params){
				var data = Mxui.Paginator.pageData(params.params)
				return "<label>page " + (data.page + 1) + " of " + data.totalPages + " (" + params.params.count + " records)</label>"
			}
		},
		listensTo : ["updated"]
	},
	{
		init : function(){
			$.View("//mxui/grid/paginated/views/footer");
			new this.options.gridType(this.element[0],this.options);
			this.element.find(".footer").html("//mxui/grid/paginated/views/footer",{});
			new this.options.paginatorType(this.element.find(".gridpages")[0],this.options.paginatorOptions);
		},
		updated : function(el, ev, params){
			var footer = this.element.find(".footer")
			
			footer.find(".pagelisting").html(
				this.options.pageListingText(params)
			)
			footer.find(".pagenumber").val(
				Mxui.Paginator.pageData(params.params).page+1
			)
			//update paginator
			this.element.find(".gridpages").controller().update(params.params)
		},
		".pagenumber keypress": function (el, ev)
        {
            if (ev.charCode && !/\d/.test(String.fromCharCode(ev.charCode)))
            {
                ev.preventDefault()
            }
        },
        "form.pageinput submit": function (el, ev)
        {
            ev.preventDefault();
            var page = parseInt(el.find('input').val(), 10) - 1,
				offset = page * this.options.limit;

            this.element.trigger("paginate", {
                offset: offset
            })
        }
	})
})
.views("//mxui/grid/paginated/views/footer.ejs");
