---
layout: post
title: AutoNessus v1.2.3
---
# AutoNessus v1.2.3 is out!

Mainly bugfixes, no features.

Here are the change notes.

---

5-12-2008  
===
AutoNessus v1.2.3 - Buggy bugfixes

* BUG [ 1996774 ] Comment overwrite should be off by default  
Seems it is not fixed.  
Line should have read  
print "\<input type=checkbox name=overwrite\>Overwriten";  
In stead of:  
print "\<input type=checkbox name=overwrite checked=false\>Overwriten";
* BUG [ 2392801 ] AutoRemark did not correctly detect if comment allready present  
I misunderstood the index function so my earlier bugfix killed this function
* BUG [ 2152839 ] Comment add seems to overwrite  
I have updated the update_remark function and modified do_scan.pl.  
update_remark is now more in line with autoupdate_remark which does seem to work well.
* BUG [ 2255750 ] Spelling error in Delta engine  
Chaned the spelling of changed to the correct one ;)
