module("funcunit - jQuery API",{
	setup: function() {
		S.open("//funcunit/test/confirm.html")
	}
})

test("confirm overridden", function(){
	S('#confirm').click().wait(1000, function(){
		equal(S('#confirm').text(), "I was confirmed", "confirmed overriden to return true");
	});
	
});

test("alert overridden", function(){
	S('#alert').click().wait(1000, function(){
		equal(S('#alert').text(), "I was alert", "alert overriden to return true");
	});
	
});