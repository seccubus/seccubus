steal('funcunit').then(function(){
module("mxui/data/grid", { 
	setup: function(){
        S.open("//mxui/grid.html");
		S(".resource_1").exists();
	}
})

test("sorting", function(){
	S(".users_count-column-header a").exists().click();
	S.wait(20)
	
	var order = [],
		r0 = S('.body tr:eq(0) td:eq(4)'),
		r4 = S('.body tr:eq(4) td:eq(4)'),
		r8 = S('.body tr:eq(4) td:eq(4)');
		
	S(".body tr:eq(5)").exists(function(){
		order.push(parseInt(r0.text()))
		order.push(parseInt(r4.text()))
		order.push(parseInt(r8.text()))
		var sorted = order.sort();
		
		same(order, sorted, "they seem sorted");
		order = [];
	});
	
	
	S(".users_count-column-header a").click().wait(20);

	S(".body tr:eq(5)").exists(function(){
		order.push(parseInt(r0.text()))
		order.push(parseInt(r4.text()))
		order.push(parseInt(r8.text()))
		var sorted = order.sort().reverse();
		
		same(order, sorted, "they seem reversed");
	});
	

	
});

})
