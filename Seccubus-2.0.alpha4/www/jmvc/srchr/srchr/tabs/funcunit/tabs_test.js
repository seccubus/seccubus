module("srchr/tabs",{
	setup : function(){
		S.open('//srchr/tabs/tabs.html')
	}
});


test("Proper hiding and showing", function() {
	S("li:eq(1)").click();
	S("div:eq(1)").visible(function() {
		equals(S("div:eq(0)").css('display'), 'none', "Old tab contents are hidden");
		ok(!S("li:eq(0)").hasClass('active'), 'Old tab is not set to active');
		equals(S("div:eq(1)").css('display'), 'block', "New tab contents are visible");
		ok(S("li:eq(1)").hasClass('active'), 'New tab is set to active');
	});
});

test("Clicking twice doesn't break anything", function() {
	S("li:eq(2)").click();
	S("li:eq(2)").click();

	S("div:eq(2)").visible(function() {
		equals(S("div:eq(2)").css('display'), 'block', "New tab contents are visible");
		ok(S("li:eq(2)").hasClass('active'), 'New tab is set to active');
	});
});