module("srchr/search_result",{
	setup : function(){
		S.open('//srchr/search_result/search_result.html')
	}
})

test("results shown", function(){
	S("#searchVal").type("search\r");
	S("li").exists(function(){
		ok(true, "results have been shown");
	})
})

test("results not shown when hidden", function(){
	S("#toggle").click();
	S("#searchVal").type("search\r");
	S.wait(20, function(){
		equals(S('li').size(), 0, "there are no li's")
	});
});

test("don't query when hidden", function(){
	S("#searchVal").type("search\r");
	S("li").exists(function(){
		ok(true, "results have been shown")
	})
	S("#toggle").click();
	S("#searchVal").type("\r");
	S.wait(20, function(){
		equals(S('#searchNum').text(), "1", "only 1 query")
		
	})
	
})
	