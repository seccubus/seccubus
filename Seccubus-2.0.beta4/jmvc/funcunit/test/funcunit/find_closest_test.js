module("funcunit find closest",{
	setup: function() {
		var self = this;
		S.open("//funcunit/test/findclosest.html")
	}
});

test("closest", function(){
	S(":contains('Holler')").closest("#foo").click(function(){
		ok(this.hasClass("iWasClicked"),"we clicked #foo")
	})
	S(":contains('Holler')").closest(".baz").click(function(){
		ok(S(".baz").hasClass("iWasClicked"),"we clicked .baz")
	})
	
})

test("find", function(){
	S(":contains('Holler')")
		.closest("#foo")
		.find(".combo")
		.hasClass("combo", true)
		.click(function(){
			ok(S(".combo:eq(0)").hasClass("iWasClicked"),"we clicked the first combo")
			ok(!S(".combo:eq(1)").hasClass("iWasClicked"),"we did not click the 2nd combo")
		})
})

test("find this", function(){
	S("#foo").visible(function(){
		// this does a sync and async query
		var foo = S('#drag').text();
		// this does an async query, but the selector is now #drag
		// have to wrap it with S to force another async query
		S(this).find(".combo").exists("Combo exists");
	})
})

test("nested find", function(){
	S(".baz").exists(function(obj) { 
		obj.find(".foo").exists(); 
		obj.find(".another").exists(); 
	})
})