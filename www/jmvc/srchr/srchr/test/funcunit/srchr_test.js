module("srchr", { 
	setup: function(){
        S.open("//srchr/srchr.html");
	},
	checkYahooOnlyResults : function(){
		ok(S('#yahoo').html(), 'Results were retrieved.')
		ok(S('#resultsTab li:eq(0)').hasClass('disabled'), "Non-selected tab Flickr is disabled.")
		ok(!S('#resultsTab li:eq(1)').hasClass('disabled'), "Selected tab Yahoo is enabled.")
		ok(S('#resultsTab li:eq(2)').hasClass('disabled'), "Non-selected tab Upcoming is disabled.")
	}
});



test('Search shows results in selected service', function(){
	
	S('input[value=Srchr\\.Models\\.Yahoo]').click();
	S('#query').click().type('Dogs\r');
	
	// wait until there are 2 results
	S("#yahoo li").exists( function(){
		
		ok(true, "We see results in yahoo");
		// make sure we see dogs in the history
		equals(S("#history .search .text").text() , "Dogs y", "we see dogs correctly");
		
		// make sure flickr and everyone else is diabled
		ok(S('#resultsTab li:eq(0)').hasClass('disabled'), "Flickr is disabled.");
		ok(S('#resultsTab li:eq(2)').hasClass('disabled'), "Upcoming is disabled.");
	}); 
	
	
	
})

test('Switching results tabs', function(){
	S('input[value=Srchr\\.Models\\.Yahoo]').click();
	S('input[value=Srchr\\.Models\\.Flickr]').click();
	
	S('#query').click().type('Cats\r');
	
	S("#flickr li").exists( function(){
	
		equals(S('#flickr').css('display'), 'block', 'Flickr results panel is visible')
		
		S('#resultsTab li:eq(1)').click(function(){
			
			equals(S('#flickr').css('display'), 'none', 'Flickr results panel is hidden')
			
			equals(S('#yahoo').css('display'), 'block', 'Yahoo results panel is visible')
		})
		
		
	})
})

test('Clicking history entries re-creates the search', function(){
	S('.srchr_models_search_Dogs').click(function(){
		equals(S('#query').val(), "Dogs", 'Dogs was put back into the query field')
	});
	S("#yahoo li").exists( function(){
		ok(true, "We see results in yahoo");
	})
})


test('All history entries are deletable', function(){
	for (var i = S('#history li').size() - 1; i > -1; i--){
		S('#history li a.remove:eq(' + i + ')').click()
	}
	
	S('#history li').size(0)
	ok(S('#history li').size(), 'All history entries were removed.')
})