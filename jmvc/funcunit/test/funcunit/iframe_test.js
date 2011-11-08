module("funcunit - jQuery API",{
	setup: function() {
		S.open("//funcunit/test/iframe/haveframe.html")
	}
})

test("iframe that doesn't exist", function(){
	S("#open").exists().click();
	S("#title", "myframe").visible();
})