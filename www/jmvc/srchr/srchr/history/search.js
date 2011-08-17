steal.plugins('jquery/model/list').then(function() {
	$.Model.extend("Srchr.SearchHistory.Search", {}, {});
	$.Model.List.Cookie.extend("Srchr.SearchHistory.SearchList", {}, {})
})