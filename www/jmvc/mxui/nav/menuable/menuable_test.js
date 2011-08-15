steal('funcunit').then(function(){

module("mxui/nav/menuable", { 
	setup: function(){
        S.open("//mxui/nav/menuable/menuable.html");
		// a little fuzz
		S.wait(100);
	}
})

test("Basic Menu", function(){
	S("#menu1 li:first").click();
	
	S("#menu1 li:first ul li").visible(function(){
		ok(true, "first menu is visible")
	})
	S.wait(500);
	S("#menu1 li:eq(2)").click()
	S.wait(900);
	S("#menu1 li:eq(2) ul li").visible(function(){
		ok(true, "second menu is visible")
	})
})


test("Focus Menu", function(){
	S("#menu2 li:first span").click();
	S.wait(100);
	S("#menu2 li:first ul li").invisible(function(){
		ok(true, "first menu is invisible")
	})
	
	S("#menu2 li:first span").type("\r")
	
	S("#menu2 li:first ul li").visible(function(){
		ok(true, "first menu is visible")
	})
	S.wait(500);
	
	S("#menu2 li:eq(2) span").click().type("\r");
	
	S("#menu2 li:first ul li").invisible(function(){
		ok(true, "first menu is invisible")
	})
	S("#menu2 li:eq(2) ul li").visible(function(){
		ok(true, "second menu is visible")
	})
})

test("Nested Menu", function(){
	S("#menu3 li:first a").click();
	
	
	S("#menu3 li:first>ul>li").visible(function(){
		ok(true, "first menu is visible")
	})
	S.wait(700);
	S("#menu3 li:first>ul>li:first a").click();
	S("#menu3 li:first>ul>li:first ul li").visible(function(){
		ok(true, "first sub-menu is visible")
	})
	S.wait(700);
	
	S("#menu3>li:nth-child(2) a").click();
	S("#menu3 li:first>ul>li:first ul li").invisible(function(){
		ok(true, "first sub-menu is invisible")
	})
	S("#menu3 li:first>ul>li").invisible(function(){
		ok(true, "first menu is invisible")
	})
	S("#menu3>li:nth-child(2) ul").visible(function(){
		ok(true, "second menu is visible")
	})
	S.wait(700);
	S("#menu3 li:first a").click();
	S("#menu3>li:nth-child(2) ul").invisible(function(){
		ok(true, "second menu is invisible")
	})
	
	S("#menu3 li:first>ul>li").visible(function(){
		ok(true, "first menu is visible")
	})
});

})