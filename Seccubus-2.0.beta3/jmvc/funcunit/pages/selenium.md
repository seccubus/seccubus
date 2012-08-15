@page funcunit.selenium Selenium
@parent funcunit.integrations 0

[http://seleniumhq.org/ Selenium] is a browser automation tool. FuncUnit integrates with Selenium, 
using it to open several browsers and report results.

## Use

There is no installation step with Selenium. The jar files come prepackaged with FuncUnit.

1. Write a functional test
1. Run with Selenium

@codestart
./js funcunit/run selenium path/to/funcunit.html
@codeend

## Configuration

The settings.js file is used to configure Selenium. Adding this file is described in [funcunit.integrations Integrations].

### Setting browsers

FuncUnit.browsers is an array that defines which browsers Selenium opens and runs your tests in.  
This is defined in settings.js.  If this null it will default to a standard set of browsers for your OS 
(FF and IE on Windows, FF on everything else).

@codestart
browsers: ["*firefox", "*iexplore", "*safari", "*googlechrome"]
@codeend

To define a custom path to a browser, put this in the string following the browser name.

@codestart
browsers: ["*custom /path/to/my/browser"]
@codeend

See the [http://release.seleniumhq.org/selenium-remote-control/0.9.0/doc/java/com/thoughtworks/selenium/DefaultSelenium.html#DefaultSelenium Selenium docs] 
for more information on customizing browsers.

## Filesystem for Faster Tests

You might want to use Selenium to open local FuncUnit pages, but test pages on your server.  This is possible, you 
just have to change FuncUnit.href or FuncUnit.jmvcRoot.  This file can load locally while everything else is 
using a server because it is a static file and loads static script files.

Set jmvcRoot to point to the location you want your pages to load from.

@codestart
jmvcRoot: "localhost:8000"
@codeend

Then make sure your test paths contain // in them to signify something relative to the jmvcRoot.  
For example, S.open("//funcunit/test/myapp.html") would open a page at 
http://localhost:8000/funcunit/test/myapp.html.

To load the command page from filesystem, start your test like you normally do:
@codestart
funcunit\envjs path\to\funcunit.html
@codeend

## Troubleshooting

### 64-bit Java

Some users will find Selenium has trouble opening while using 64 bit java (on Windows).  You will see an error like  
Could not start Selenium session: Failed to start new browser session.  This is because Selenium 
looks in the 64-bit Program Files directory, and there is no Firefox there.  To fix this, change 
browsers to include the path like this:

@codestart
FuncUnit.browsers = ["*firefox C:\\PROGRA~2\\MOZILL~1\\firefox.exe", "*iexplore"]
@codeend

### Running From Safari and Chrome

Certain browsers, like Safari and Chrome, don't run Selenium tests from filesystem because 
of security resrictions.  To get around this you have to run pages served from a server.  The 
downside of this is the test takes longer to start up, compared to loading from filesystem.
  
To run served pages, you must 1) provide an absolute path in your envjs path and 2) provide an absolute path 
in jmvcRoot.

For example, to run cookbook FuncUnit tests from Chrome, set the browsers and jmvcRoot.

@codestart
browsers: ["*googlechrome"],
jmvcRoot: "http://localhost:8000/framework/"
@codeend

Then start up Selenium.

@codestart
./js funcunit/run selenium http://localhost:8000/framework/cookbook/funcunit.html
@codeend

To run Safari 5 in Windows, you should use the safariproxy browser string.

@codestart
browsers: ["*safariproxy"]
@codeend

Mac Safari is just "*safari".

### Slow Mode
You can slow down the amount of time between tests by setting FuncUnit.speed.  By default, FuncUnit commands 
in Selenium will run as soon as the previous command is complete.  If you set FuncUnit.speed to "slow" this 
becomes 500ms between commands.  You may also provide a number of milliseconds.  Slow mode can be useful while debugging.


### IE Troubleshooting

If IE isn't running test pages from filesystem, disable security settings for pages that run from the filesystem. 

1. Open the Internet Options in IE and select the "Advanced" tab
1. Enable the option to "Allow active content to run in files on My Computer."

@image jmvc/images/iesecurity.png


If you're getting an IE popup blocker error, you may need to disable "Protected Mode"

@image jmvc/images/iepopups.png