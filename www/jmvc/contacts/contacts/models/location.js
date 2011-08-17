steal.plugins("jquery/model/list")
	.then(function(){
		$.Model('Contacts.Models.Location', {
			listType : $.Model.List
		}, {})
	})
