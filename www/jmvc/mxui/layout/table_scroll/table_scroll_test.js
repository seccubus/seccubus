steal('funcunit').then(function(){
	
module("mxui/layout/table_scroll", { 
	setup: function(){
        S.open("//mxui/layout/table_scroll/table_scroll.html");
		
		// helps compare columns
		this.compareCols = function(i, size){
			var width = S(".header th:eq("+i+")").outerWidth();
			
			var outer = S("#table tr:first td:eq("+i+")").outerWidth();
			
			if(i == size -1){
				ok(outer < width,"Last is bigger")
			}else{
				equals(outer, width, ""+i+" columns widths match")
			}
			
		}
	}
});

test("columns are the right size", function(){
	var compareCols = this.compareCols;
	
	S("#scrollable").click().wait(100, function(){
		var size = S(".header th").size();
		for(var i =0; i < size; i++){
			compareCols(i, size);
		}
	});
});

test("horizontal scroll", function(){
	S("#scrollable").click().wait(100);

	
	S('.scrollBody').scroll("left",100);
	S('.header').scrollLeft(100, function(){
		ok(true, "assertions make people feel better")
	});
});

test("resize test", function(){
	S("#scrollable").click().wait(100);

	S("#resize").click().wait(100, function(){
		ok(true, "assertions make people feel better")
	});

});

})