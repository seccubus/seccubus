%define installdir	/opt/seccubus
%define homedir		%{installdir}
%define bindir		%{installdir}/bin
%define confdir		/etc/seccubus
%define webdir		%{installdir}/www
%define vardir		%{installdir}/var
%define seccuser	seccubus
%define docsdir		%{installdir}/doc/

%define moddir		%{installdir}/SeccubusV2
%define scandir		%{installdir}/scanners

Name:		Seccubus
Version:	2.0.beta5
Release:	0
Summary:	Automated regular vulnerability scanning with delta reporting
Group:		Network/Tools
License:	GPL
URL:		http://www.seccubus.com

Packager:	Frank Breedijk <fbreedijk@schubergphilis.com>

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

cp apache-license.txt ChangeLog.md gpl-3.0.txt LICENSE.txt mit-license.txt %{buildroot}/%{docsdir}

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
		<database>seccubus</database>
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
	<smtp>
		<server>localhost</server>
		<from>seccubus@localhost</from>
	</smtp>
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
  create database seccubus;
  grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
  flush privileges;
  EOF

  # mysql -u seccubus -pseccubus seccubus < %{vardir}/structure_v3.mysql
  # mysql -u seccubus -pseccubus seccubus < %{vardir}/data_v3.mysql

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
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusEvents.pm
%attr(644, %{seccuser}, %{seccuser}) %{moddir}/SeccubusNotifications.pm

%attr(755, %{seccuser}, %{seccuser}) %dir %{bindir}
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/add_user
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/do-scan
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/dump_ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/dump_nmap
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/load_ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/nbe2ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/nmap2ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/nessus2ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/sslyze2ivil
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/attach_file
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/convert_v1_v2
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/nthweek.sh
%attr(755, %{seccuser}, %{seccuser}) %{bindir}/onlyonxday.sh

   
%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/apache-license.txt
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/ChangeLog.md
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/gpl-3.0.txt
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/LICENSE.txt
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/mit-license.txt

%attr(755, %{seccuser}, %{seccuser}) %dir %{docsdir}/db
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/db/SeccubusV2_v1.mwb
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/db/SeccubusV2_v1.pdf
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/db/SeccubusV2_v2.mwb
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/db/SeccubusV2_v2.pdf
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/db/SeccubusV2_v3.mwb
%attr(644, %{seccuser}, %{seccuser}) %{docsdir}/db/SeccubusV2_v3.pdf

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
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nessus/description.txt
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nessus/help.html
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nessus/defaults.txt

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/Nmap
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/Nmap/scan
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nmap/description.txt
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nmap/help.html
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nmap/defaults.txt

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/Nikto
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/Nikto/scan
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nikto/description.txt
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nikto/help.html
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/Nikto/defaults.txt

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/SSLyze
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/SSLyze/scan
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/SSLyze/description.txt
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/SSLyze/help.html
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/SSLyze/defaults.txt

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/OpenVAS
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/OpenVAS/scan
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/OpenVAS/description.txt
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/OpenVAS/help.html
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/OpenVAS/defaults.txt

%attr(755, %{seccuser}, %{seccuser}) %dir %{scandir}/NessusLegacy
%attr(644, %{seccuser}, %{seccuser}) "%{scandir}/NessusLegacy/(dot)update-nessusrc.example"
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/scan
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/update-nessusrc
%attr(755, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/update-rcs
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/description.txt
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/help.html
%attr(644, %{seccuser}, %{seccuser}) %{scandir}/NessusLegacy/defaults.txt

# GUI
%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/index.html

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/seccubus
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/production.js
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/production.css
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/seccubus.html
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/SeccubusV2.pm

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/seccubus/img
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/error.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/favicon.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/header.gif
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/logo.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/ok.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/warn.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/back_disabled.jpg
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/back_enabled.jpg
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/checkbox_blank.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/checkbox_filled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/checkbox_half.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/forward_disabled.jpg
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/forward_enabled.jpg
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/sort_asc.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/sort_asc_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/sort_both.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/sort_both_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/sort_desc.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/sort_desc_disabled.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/closebox.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/changed.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/closed.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/edit.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/first.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/gone.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/last.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/masked.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/new.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/next.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/noissue.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/open.png
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/seccubus/img/previous.png
   
%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/seccubus/json
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/ConfigTest.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/UpToDate.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/createNotification.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/createScan.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/createWorkspace.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getAttachment.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getEvents.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getFindingHistory.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getFindings.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getNotifications.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getRuns.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getScanners.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getScans.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/getWorkspaces.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/updateFinding.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/updateFindings.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/updateNotification.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/updateScan.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/updateWorkspace.pl
%attr(755, %{seccuser}, %{seccuser}) %{webdir}/seccubus/json/deleteNotification.pl

%attr(755, %{seccuser}, %{seccuser}) %dir %{webdir}/steal
%attr(644, %{seccuser}, %{seccuser}) %{webdir}/steal/steal.production.js

%attr(755, %{seccuser}, %{seccuser}) %dir %{vardir}
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/data_v1.mysql
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/structure_v1.mysql
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/data_v2.mysql
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/structure_v2.mysql
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/data_v3.mysql
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/structure_v3.mysql
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/upgrade_v1_v2.mysql
%attr(644, %{seccuser}, %{seccuser}) %{vardir}/upgrade_v2_v3.mysql

%changelog
* Mon Dec 24 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Fixed permissions of files in  %{webdir}/seccubus/json/updateWorkspace.pl
* Sat Oct 05 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Building the rpm is now part of an automated build process. Unless there
  are any changes to this file in the Git repository changes will not be
  recorded here
* Wed Aug 15 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Corrected major error in beta4
* Tue Jul 10 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Corrected performance and installation issues
- Version 2.0.beta4
* Fri Feb 24 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Removed oldstyle gui
* Fri Jan 27 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Version 2.0.beta2
* Sat Jan 07 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Moved old GUi to oldstyle
- New GUI is now main GUI
- Version 2.0.beta1
* Thu Nov 23 2011 Frank Breedijk <fbreedijk@schubergphilis.com>
- Added support for rebuilt GUI
- Removed quadruplicate docs/HTML reference
* Thu Nov 18 2011 Frank Breedijk <fbreedijk@schubergphilis.com>
- Fixed missing dependancies 
* Thu Nov 17 2011 Frank Breedijk <fbreedijk@schubergphilis.com>
- Permissions of scanner files are not correct 
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
