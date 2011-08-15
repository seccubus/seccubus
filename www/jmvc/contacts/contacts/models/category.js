steal.plugins("jquery/model", "jquery/model/list")
	.then(function(){
		$.Model('Contacts.Models.Category', {
			listType: $.Model.List
		}, {
			
		});
	})
