steal.plugins("jquery/model/list")
	.then(function(){
		$.Model('Contacts.Models.Company', {
			listType: $.Model.List
		}, {})
	})
