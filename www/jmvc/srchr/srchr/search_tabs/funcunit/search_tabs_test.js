module("srchr/search_result", {
	setup: function() {
		S.open('//srchr/search_tabs/search_tabs.html');
	}
});

test('Are tabs generated?', function() {
	ok(S('a').size(), 'Tabs exist.');
	ok(S('div').size(), 'Content areas exist.');
});