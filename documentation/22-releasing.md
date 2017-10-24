---
version: 2
category: dev
layout: page
title: Building a release
---

So you are a comitter and you want to release a new version of Seccubus.

# Calculate a new version number

As of April 2016 the "odd" version numbers are development releases the "even" version are releases.

So if 2.20 is the current release then 2.21 is the release currently under development. It will become 2.22 as soon as you will release it.

# Update SeccubusV2.pm

In SeccubusV2.pm there is a line like this:

```
$VERSION = '2.21';
```

Update it to reflect the new version number.

# Make sure README.md and ChangeLog.md are up to date

Make sure that README.md reflects all changes since the last released version, Make sure that you copy this to the head of ChangeLog.md as well. It has all the changes since version 2.0.alpha1

# Make sure that all unit tests pass

Check [![Circle-CI build status](https://circleci.com/gh/schubergphilis/Seccubus.svg?style=shield&circle-token=63e8efd7e0bff0b1e9578ff312b4b0c47963709a)](https://circleci.com/gh/schubergphilis/Seccubus)

# Make sure the RPMs build on all platforms

Check [OpenSUSE Build Serice](https://build.opensuse.org/package/show/home:seccubus/Seccubus)

(Debian package is part of CircelCI now)

# Make sure hub.docker.com is building the container

Check [Docker Hub](https://hub.docker.com/r/seccubus/seccubus/builds/)

# Tag the repo

```
$ git tag -a 2.22 -m "This will be release 2.22"
$ git push --follow-tags
Counting objects: 1, done.
Writing objects: 100% (1/1), 179 bytes | 0 bytes/s, done.
Total 1 (delta 0), reused 0 (delta 0)
To git@github.com:schubergphilis/Seccubus
 * [new tag]         2.22 -> 2.22
```

*CAUTION:*

* Use qualified tags!
* Don't prepend a v to the version or OpenSUSE build services will fail!

# Make sure that all unit tests pass (AGAIN!)

Check [![Circle-CI build status](https://circleci.com/gh/schubergphilis/Seccubus.svg?style=shield&circle-token=63e8efd7e0bff0b1e9578ff312b4b0c47963709a)](https://circleci.com/gh/schubergphilis/Seccubus)

# Make sure the RPMs builds on all platforms (AGAIN!)

Check [OpenSUSE Build Serice](https://build.opensuse.org/package/show/home:seccubus/Seccubus)

# Make sure hub.docker.com is building the containers (AGAIN!)

Check [Docker Hub](https://hub.docker.com/r/seccubus/seccubus/builds/)

# Create a release on GitHub

See [GitHub release page](https://github.com/schubergphilis/Seccubus/releases).

Use the tag you have just created. If you committed after you created the tag you need to [delete the tag](https://nathanhoad.net/how-to-delete-a-remote-git-tag) first.

# Download the binary packages

Platform(s):

* [Fedora based RPMs](http://software.opensuse.org//download.html?project=home%3Aseccubus&package=Seccubus) - Make sure to download all versions (fc24, fc25 and fc26) as well as the source RPM.
* [Debian deb](https://circleci.com/gh/schubergphilis/Seccubus/tree/master) - It is an artifact of the 'debian_ok' step in the 'debian_package_building' workflow.


# Attach them to the build

See the release you just created at the [GitHub release page](https://github.com/schubergphilis/Seccubus/releases).

# Write a blog post on [seccubus.com](/)

Code is on [Frank Breedijk's GitHub](https://github.com/seccubus/seccubus.github.io/tree/master/_posts)

# Send a notification to [the maining list](https://www.seccubus.com/mailing_list/subscribe/)

You know how mail works.

# Update online version check

Code is on [Frank Breedijk's GitHub](https://github.com/seccubus/Seccubus_version_check)

# Import blog post in Medium

On Medium [import the blog post](https://medium.com/p/import) and add it to the Schuberg Philis publication.

# Tweet, LinkedIn, Facebook, etc...

Make some noise, you are done!
