steal.plugins(	
	'jupiter/scrollable_grid',
	'jquery/dom/fixture', 
	'jupiter/style', 
	'mxui/data/list')
	.css('contacts')
	.models('location', 'contact', 'company', 'category')
	.then(function(){
		$.Controller("Contacts.Controller", {
			init: function(){
				this.params = new Mxui.Data();
				$("#category .list_wrapper").mxui_data_list({
					model : Contacts.Models.Category,
					show : "//contacts/views/categoryList",
					create: "//contacts/views/categoryCreate"
				})
				
				$("#location .list_wrapper").mxui_data_list({
					model : Contacts.Models.Location,
					show : "//contacts/views/categoryList",
					create: "//contacts/views/categoryCreate"
				})
		
				$("#company .list_wrapper").mxui_data_list({
					model : Contacts.Models.Company,
					show : "//contacts/views/companyList",
					create: "//contacts/views/companyCreate"
				})
				
				$("#category .create").jupiter_create({
					model: Contacts.Models.Category,
					form: "//contacts/views/categoryCreate",
					insertInto: $("#category .list_wrapper")
				})
				
				$("#company .create").jupiter_create({
					model: Contacts.Models.Company,
					form: "//contacts/views/companyCreate",
					insertInto: $("#company .list_wrapper")
				})
				
				$("#location .create").jupiter_create({
					model: Contacts.Models.Location,
					form: "//contacts/views/categoryCreate",
					insertInto: $("#location .list_wrapper")
				})
		
				$("#contacts").jupiter_scrollable_grid({
					model : Contacts.Models.Contact,
					params : this.params,
					columns: {
						last: "Name",
						category: "Category",
						company: "Company",
						location: "Location"
					},
					row : "//contacts/views/contactRow",
					create: "//contacts/views/contactCreate"
				})
				.find(".wrapper").mxui_layout_fill()
				
				$("h3").style$().header()
				$(".lists > div").style$().box()
			}, 
			"#category .list_wrapper activate": function(el, ev, item){
				this.params.attr("categoryId", item.id);
			}, 
			"#category .list_wrapper deactivate": function(el, ev, item){
				this.params.attr("categoryId", null);
			}, 
			"#location .list_wrapper activate": function(el, ev, item){
				this.params.attr("locationId", item.id);
			}, 
			"#location .list_wrapper deactivate": function(el, ev, item){
				this.params.attr("locationId", null);
			}, 
			"#company .list_wrapper activate": function(el, ev, item){
				this.params.attr("companyId", item.id);
			}, 
			"#company .list_wrapper deactivate": function(el, ev, item){
				this.params.attr("companyId", null);
			},
			"windowresize": function(el, ev){
				$("#contacts").trigger("resize")
			}
		})
		$(document.body).contacts();
	})
