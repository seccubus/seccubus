---
layout: post
title: Seccubus moved from SourceForge to GitHub
---
The last few days I’ve moved the Seccubus sources, binary downloads and open
tickets from SourceForge to GitHub.

Seccubs can Now be found [here](https://github.com/schubergphilis/Seccubus_v2)
(and v1 [here](https://github.com/schubergphilis/Seccubus_v1))

# Why?

There are three reasons why I moved to GitHub:

  * The company I work from, [Schuberg Philis](http://www.schubergphilis.com), is participating into open source software more and more and uses [GitHub](https://github.com/schubergphilis/)
  * Git has [advantages](https://git.wiki.kernel.org/index.php/GitSvnComparison) over SVN
  * SourceForge [stopped supporting hosted apps](http://sourceforge.net/apps/trac/sourceforge/wiki/Hosted%20Apps) and Seccubus used Trac as our bug tracker

# How?

The migration wasn’t too bad. For the source code migration I used the
[git2svn tool](https://github.com/nirvdrum/svn2git) and [this
guide](https://help.github.com/articles/importing-from-subversion). For the
Trac tickets I decided to do a [manual
migration](http://en.wikipedia.org/wiki/Sweatshop).

# What’s next?

Business as usual.

