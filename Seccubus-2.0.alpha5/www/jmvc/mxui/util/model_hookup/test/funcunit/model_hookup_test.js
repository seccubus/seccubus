module("model_hookup")


test("model_hookup testing works", function(){

        S.open("file:/D:/Work/pinhooklabs/clients/cashnet/gitrepo/mxui/model_hookup/model_hookup.html");
		S.wait(10, function(){
			ok(true, "things working");
		})

})