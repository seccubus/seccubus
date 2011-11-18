%define installdir	/opt/%{name}
%define homedir		%{installdir}
%define bindir		%{installdir}/bin
%define confdir		/etc/%{name}
%define webdir		%{installdir}/www
%define vardir		/var/lib/%{name}
%define seccuser	seccubus
%define docsdir		/usr/share/doc/%{name}

%define moddir		%{installdir}/SeccubusV2
%define scandir		%{installdir}/scanners

Name:		Seccubus
Version:	2.0.alpha4
Release:	0
Summary:	Automated regular vulnerability scanning with delta reporting
Group:		Network/Tools
License:	GPL
URL:		http://www.seccubus.com

Packager:	Peter Slootweg <pslootweg@schubergphilis.com>

BuildRoot:	%{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
BuildArch:	noarch

Source0:	http://downloads.sourceforge.net/project/%{name}/%{name}_v2/%{name}-%{version}.tar.gz

#BuildRequires:	
Requires:	perl-Algorithm-Diff
Requires:	httpd
Requires:	mysql
Requires:	ruby

%description
Tool to automatically fire regular vulnerability scans with Nessus, OpenVAS, 
Nikto or Nmap. 
Compare results of the current scan with the previous scan and report on the 
delta in a web interface. Main objective of the tool is to make repeated scans 
more efficient.
Nessus scanning needs Ruby 
Nmap scanning needs the Nmap scanner
Nikto scanning needs the Nikto scanner

%clean
[ %{buildroot} != "/" ] && %{__rm} -rf %{buildroot}

%prep
%setup -q -n  %{name}-%{version}

perl Makefile.PL
mkdir -p %{buildroot}/%{installdir}
#mkdir -p %{buildroot}/%{webdir}
#mkdir -p %{buildroot}/%{bindir}
#mkdir -p %{buildroot}/%{confdir}
#mkdir -p %{buildroot}/%{vardir}
mkdir -p %{buildroot}/%{docsdir}/db
mkdir -p %{buildroot}/%{docsdir}/GUI
#mkdir -p %{buildroot}/%{moddir}
#mkdir -p %{buildroot}/%{scandir}
mkdir -p %{buildroot}/etc/httpd/conf.d

%build
make

%install
./install.pl --buildroot=%{buildroot} --confdir=%{confdir} --bindir=%{bindir} --dbdir=%{vardir} --wwwdir=%{webdir} --basedir=%{homedir} --docdir=%{docsdir}

cp apache-license.txt ChangeLog gpl-3.0.txt LICENSE.txt mit-license.txt %{buildroot}/%{docsdir}

cat > %{buildroot}/etc/httpd/conf.d/%{name}.conf <<-EOF
#
# This configuration file maps the Seccubus logs
# into the URL space. By default these results are
# only accessible from the local host.
#
Alias /seccubus %{webdir}

<Location /seccubus>
    Order deny,allow
    Deny from all
    Allow from 127.0.0.1
    Allow from ::1
    # Allow from .example.com
    AddHandler cgi-script .pl
    Options ExecCGI
</Location>
EOF

cat > %{buildroot}/%{confdir}/config.xml <<- EOF
<?xml version="1.0" standalone='yes'?>
<seccubus>
	<database>
		<engine>mysql</engine>
		<database>%{name}</database>
		<host>localhost</host>
		<port>3306</port>
		<user>%{seccuser}</user>
		<password>%{seccuser}</password>
	</database>
	<paths>
		<modules>%{installdir}/SeccubusV2</modules>
		<scanners>%{scandir}</scanners>
		<bindir>%{bindir}</bindir>
		<configdir>%{confdir}</configdir>
		<dbdir>%{vardir}</dbdir>
	</paths>
</seccubus>

EOF

################################################################################
%pre
%{_sbindir}/groupadd -r -f %{seccuser}
grep \^%{seccuser} /etc/passwd >/dev/null
if [ $? -ne 0 ]; then
	%{_sbindir}/useradd -d %{installdir} -g %{seccuser} -r %{seccuser}
fi
%{_sbindir}/usermod -G $(id -nG apache|sed -e 's/  *$//g' -e 's/  */,/g'),%{seccuser} apache

## %preun
%post
/bin/cat << OEF
################################################################################

After installation, create a database and database user. Populate the db with provided
scripts:

  # mysql << EOF
  create database Seccubus;
  grant all privileges on Seccubus.* to seccubus@localhost identified by 'seccubus';
  flush privileges;
  EOF

  # mysql -u seccubus -pseccubus Seccubus < %{vardir}/structure_v1.mysql
  # mysql -u seccubus -pseccubus Seccubus < %{vardir}/data_v1.mysql

You can change the db name and username/password, make sure you update
%{confdir}/config.xml accordingly

Look for more information on http://www.seccubus.com/documentation/seccubus-v2

Apache on this host now has a configfile /etc/httpd/conf.d/%{name}.conf
The default config makes Seccubus available on http://localhost/seccubus
(Note: you may have to restart Apache)

################################################################################
OEF


%postun
%{_sbindir}/usermod -G $(id -nG apache|sed -e 's/%{seccuser}//' -e 's/  *$//g' -e 's/  */,/g') apache
################################################################################

%files
%defattr(-,%{seccuser}, %{seccuser})
#
%attr(644, root, root) %config /etc/httpd/conf.d/%{name}.conf
%attr(644, root, root) %config %{confdir}/config.xml
#
%attr(755, %{seccuser}, %{seccuser}) %dir %{confdir}
%attr(644, %{seccuser}, %{seccuser}) %{confdir}/full.nessusrc.example
%attr(644, %{seccuser}, %{seccuser}) %{confdir}/full.openvasrc.example
%attr(644, %{seccuser}, %{seccuser}) %{confdir}/safe.nessusrc.example
%attr(644, %{seccuser}, %{seccuser}) %{confdir}/safe.openvasrc.example
%attr(644, %{seccuser}, %{seccuser}) %{confdir}/config.xml.mysql.example

%attr(755, %{seccuser}, %{seccuser}) %dir %{installdir}
%attr(644, %{seccuser}, %{seccuser}) %{installdir}/SeccubusV2.pm

%attr(755, %{seccuser}, %{seccuser}) %dir %{moddir}
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/IVIL.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusDB.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusFindings.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusHelpers.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusHostnames.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusIVIL.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusRights.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusRuns.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusScanners.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusScans.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusUsers.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusWorkspaces.pm

%attr(755, %{seccuser}, %{seccuser}) %dir %{bindir}
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/add_user
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/do-scan
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/dump_ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/dump_nmap
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/importer
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/load_ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/nbe2ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/nmap2ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/nessus2ivil

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/apache-license.txt
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/ChangeLog
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/gpl-3.0.txt
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/LICENSE.txt
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/mit-license.txt

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/db
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/db/SeccubusV2_v1.mwb
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/db/SeccubusV2_v1.pdf

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/GUI
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/GUI/UseCaseFindings.png
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/GUI/UseCaseScans.png
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/GUI/UseCaseSeccubusGUIStart.png
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/GUI/UseCaseWorkspaces.png
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/GUI/umlSeccubusGUI.di2
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/GUI/umlSeccubusGUI.uml

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration.htm

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration.htm

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration.htm

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration.htm

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration.htm

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation.htm
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration.htm

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML/1-HowToGet_files
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet_files/colorschememapping.xml
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet_files/filelist.xml
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/1-HowToGet_files/themedata.thmx

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML/2-Installation_files
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation_files/colorschememapping.xml
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation_files/filelist.xml
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/2-Installation_files/themedata.thmx

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/HTML/3-ScanConfiguration_files
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration_files/colorschememapping.xml
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration_files/filelist.xml
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/HTML/3-ScanConfiguration_files/themedata.thmx

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/MSWord
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/MSWord/1-HowToGet.doc
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/MSWord/2-Installation.doc
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/MSWord/3-ScanConfiguration.doc

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/PDF
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/PDF/1-HowToGet.pdf
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/PDF/2-Installation.pdf
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/PDF/3-ScanConfiguration.pdf

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/TXT
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/TXT/1-HowToGet.txt
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/TXT/2-Installation.txt
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/TXT/3-ScanConfiguration.txt

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}
%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/Nessus
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/Nessus/nivil.rb
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/Nessus/scan

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/Nmap
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/Nmap/scan

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/Nikto
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/Nikto/scan

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/OpenVAS
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/OpenVAS/scan

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/NessusLegacy
%attr(644, %{seccuser}, %{seccuser}) "%{scandir}/NessusLegacy/(dot)update-nessusrc.example"
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/scan
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/update-nessusrc
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/update-rcs

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/SeccubusV2.pm
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/index.html
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/index2.html

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/api
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/createScan.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/createWorkspace.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/deleteWorkspace.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/doScan.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/editScan.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/editWorkspace.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/getFinding.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/getFindings.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/getScans.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/getWorkspaces.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/getfFilter.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/testConfig.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/up2date.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/updateDB.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/api/updateFindings.pl

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/img
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/add.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_down.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_first.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_first_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_last.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_last_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_next.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_next_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_previous.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_previous_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_refresh.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/arrow_up.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/asc.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/changed.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/cross.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/date.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/delete.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/desc.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/favicon.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/filter.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/lightning.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/logo.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/nav.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/pencil.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/sort_asc.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/sort_asc_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/sort_both.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/sort_desc.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/sort_desc_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/unsort.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/img/tick.png

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/jquery.cookie.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/jquery.dataTables.min.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/jquery.disable.text.select.pack.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/jquery.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/jquery.metadata.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/jquery.single_double_click.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/jquery.tablesorter.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/jquery.tools.min.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/main.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/js/seccubus.js

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/skins
%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/skins/default
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/skins/default/asc.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/skins/default/bg.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/skins/default/desc.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/skins/default/header.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/skins/default/style.css

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/style
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/style/layout.css
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/style/seccubus.css

%attr(755, %{seccuser}, %{seccuser}) %dir %{vardir}
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/data_v1.mysql
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/structure_v1.mysql


%changelog
* Tue Sep 13 2011 Frank Breedijk <fbreedijk@schubergphilis.com>
- version 2.0.alpha4
* Thu Aug 25 2011 Peter Slootweg <peter@pxmedia.nl>
- version 2.0.alpha3
* Mon May 2 2011 Peter Slootweg <pslootweg@schubergphilis.com>
- version 2.0.alpha2
* Mon Mar 14 2011 Peter Slootweg <pslootweg@schubergphilis.com>
- version 2.0.alpha1
* Thu Feb 10 2011 Peter Slootweg <pslootweg@schubergphilis.com>
- version 2.0.alpha0
* Thu Feb 10 2011 Peter Slootweg <pslootweg@schubergphilis.com>
- version 1.5.4
* Tue Nov 9 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- version 1.5.3
* Mon Sep 6 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- homedir wasn't owned by seccubus user
* Wed Sep 1 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- removed dependencies on nessus and mod_perl
* Mon Aug 30 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- Removed last remaining /home/seccubus references
* Tue Jun 22 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- Initial Spec File
