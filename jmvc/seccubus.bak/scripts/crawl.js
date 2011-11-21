// load('seccubus/scripts/crawl.js')

load('steal/rhino/rhino.js')

steal('steal/html/crawl', function(){
  steal.html.crawl("seccubus/seccubus.html","seccubus/out")
});
