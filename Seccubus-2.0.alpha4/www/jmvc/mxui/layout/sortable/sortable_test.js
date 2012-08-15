steal.plugins('funcunit').then(function(){
module("mxui/sortable", { 
	setup: function(){
        S.open("//mxui/layout/sortable/sortable.html");
	}
})

test("adding an item", function(){
	S("#drag")
		.drag(".sortable:eq(1)")
		.drag("#away", function(){
			ok(/SOMETHING ELSE/.test( S(".sortable:eq(2)").text() ) )
		});

})
test("moving items", function(){
	var first = S(".sortable:eq(0)"),
		second = S(".sortable:eq(1)"),
		third = S(".sortable:eq(2)");
	
	first.drag(".sortable:eq(2)", function(){
		ok(/Second/.test(first.text()), "Second is first")
		
		ok(/Third/.test(second.text()), "First is second")
		
		ok(/First/.test(third.text()), "Third stays the same")
	});


});
})
