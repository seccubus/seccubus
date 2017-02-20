---
version: 2
category: user
layout: page
title: Setting up scans
---
# 1 How to set up scans

This document explains how to setup and execute scans in Seccubus V2

  * Nessus scan via XML rpc
  * Nessus scan via legacy port 1241
  * Nikto 
  * OpenVAS
  * Nmap
  * Skipfish

## 1.1 Nessus

Configuring a Nessus scan consist of the following steps:

  * Creating a policy in Nessus
  * Creating a scan in Seccubus

First we need to create a scan policy on the Nessus scanner. So if your Nessus
scanner is located at 10.6.6.6 you need to log into
[http://10.6.6.6:8834](http://10.6.6.6:8834/)

In the Nessus GUI you need to create one or more policies. This example
assumes you have created a policy with the default options named ‘default’.

Now we need to set up a scan in Seccubus.

If you have not yet created a workspace, go to the ‘Manage Workspaces’ tab and
click the ‘New workspace’ button.

Go to the ‘Manage scans’ tab and select the workspace you want to create the
scan in. Then click on the ‘New scan’ button.

Next we need to fill out a name for the scan, select the ‘Nessus6’ scanner
provide the scanner parameters and the scan targets.

The scanner parameters determine which command line parameters are sent to the
scanners/\<scannername\>/scan script. In the case of the Nessus scanner they
should be:

The default options for the Nessus6 scanner are:

```
-s <server> --port 8834 -u <user> --policy <policy> --hosts @HOSTS
```

You need to replace `<server>` `<user>` and `<policy>` with the correct values and type 
the Nessus password in the password field.

You can test if your scan works by running the following command:

```
> bin/do-scan –-workspace <Seccubus workspace name> –scan <Seccubus scan name>
-v
```

## 1.2 Nikto

Setting up a Nikto scan can also be done via the Seccubus GUI. In order to
this type of scan to work you need to have Nikto installed on the server
running Seccubus or be able to ssh into a server that can run Nikto.

If you have not yet created a workspace, go to the ‘Manage Workspaces’ tab and
click the ‘New workspace’ button.

Go to the ‘Manage scans’ tab and select the workspace you want to create the
scan in. Then click on the ‘New scan’ button.

Next we need to fill out a name for the scan, select the ‘Nessus’ scanner
provide the scanner parameters and the scan targets.

Next we need to fill out a name for the scan, select the ‘Nikto’ scanner and
provide the scanner parameters and the scan targets.

The scanner parameters determine which command line parameters are sent to the
scanners/\<scannername\>/scan script. The parameters of the scan script are also
shown in the create scan dialog.


The default options for the nikto scanner are:

```
-o <nikto options> --hosts @HOSTS
```

The string after -o will be passed as command line options
to Nikto. See <http://cirt.net/nikto2-docs/options.html> for a full
explanation of these options. Do not specify the –Format and –output options
as these options will be set by Seccubus.

You can test if your scan works by running the following command:

```
> bin/do-scan –-workspace <Seccubus workspace name> –scan <Seccubus scan name>
-v
```

If you want to run this command on a remote host make the you add the following to the scanner options:

```
-r <hostname>,<username>,</path/to/ssh/key>
```

This will run the nikto command on server `<hostname>` as user `<username>` by ssh-ing into the box with key `</path/to/ssh/key>`.

## 1.4 OpenVAS

In order to set up an OpenVAS scan, you first have to set up a policy in OpenVAS
or use a predefined policy like `Full and fast ultimate`

Next we need to set up the scan in the Seccubus GUI. 

If you have not yet created a workspace, go to the ‘Manage Workspaces’ tab and
click the ‘New workspace’ button.

Go to the ‘Manage scans’ tab and select the workspace you want to create the
scan in. Then click on the ‘New scan’ button.

Next we need to fill out a name for the scan, select the ‘OpenVAS6’ scanner and
provide the scanner parameters and the scan targets.

The scanner parameters determine which command line parameters are sent to the
scanners/\<scannername\>/scan script. In the case of the OpenVAS scanner
the default values are:

```
--server='<OpenVAS IP>' --user=<OpenVAS user> --password='$PASSWORD' --policy='Full and fast ultimate' --targetip='$HOSTS' --portlist='All TCP' --quiet
```

Make sure to replace the `<OpenVAS IP>`, `<OpenVAS user>`, policy and portlist parameters with the desired values. Make sure you leave the `--password='$PASSWORD'` part in tact and that you provide the password in the separate password field.

You can test if your scan works by running the following command:

```
> bin/do-scan –-workspace <Seccubus workspace name> –scan <Seccubus scan name>
-v
```

## 1.5 Nmap

Setting up an Nmap scan can also be done via the Seccubus GUI. In order to
this type of scan to work you need to have Nmap installed on the server
running Seccubus are a server you can ssh to.

If you have not yet created a workspace, go to the ‘Manage Workspaces’ tab and
click the ‘New workspace’ button.

Go to the ‘Manage scans’ tab and select the workspace you want to create the
scan in. Then click on the ‘New scan’ button.

Next we need to fill out a name for the scan, select the ‘Nessus’ scanner
provide the scanner parameters and the scan targets.

Next we need to fill out a name for the scan, select the ‘Nmap’ scanner and
provide the scanner parameters and the scan targets.

The scanner parameters determine which command line parameters are sent to the
scanners/\<scannername\>/scan script. In the case of the Nmap scanner the the 
default is:

```
-o "<nmap options>" [--sudo] --hosts @HOSTS
```

An explanation of the options is shown on the create scan screen.

The string specified by -o will be passed as command line options to
Nmap. See ‘nmap –help’ or <http://nmap.org/book/man.html> for a full
explanation of these options. Do not specify the –o (output) option as this option 
will be set by Seccubus automatically.

You can test if your scan works by running the following command:

```
> bin/do-scan –-workspace <Seccubus workspace name> –scan <Seccubus scan name>
-v
```

If you want to run this command on a remote host make the you add the following to the scanner options:

```
-r <hostname>,<username>,</path/to/ssh/key>
```

This will run the nmap command on server `<hostname>` as user `<username>` by ssh-ing into the box with key `</path/to/ssh/key>`.

##  1.6 Skipfish

Setting up a Skipfish scan can also be done via the Seccubus GUI. In order for
this type of scan to work you need to have Skipfish installed on the server
running Seccubus.

If you have not yet created a workspace, go to the ‘Manage Workspaces’ tab and
click the ‘New workspace’ button.

Go to the ‘Manage scans’ tab and select the workspace you want to create the
scan in. Then click on the ‘New scan’ button.

Next we need to fill out a name for the scan, select the ‘Skipfish’ scanner
and provide the scanner parameters and the scan targets.

The scanner parameters determine which command line parameters are sent to the
scanners/\<scannernam>/scan script. In the case of the Skipfish scanner the
default values are:

```
-o "skipfish options" --hosts $HOSTS
```

With Skipfish you **only** can use the ‘$HOSTS’ option and specify the host in
the ‘Scan targets fields’. Currently Skipfish **doesn’t support multiple scan
targets**.

The string specified by -o options will be passed as command line options to
Skipfish.

See ‘skipfish –help’ or https://code.google.com/p/skipfish/wiki/SkipfishDoc
for a full explanation of these options.

You can test if your scan works by running the following command:

```
> bin/do-scan –-workspace <Seccubus workspace name> –scan <Seccubus scan name>
-v
```

