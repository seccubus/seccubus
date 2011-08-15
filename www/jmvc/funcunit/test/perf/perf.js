steal("funcunit").then(function(){
	module("funcunit - jQuery API",{
		setup: function() {
			S.open("//funcunit/test/perf/perf.html")
		}
	});
	
	test("qUnit module setup works async", function(){
		ok(S(".foo table tr:contains('Panda')").size() === 1)
	});

})