module("contacts test", { 
	setup: function(){
		S.open("//contacts.html");
	}
});

test("Filtering", function(){
	S(".contact").visible();
	S(".count").text("1000", function(){
		ok(true, "initially 1000 contacts")
	})
	S(".category:first").visible().click();
	S(".count").text("143", function(){
		ok(true, "143 contacts after filtering")
	})
});

test("Creating a Category", function(){
	S(".category").visible(function(){
		equals(S(".category").size(), 7, "7 categories")
	})
	S("#category .createbutton").exists().click();
	S("#category input").visible().click().type("\b\b\b\bBasketball\r");
	S(".category").size(8, function(){
		ok(true, "there are 8 categories")
	})
});

test("Creating a Contact", function(){
	S(".contact").visible(function(){
		equals(S(".contact").size(), 100, "50 contacts")
	})
	S("#contacts .createbutton").exists().click();
	S("#contacts input:eq(0)").visible().click().type("\b\b\b\b\bBrian");
	S("#contacts input:eq(1)").visible().click().type("\b\b\b\bMoschel\r");
	S(".contact").size(101, function(){
		ok(true, "there are 51 contacts")
	})
});