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

This ensures that the packes build on all supported platforms too.

# Make sure hub.docker.com is building the container

Check:
* [Main image](https://hub.docker.com/r/seccubus/seccubus/builds/)
* [Frontend image](https://hub.docker.com/r/seccubus/seccubus-front/builds/)
* [Web image](https://hub.docker.com/r/seccubus/seccubus-web/builds/)
* [API image](https://hub.docker.com/r/seccubus/seccubus-api/builds/)
* [Perl image](https://hub.docker.com/r/seccubus/seccubus-perl/builds/)
* [Cron image](https://hub.docker.com/r/seccubus/seccubus-cron/builds/)

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

# Create a pull request from master to releases

This will make sure the release also gets uploaded to the releases repository.

# Create a release on GitHub

See [GitHub release page](https://github.com/schubergphilis/Seccubus/releases).

Use the tag you have just created. If you committed after you created the tag you need to [delete the tag](https://nathanhoad.net/how-to-delete-a-remote-git-tag) first.

# Download the binary packages

Get the following from [CircleCI](https://circleci.com/gh/schubergphilis/workflows/Seccubus/tree/master):

* RPMS: master / fedora_package_building -> fedora_ok -> artifacts
* .deb file: master / debian_package_building -> debian_ok -> artifacts

# Attach them to the build

See the release you just created at the [GitHub release page](https://github.com/schubergphilis/Seccubus/releases).

# Write a blog post on [seccubus.com](/)

Code is in the [gp-pages branch Of the main GitHub repo](https://github.com/schubergphilis/Seccubus/tree/gh-pages/_posts)

# Send a notification to [the slack channel](https://seccubus.slack.com/)

You know how slack works.

# Update online version check

Code is on [Frank Breedijk's GitHub](https://github.com/seccubus/Seccubus_version_check)

# Tweet, LinkedIn, Facebook, etc...

Make some noise, you are done!
