steal('funcunit').then(function(){
	
module("slider test", { 
	setup: function(){
		S.open("//mxui/nav/slider/slider.html");
	}
});


test("moving changes value",function(){
	S("#slider").drag("+30 +0", function(){
		equals( S("#value").val(), 6);
	}).drag("-60 +0",function(){
		equals( S("#value").val(), 4);
	});
})

test("moving out of bounds", function(){
	S("#slider").drag("+400 +0", function(){
		equals( S("#value").val(), 10);
	}).drag("-400 +0", function(){
		equals( S("#value").val(), 1);
	})
});

})
