<?xml version="1.0" encoding="iso-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:text="dont care" exclude-result-prefixes="text">
  <xsl:output method="html" indent="yes" encoding="iso-8859-1"
  doctype-public="-//W3C//DTD HTML 4.0 Transitional//EN" />
  <xsl:strip-space elements="*" />
  <!--
 Nessus
 Copyright (C) 2002 Axel Nennker axel@nennker.de

 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License version 2,
 as published by the Free Software Foundation

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

 $Id: nessus.xsl,v 1.1 2008/04/15 15:32:11 frank_breedijk Exp $
-->
  <!-- edited by Chuck Willis ( chuck at securityfoundry dot com ) 

  LAST UPDATED 9 Jan 2006

  Added ability to list plugins from the XML file for the scan (and sort that list by id, name, or family).
    I assume that this list is of the plugins that were enabled, but it may not be....
    This ability can be disabled by changing the value of include-list-of-plugins-enabled below.  

  Added configuration item to control sorting of hosts (by IP or by number of vulns)
  Also added ability to easily exclude report sections

  Now works with Microsoft Internet Explorer, xsltproc, and Firefox (though Firefox
  doesn't render as well as the others). 

  Sorted output, added listing by Vulnerability, and made the
  tables all use the whole screen.

  I haven't done thorough testing of the output, so use at your
  on risk as some items may be lost in translation.

  use xsltproc (or another XSL processor) to apply this stylesheet to a nessus xml output file

  Example: 

$ xsltproc nessus.xsl outputscan.xml > report.html

	You can also use this stylesheet to format the XML data in a web browser (IE or Firefox should work) 
	by putting this file into the same directory as the nessus output xml file and then opening the 
	xml output file in the web browser.  The output doesn't look as nice when done this way, I think some
	of the formatting is lost, so I recommend using xsltproc or another XSL processor.

-->

<!-- Configuration Items -->

<!-- this variable will control if the TOC at the top of the document is sorted by IP address or by
	the number of vulnerabilities.  Allowable values are ip and vulnerabilities. -->
<xsl:variable name="sort-host-summary-by">
     <xsl:text>ip</xsl:text> 
     <!-- <xsl:text>vulnerabilities</xsl:text> -->
  </xsl:variable>

<!-- this variable will control if the main listing of hosts is sorted by IP address or by
	the number of vulnerabilities.  Allowable values are ip and vulnerabilities. -->
<xsl:variable name="sort-hosts-by">
     <xsl:text>ip</xsl:text> 
     <!-- <xsl:text>vulnerabilities</xsl:text> -->
  </xsl:variable>

<!-- this variable will control if the listing of plugins is sorted by ID, family, or name
	Allowable values are id, family and name. -->
<xsl:variable name="sort-plugins-by">
     <xsl:text>id</xsl:text> 
     <!-- <xsl:text>family</xsl:text> -->
 	<!-- <xsl:text>name</xsl:text> --> 
 </xsl:variable>


<!-- change these to anything by 'y' to not include that section -->
<xsl:variable name="include-header">
     <xsl:text>y</xsl:text> 
  </xsl:variable>

<xsl:variable name="include-scan-summary">
     <xsl:text>y</xsl:text> 
  </xsl:variable>

<xsl:variable name="include-host-summary">
     <xsl:text>y</xsl:text> 
  </xsl:variable>

<xsl:variable name="include-list-by-host">
     <xsl:text>y</xsl:text> 
  </xsl:variable>

<xsl:variable name="include-list-by-vuln">
     <xsl:text>y</xsl:text> 
  </xsl:variable>

  <xsl:variable name="include-links-to-other-hosts-with-issue">
     <xsl:text>y</xsl:text> 
  </xsl:variable>

 <xsl:variable name="include-list-of-plugins-enabled">
     <xsl:text>y</xsl:text> 
  </xsl:variable>

    <xsl:variable name="include-information-items">
     <xsl:text>y</xsl:text> 
  </xsl:variable>
    <xsl:variable name="include-warnings">
     <xsl:text>y</xsl:text> 
  </xsl:variable>
  
  <!-- TODO make these work... I'm not sure if I fixed these already or not... -->
   <xsl:variable name="include-ports-with-no-findings">
     <xsl:text>n</xsl:text> 
  </xsl:variable>
    <xsl:variable name="include-hosts-with-no-findings-in-details">
     <xsl:text>n</xsl:text> 
  </xsl:variable>
  <xsl:variable name="include-hosts-with-no-findings-in-summary">
     <xsl:text>n</xsl:text> 
  </xsl:variable>
  
  
<!-- End configuration -->


  <xsl:variable name="table-bgcolor">
    <xsl:text>#a1a1a1</xsl:text>
  </xsl:variable>

  <text:texts xml:lang="en">
    <text key="Nessus Scan Report">Nessus Scan Report</text>
    <text key="report description">This report gives details on
    hosts that were tested and issues that were found. Please
    follow the recommended steps and procedures to eradicate these
    threats.</text>
  </text:texts>
  <text:texts xml:lang="de">
    <text key="Nessus Scan Report">Nessus
    Untersuchungsbericht</text>
    <text key="report description">Dieser Bericht stellt
    Informationen und Schwachstellen der untersuchten Rechner zur
    Verf&#252;gung. Bitte folgenden Sie den Hinweisen, um die
    Rechner sicherer zu konfigurieren.</text>
  </text:texts>
  <xsl:template name="nessus-report-style">
    <style type="text/css">
      <xsl:comment>BODY { BACKGROUND-COLOR: #ffffff } A {
      TEXT-DECORATION: none } A:visited { COLOR: #0000cf;
      TEXT-DECORATION: none } A:link { COLOR: #0000cf;
      TEXT-DECORATION: none } A:active { COLOR: #0000cf;
      TEXT-DECORATION: underline } A:hover { COLOR: #0000cf;
      TEXT-DECORATION: underline } OL { COLOR: #333333;
      FONT-FAMILY: tahoma,helvetica,sans-serif } UL { COLOR:
      #333333; FONT-FAMILY: tahoma,helvetica,sans-serif } P {
      COLOR: #333333; FONT-FAMILY: tahoma,helvetica,sans-serif }
      BODY { COLOR: #333333; FONT-FAMILY:
      tahoma,helvetica,sans-serif } TD { COLOR: #333333;
      FONT-FAMILY: tahoma,helvetica,sans-serif } TR { COLOR:
      #333333; FONT-FAMILY: tahoma,helvetica,sans-serif } TH {
      COLOR: #333333; FONT-FAMILY: tahoma,helvetica,sans-serif }
      FONT.title { BACKGROUND-COLOR: white; COLOR: #363636;
      FONT-FAMILY: tahoma,helvetica,verdana,lucida console,utopia;
      FONT-SIZE: 10pt; FONT-WEIGHT: bold } FONT.sub {
      BACKGROUND-COLOR: white; COLOR: #000000; FONT-FAMILY:
      tahoma,helvetica,verdana,lucida console,utopia; FONT-SIZE:
      10pt } FONT.layer { COLOR: #ff0000; FONT-FAMILY:
      courrier,sans-serif,arial,helvetica; FONT-SIZE: 8pt;
      TEXT-ALIGN: left } TD.title { BACKGROUND-COLOR: #A2B5CD;
      COLOR: #555555; FONT-FAMILY: tahoma,helvetica,verdana,lucida
      console,utopia; FONT-SIZE: 10pt; FONT-WEIGHT: bold; HEIGHT:
      20px; TEXT-ALIGN: left } TD.sub { BACKGROUND-COLOR: #DCDCDC;
      COLOR: #555555; FONT-FAMILY: tahoma,helvetica,verdana,lucida
      console,utopia; FONT-SIZE: 10pt; FONT-WEIGHT: bold; HEIGHT:
      18px; TEXT-ALIGN: left } TD.content { BACKGROUND-COLOR:
      white; COLOR: #000000; FONT-FAMILY:
      tahoma,arial,helvetica,verdana,lucida console,utopia;
      FONT-SIZE: 8pt; TEXT-ALIGN: left; VERTICAL-ALIGN: middle }
      TD.default { BACKGROUND-COLOR: WHITE; COLOR: #000000;
      FONT-FAMILY: tahoma,arial,helvetica,verdana,lucida
      console,utopia; FONT-SIZE: 8pt; } TD.border {
      BACKGROUND-COLOR: #cccccc; COLOR: black; FONT-FAMILY:
      tahoma,helvetica,verdana,lucida console,utopia; FONT-SIZE:
      10pt; HEIGHT: 25px } TD.border-HILIGHT { BACKGROUND-COLOR:
      #ffffcc; COLOR: black; FONT-FAMILY:
      verdana,arial,helvetica,lucida console,utopia; FONT-SIZE:
      10pt; HEIGHT: 25px }</xsl:comment>
    </style>
  </xsl:template>
  <xsl:template match="/">
    <html>
      <head>
        <title>
          <xsl:value-of select="document('')/*/text:texts[@xml:lang=$lang]/text[@key='Nessus Scan Report']" />
        </title>
        <xsl:call-template name="nessus-report-style" />
      </head>
      <body>
        <xsl:apply-templates select="report" />
      </body>
    </html>
  </xsl:template>
  <xsl:template name="nessus-report-header">
    <table bgcolor="{$table-bgcolor}" border="0" cellpadding="0"
    cellspacing="0" width="100%">
      <tbody>
        <tr>
          <td>
            <table border="0" cellpadding="2" cellspacing="1"
            width="100%">
              <tbody>
                <tr>
                  <td class="title">
                    <xsl:value-of select="document('')/*/text:texts[@xml:lang=$lang]/text[@key='Nessus Scan Report']" />
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <xsl:value-of select="document('')/*/text:texts[@xml:lang=$lang]/text[@key='report description']" />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <br />
  </xsl:template>
  <xsl:template match="result" mode="results-toc">
    <tr>
      <td class="default" width="20%">
        <a href="#{generate-id(host/@name)}">
          <xsl:value-of select="host/@name" />
        </a>
      </td>
      <td class="default" width="20%">
        <a href="#{generate-id(host/@name)}">
          <xsl:value-of select="host/@ip" />
        </a>
      </td>
      <td class="default" width="20%">
        <xsl:value-of select="count(./ports/port/information/severity[text()='Security Hole'])" />
      </td>
      <xsl:if test="$include-warnings='y'"><td class="default" width="20%">
        <xsl:value-of select="count(./ports/port/information/severity[text()='Security Warning'])" />
      </td></xsl:if>
      <xsl:if test="$include-information-items='y'"><td class="default" width="20%">
        <xsl:value-of select="count(./ports/port/information/severity[text()='Security Note'])" />
      </td></xsl:if>
    </tr>
  </xsl:template>
  <xsl:template match="results" mode="toc">
    <a name="toc"></a>
    <table bgcolor="{$table-bgcolor}" border="0" cellpadding="0"
    cellspacing="0" width="100%">
      <tbody>
        <tr>
          <td>
            <table border="0" cellpadding="2" cellspacing="1"
            width="100%">
              <tbody>
                <tr>
                  <td class="title" colspan="5">Host Summary 
(<xsl:value-of select="count(./result)" /> hosts
                  scanned)</td>
                </tr>
                <tr>
                  <td class="sub" width="20%">Host Name</td>
                  <td class="sub" width="20%">IP</td>
                  <td class="sub" width="20%">Vulnerabilities</td>
                  <xsl:if test="$include-warnings='y'"><td class="sub" width="20%">Warnings</td></xsl:if>
                   <xsl:if test="$include-information-items='y'"><td class="sub" width="20%">Information</td></xsl:if>
                </tr>
                <xsl:if test="$sort-host-summary-by='ip'">
		<xsl:for-each select="./result">
                  <!-- Sort hosts based on IP - Code by Marrow posted to 
        microsoft.public.xsl in 2002 - just like he says, ugly but it works -->

                <xsl:sort select="concat( concat(substring('000',1,3-string-length(substring-before(host/@ip,'.'))),substring-before(host/@ip,'.')),concat(substring('000',1,3-string-length(substring-before(substring-after(host/@ip,'.'),'.'))),substring-before(substring-after(host/@ip,'.'),'.')),concat(substring('000',1,3-string-length(substring-before(substring-after(substring-after(host/@ip,'.'),'.'),'.'))),substring-before(substring-after(substring-after(host/@ip,'.'),'.'),'.')),concat(substring('000',1,3-string-length(substring-after(substring-after(substring-after(host/@ip,'.'),'.'),'.'))),substring-after(substring-after(substring-after(host/@ip,'.'),'.'),'.')))" />  	
                  <xsl:apply-templates select="."
                  mode="results-toc" />
                </xsl:for-each>
		</xsl:if>

		<xsl:if test="$sort-host-summary-by='vulnerabilities'">
		<xsl:for-each select="./result">                
		<!--  sort table at top of report by vulnerabilities -->
 	<xsl:sort select="count(./ports/port/information/severity[text()='Security Hole'])" data-type="number" order="descending" />
<xsl:sort select="count(./ports/port/information/severity[text()='Security Warning'])" data-type="number" order="descending" />
<xsl:sort select="count(./ports/port/information/severity[text()='Security Note'])" data-type="number" order="descending" />
                  <xsl:apply-templates select="."
                  mode="results-toc" />
                </xsl:for-each>
		</xsl:if>
                <tr>
                  <td class="sub" width="20%">Scan Totals</td>
                  <td class="sub" width="20%"></td>
                  <td class="sub" width="20%">
                    <xsl:value-of select="count(./result/ports/port/information/severity[text()='Security Hole'])" />
                  </td>
                  <xsl:if test="$include-warnings='y'"><td class="sub" width="20%">
                    <xsl:value-of select="count(./result/ports/port/information/severity[text()='Security Warning'])" />
                  </td></xsl:if>
                   <xsl:if test="$include-information-items='y'"><td class="sub" width="20%">
                    <xsl:value-of select="count(./result/ports/port/information/severity[text()='Security Note'])" />
                  </td></xsl:if>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </xsl:template>
  
  <xsl:key name="datakey" match="data" use="."/>
  
  <xsl:template match="results" mode="scan-details">
    <table bgcolor="{$table-bgcolor}" border="0" cellpadding="0"
    cellspacing="0" width="100%">
      <tbody>
        <tr>
          <td>
            <table border="0" cellpadding="2" cellspacing="1"
            width="100%">
              <tbody>
                <tr>
                  <td class="title" colspan="2">Scan Summary</td>
                </tr>
                <!-- used to include the target specification, but the newer Nessus versions
			do not include that info in the xml anymore --> 
		<!-- <tr>
                  <td class="default" width="60%">Targets</td>
                  <td class="default" width="40%">
                    <xsl:for-each select="../config/global/pref">
                      <xsl:if test="@name='targets'">
                        <xsl:value-of select="@value" />
                      </xsl:if>
                    </xsl:for-each>
                  </td>
                </tr>
                <tr>
                  <td class="default" width="60%">Target
                  Comment</td>
                  <td class="default" width="40%">
                    <xsl:for-each select="../config/global/pref">
                      <xsl:if test="@name='comment'">
                        <xsl:value-of select="@value" />
                      </xsl:if>
                    </xsl:for-each>
                  </td>
                </tr> -->
                <tr>
                  <td class="default" width="60%">Number of hosts
                  scanned</td>
                  <td class="default" width="40%">
                    <xsl:value-of select="count(./result)" />
                  </td>
                </tr>
                <tr>
                  <td class="default" width="60%">Scan start</td>
                  <td class="default" width="40%">
                    <xsl:value-of select="../info/date/start" />
                  </td>
                </tr>
                <tr>
                  <td class="default" width="60%">Scan end</td>
                  <td class="default" width="40%">
                    <xsl:value-of select="../info/date/end" />
                  </td>
                </tr>
                <tr>
                  <td class="default" width="60%">Nessusd
                  Version</td>
                  <td class="default" width="40%">
                    <xsl:value-of select="../info/nessusd/version" />
                  </td>
                </tr>
                <tr>
                  <td class="default" width="60%">Nessus Scanner
                  Used</td>
                  <td class="default" width="40%">
                    <xsl:for-each select="../config/global/pref">
                      <xsl:if test="@name='nessusd_host'">
                        <xsl:value-of select="@value" />
                      </xsl:if>
                    </xsl:for-each>
                  </td>
                </tr>
                <tr>
                  <td class="default" width="60%">Nessus User Who
                  Started Scan</td>
                  <td class="default" width="40%">
                    <xsl:for-each select="../config/global/pref">
                      <xsl:if test="@name='nessusd_user'">
                        <xsl:value-of select="@value" />
                      </xsl:if>
                    </xsl:for-each>
                  </td>
                </tr>
                <tr>
                  <td class="default" width="60%">Number of
                  vulnerabilities found</td>
                  <td class="default" width="40%">
                    <xsl:value-of select="count(./result/ports/port/information/severity[text()='Security Hole'])" />
                  </td>
                </tr>
                 <xsl:if test="$include-warnings='y'"><tr>
                  <td class="default" width="60%">Number of
                  warnings found</td>
                  <td class="default" width="40%">
                    <xsl:value-of select="count(./result/ports/port/information/severity[text()='Security Warning'])" />
                  </td>
                </tr></xsl:if>
                <xsl:if test="$include-information-items='y'"><tr>
                  <td class="default" width="60%">Number of
                  informational items found</td>
                  <td class="default" width="40%">
                    <xsl:value-of select="count(./result/ports/port/information/severity[text()='Security Note'])" />
                  </td>
                </tr></xsl:if>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <br />
  </xsl:template>


<!-- This section will list the plugins from the XML file.  I assume that this is the list of plugins enabled. -->

  <xsl:template match="plugins" mode="plugin-list">
    <table bgcolor="{$table-bgcolor}" border="0" cellpadding="0"
    cellspacing="0" width="100%">
      <tbody>
        <tr>
          <td>
            <table border="0" cellpadding="2" cellspacing="1"
            width="100%">
              <tbody>
                <tr>
                  <td class="title" colspan="4">Plugins Enabled For This Scan</td>
                </tr>
		<!-- Determine if a list of plugins is in the input file.  Some output formats are do not include
			the list of plugins enabled so this information will not be included when that data is
			converted to XML -->

		    <xsl:choose>
		      <xsl:when test="(count(./plugin) &gt; 0)">

		<tr>
                  <td class="sub" width="10%">Plugin ID</td>
                  <td class="sub" width="40%">Plugin Name</td>
                  <td class="sub" width="30%">Plugin Family</td>
                  <td class="sub" width="20%">Plugin Version</td>
                </tr>

		<xsl:if test="$sort-plugins-by='id'">
		<xsl:for-each select="./plugin">
                  <!-- Sort plugins by ID -->
                <xsl:sort select="@id" />  	
                  <tr>
                    <td class="default" width="10%">
		      <xsl:value-of select="@id" />
		    </td>
                    <td class="default" width="40%">
                      <xsl:value-of select="name" />
                    </td>
                    <td class="default" width="30%">
                      <xsl:value-of select="family" />
                    </td>
                    <td class="default" width="20%">
                      <xsl:value-of select="version" />
                    </td>
                  </tr>
                </xsl:for-each>
		</xsl:if>

		<xsl:if test="$sort-plugins-by='family'">
		<xsl:for-each select="./plugin">
                  <!-- Sort plugins by ID -->
                <xsl:sort select="family" />  	
                  <tr>
                    <td class="default" width="10%">
		      <xsl:value-of select="@id" />
		    </td>
                    <td class="default" width="40%">
                      <xsl:value-of select="name" />
                    </td>
                    <td class="default" width="30%">
                      <xsl:value-of select="family" />
                    </td>
                    <td class="default" width="20%">
                      <xsl:value-of select="version" />
                    </td>
                  </tr>
                </xsl:for-each>
		</xsl:if>

		<xsl:if test="$sort-plugins-by='name'">
		<xsl:for-each select="./plugin">
                  <!-- Sort plugins by ID -->
                <xsl:sort select="name" />  	
                  <tr>
                    <td class="default" width="10%">
		      <xsl:value-of select="@id" />
		    </td>
                    <td class="default" width="40%">
                      <xsl:value-of select="name" />
                    </td>
                    <td class="default" width="30%">
                      <xsl:value-of select="family" />
                    </td>
                    <td class="default" width="20%">
                      <xsl:value-of select="version" />
                    </td>
                  </tr>
                </xsl:for-each>
		</xsl:if>
                       
                      </xsl:when>
		      
                      <xsl:otherwise>
		<tr>
                  <td class="default" colspan="4">No Plugin Information Available for this Scan</td>
                </tr>      
                      </xsl:otherwise>
		      
		      </xsl:choose>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </xsl:template>



  <xsl:template match="result" mode="toc">
    <xsl:variable name="hostname">
      <xsl:value-of select="host/@name" />
    </xsl:variable>
    <div align="left">
      <font size="-2">
        <a href="#toc">[ return to host summary ]</a>
      </font>
    </div>
    <br />
    <hr />
    <h3>
      <a name="{generate-id(host/@name)}"></a>
      <a name="{generate-id(host/@name)}_toc"></a>
      <xsl:text>
 Host: 
</xsl:text>
      <xsl:value-of select="host/@name" />
      <xsl:text>
 IP: 
</xsl:text>
      <xsl:value-of select="host/@ip" />
    </h3>
    
    <table bgcolor="{$table-bgcolor}" border="0" cellpadding="0"
    cellspacing="0" width="100%">
      <tbody>
        <tr>
          <td>
            <table cellpadding="2" cellspacing="1" border="0"
            width="100%">
              <tbody>
                <tr>
                  <td class="title" colspan="4">
                    <xsl:text>
 Findings Summary of Host: 
</xsl:text>
                    <xsl:value-of select="host/@name" />
                    <xsl:text>
 IP: 
</xsl:text>
                    <xsl:value-of select="host/@ip" />
                  </td>
                </tr>
                <tr>
                  <td class="sub" width="40%">Port</td>
                  <td class="sub" width="20%">Vulnerabilites</td>
                  <xsl:if test="$include-warnings='y'"><td class="sub" width="20%">Warnings</td></xsl:if>
                  <xsl:if test="$include-information-items='y'"><td class="sub" width="20%">Information</td></xsl:if>
                </tr>
                <xsl:for-each select="ports/port">
                  <xsl:sort select="@portid" data-type="number" />
                  <tr>
                    <td class="default" width="40%">
                      
		    <xsl:choose>
		      <xsl:when test="
		      (count(./information/severity[text()='Security Hole']) &gt; 0)
		      or (($include-information-items = 'y') and   count(./information/severity[text()='Security Note']) &gt; 0) 
		      or (($include-warnings = 'y') and   count(./information/severity[text()='Security Warning']) &gt; 0)">

                        <a href="#{generate-id(.)}">
                          <xsl:value-of select="./service/@name" />
                          <xsl:if test="./@portid">
                            <xsl:text> (</xsl:text>
                            <xsl:value-of select="./@portid" />
                            <xsl:text>/</xsl:text>
                            <xsl:value-of select="./@protocol" />
                            <xsl:text>) </xsl:text>
                          </xsl:if>
                        </a>
                      </xsl:when>
		      
                      <xsl:otherwise>

                        <xsl:value-of select="./service/@name" />
                        <xsl:if test="./@portid">
                          <xsl:text> (</xsl:text>
                          <xsl:value-of select="./@portid" />
                          <xsl:text>/</xsl:text>
                          <xsl:value-of select="./@protocol" />
                          <xsl:text>) </xsl:text>
                        </xsl:if>
                      </xsl:otherwise>
		      
		      </xsl:choose>
		      
                    </td>
                    <td class="default" width="20%">
                      <xsl:value-of select="count(./information/severity[text()='Security Hole'])" />
                    </td>
                    <xsl:if test="$include-warnings='y'"><td class="default" width="20%">
                      <xsl:value-of select="count(./information/severity[text()='Security Warning'])" />
                    </td></xsl:if>
                    <xsl:if test="$include-information-items='y'"><td class="default" width="20%">
                      <xsl:value-of select="count(./information/severity[text()='Security Note'])" />
                    </td></xsl:if>
                  </tr>
                </xsl:for-each>
                <tr>
                  <td class="sub" width="40%">Host Total</td>
                  <td class="sub" width="20%">
                    <xsl:value-of select="count(./ports/port/information/severity[text()='Security Hole'])" />
                  </td>
                  <xsl:if test="$include-warnings='y'"><td class="sub" width="20%">
                    <xsl:value-of select="count(./ports/port/information/severity[text()='Security Warning'])" />
                  </td></xsl:if>
                  <xsl:if test="$include-information-items='y'"><td class="sub" width="20%">
                    <xsl:value-of select="count(./ports/port/information/severity[text()='Security Note'])" />
                  </td></xsl:if>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </xsl:template>
  <xsl:template match="data">
    <tr>
      <td valign="top" class="default" width="100%">
        <xsl:apply-templates select="p" />
      </td>
    </tr>
  </xsl:template>
  <xsl:template name="nessus-report-issues">
    <xsl:param name="severity_type" />
    <xsl:param name="severity_text" />
    <xsl:param name="fontcolor" select="'black'" />
    <xsl:for-each select="ports/port">
      <xsl:sort select="@portid" data-type="number" />
      <xsl:for-each select="information">
        <xsl:if test="count(./severity[text()=$severity_type]) &gt; 0">

          <tr>
            <td valign="top" class="default" width="10%">
              <font color="{$fontcolor}">
                <xsl:value-of select="$severity_text" />
              </font>
            </td>
            <td valign="top" class="default" width="10%">
              <a name="{generate-id(..)}"></a>
              <xsl:value-of select="../service/@name" />
              <xsl:if test="../@portid">
                <xsl:text> (</xsl:text>
                <xsl:value-of select="../@portid" />
                <xsl:text>/</xsl:text>
                <xsl:value-of select="../@protocol" />
                <xsl:text>) </xsl:text>
              </xsl:if>
            </td>
            <td class="default" width="80%">
              <!--use template to replace newlines in string with <br> -->
              <xsl:call-template name="formatdata">
                <xsl:with-param name="string" select="./data" />
              </xsl:call-template>	      
	      <xsl:if test="$include-links-to-other-hosts-with-issue='y'and $include-list-by-vuln='y'">
	      <a href="#{generate-id(key('datakey', string(data)))}">
	      
           <br/><xsl:text>See list of hosts with this issue</xsl:text>
          </a> </xsl:if>
            </td>
          </tr>
        </xsl:if>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
  <xsl:template match="result" mode="data">
    <xsl:if test="(count(./ports/port/information/severity[text()='Security Hole']) &gt; 0)
    or (($include-information-items = 'y') and 
    	count(./ports/port/information/severity[text()='Security Note']) &gt; 0)
    or (($include-warnings = 'y') and count(./ports/port/information/severity[text()='Security Warning']) &gt; 0)">
      <table bgcolor="{$table-bgcolor}" cellpadding="0"
      cellspacing="0" border="0" width="100%">
        <tbody>
          <tr>
            <td>
              <table cellpadding="2" cellspacing="1" border="0"
              width="100%">
                <tr>
                  <td class="title" colspan="3">
                    <xsl:text>
Security Issues and Fixes for Host: 
</xsl:text>
                    <xsl:value-of select="host/@name" />
                    <xsl:text>
 IP: 
</xsl:text>
                    <xsl:value-of select="host/@ip" />
                  </td>
                </tr>
                <tr>
                  <td class="sub" width="10%">Type</td>
                  <td class="sub" width="10%">Port</td>
                  <td class="sub" width="80%">Issue and Fix</td>
                </tr>
                
		<xsl:call-template name="nessus-report-issues">
                  <xsl:with-param name="severity_type"
                  select="'Security Hole'" />
                  <xsl:with-param name="severity_text"
                  select="'Vulnerability'" />
                  <xsl:with-param name="fontcolor"
                  select="'red'" />
                </xsl:call-template>
		<xsl:if test="$include-warnings='y'">
                <xsl:call-template name="nessus-report-issues">
                  <xsl:with-param name="severity_type"
                  select="'Security Warning'" />
                  <xsl:with-param name="severity_text"
                  select="'Warning'" />
                </xsl:call-template>
               </xsl:if> 
	       <xsl:if test="$include-information-items='y'">
		<xsl:call-template name="nessus-report-issues">
                  <xsl:with-param name="severity_type"
                  select="'Security Note'" />
                  <xsl:with-param name="severity_text"
                  select="'Informational'" />
                </xsl:call-template>
              </xsl:if>
	      </table>
            </td>
          </tr>
        </tbody>
      </table>
    </xsl:if>
  </xsl:template>
  <xsl:template match="results">
   <xsl:if test="$include-scan-summary='y'">
      <xsl:apply-templates select="." mode="scan-details" />
   </xsl:if>
<xsl:if test="$include-list-of-plugins-enabled='y'">
<a href="#toc">Jump to Host Summary</a>
    	<br />
</xsl:if>
<xsl:if test="$include-list-of-plugins-enabled='y' and $include-list-by-vuln='y' and $include-list-by-host!='y'">
    <a href="#listbyvuln">Jump to Findings Sorted by Issue</a>
    <br /><br />
</xsl:if>
<xsl:if test="$include-list-by-vuln='y' and $include-list-by-host='y'">
    <a href="#listbyvuln">Jump to Findings Sorted by Issue</a>
    <br /><br />
</xsl:if>

   <xsl:if test="$include-list-of-plugins-enabled='y'">
      <xsl:apply-templates select="../plugins" mode="plugin-list" />
	<!-- kludge to account for what appears to be a Firefox table rendering bug - if we put breaks here they
             appear as grey space.... --> 
	<table bgcolor="#FFFFFF" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td class="default"><br /><br /></td></tr></table> 

   </xsl:if>

    <xsl:if test="$include-host-summary='y'">
      <xsl:apply-templates select="." mode="toc" />
    </xsl:if>

    <xsl:if test="$include-list-by-host='y'">
      <xsl:apply-templates select="." mode="analysis" />
    </xsl:if>
   
    <xsl:if test="$include-list-by-vuln='y'">
      <xsl:apply-templates select="." mode="analysisbyvuln" />
    </xsl:if>
  </xsl:template>
  <xsl:template match="results" mode="analysis">
     <xsl:if test="$sort-hosts-by='ip'">
     <xsl:for-each select="result">
      <!-- Sort hosts based on IP - Code by Marrow posted to 
        microsoft.public.xsl in 2002 - just like he says, ugly but it works -->
      <xsl:sort select="concat( concat(substring('000',1,3-string-length(substring-before(host/@ip,'.'))),substring-before(host/@ip,'.')),concat(substring('000',1,3-string-length(substring-before(substring-after(host/@ip,'.'),'.'))),substring-before(substring-after(host/@ip,'.'),'.')),concat(substring('000',1,3-string-length(substring-before(substring-after(substring-after(host/@ip,'.'),'.'),'.'))),substring-before(substring-after(substring-after(host/@ip,'.'),'.'),'.')),concat(substring('000',1,3-string-length(substring-after(substring-after(substring-after(host/@ip,'.'),'.'),'.'))),substring-after(substring-after(substring-after(host/@ip,'.'),'.'),'.')))" />
      <xsl:apply-templates select="." mode="toc" />
      <br />
      <br />
      <xsl:apply-templates select="." mode="data" />
    </xsl:for-each>
     </xsl:if>

     <xsl:if test="$sort-hosts-by='vulnerabilities'">
     <xsl:for-each select="result">
      <!-- Sort hosts based on number of vulnerabilities -->
      <xsl:sort select="count(./ports/port/information/severity[text()='Security Hole'])" data-type="number" order="descending" />
<xsl:sort select="count(./ports/port/information/severity[text()='Security Warning'])" data-type="number" order="descending" />
<xsl:sort select="count(./ports/port/information/severity[text()='Security Note'])" data-type="number" order="descending" />
      <xsl:apply-templates select="." mode="toc" />
      <br />
      <br />
      <xsl:apply-templates select="." mode="data" />
    </xsl:for-each>
     </xsl:if>
  </xsl:template>
  <!-- Key used for grouping ( the Muenchian method )
        see http://www.jenitennison.com/xslt/grouping/muenchian.html
        for more info on this method -->
  <xsl:key name="information-by-data" match="information"
  use="data" />


  <xsl:template match="results" mode="analysisbyvuln">
    <br />
    <br />
    <br />
    <a name="listbyvuln"></a>
    <table bgcolor="{$table-bgcolor}" cellpadding="0"
    cellspacing="0" border="0" width="100%">
      <tbody>
        <tr>
          <td>
            <table cellpadding="2" cellspacing="1" border="0"
            width="100%">
              <tr>
                <td class="title" colspan="3">
                  <xsl:text>
Findings Sorted by Issue Text
</xsl:text>
                </td>
              </tr>
              <tr>
                <td class="sub" width="40%">Hostname(s) [IP(s)]
                Port(s)</td>
                <td class="sub" width="10%">Type</td>
                <td class="sub" width="50%">Issue and Fix</td>
              </tr>
	      
             <xsl:call-template name="nessus-report-issues-by-vuln">
                <xsl:with-param name="severity_type"
                select="'Security Hole'" />
                <xsl:with-param name="severity_text"
                select="'Vulnerability'" />
              </xsl:call-template>
              
	      <xsl:if test="$include-warnings='y'">
	      <xsl:call-template name="nessus-report-issues-by-vuln">
                <xsl:with-param name="severity_type"
                select="'Security Warning'" />
                <xsl:with-param name="severity_text"
                select="'Warning'" />
              </xsl:call-template>
	      </xsl:if>
              
	      <xsl:if test="$include-information-items='y'">
	      <xsl:call-template name="nessus-report-issues-by-vuln">
                <xsl:with-param name="severity_type"
                select="'Security Note'" />
                <xsl:with-param name="severity_text"
                select="'Information'" />
              </xsl:call-template>
	      </xsl:if>

            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </xsl:template>
  <xsl:template name="nessus-report-issues-by-vuln">
    <xsl:param name="severity_type" />
    <xsl:param name="severity_text" />
    <xsl:param name="fontcolor" select="'black'" />
    
<xsl:for-each select="result/ports/port/information[severity=$severity_type][count(. | key('information-by-data', data)[1]) = 1]">
      <xsl:sort select="../@portid" data-type="number" />
      <tr>
        <td class="default" width="40%">
          <xsl:for-each select="key('information-by-data', data)">
            <xsl:sort select="../@portid" data-type="number" />
	    
            <a href="#{generate-id(../../../host/@name)}">
              <xsl:value-of select="../../../host/@name" />
            </a>
            <xsl:text> [</xsl:text>
            <a href="#{generate-id(../../../host/@name)}">
              <xsl:value-of select="../../../host/@ip" />
            </a>
            <xsl:text>] </xsl:text>
            <a href="#{generate-id(..)}">
              <xsl:value-of select="../service/@name" />
              <xsl:if test="../@portid">
                <xsl:text> (</xsl:text>
                <xsl:value-of select="../@portid" />
                <xsl:text>/</xsl:text>
                <xsl:value-of select="../@protocol" />
                <xsl:text>) </xsl:text>
              </xsl:if>
            </a>
            <br />
          </xsl:for-each>
        </td>
        <td class="default" width="10%">
          <xsl:if test="contains(severity, 'Security Hole')">
            <font color="red">
              <xsl:value-of select="severity" />
            </font>
          </xsl:if>
          <xsl:if test="not(contains(severity, 'Security Hole'))">
            <xsl:value-of select="severity" />
          </xsl:if>
        </td>
        <td class="default" width="50%">
	  <a name="{generate-id(key('datakey', string(data)))}"></a>
          <xsl:call-template name="formatdata">
            <xsl:with-param name="string" select="data" />
          </xsl:call-template>
        </td>
      </tr>
    </xsl:for-each>
    
  </xsl:template>
  <xsl:template match="report">
    <xsl:choose>
      <xsl:when test="@version = 1.4">
    <xsl:if test="$include-header='y'">
      <xsl:call-template name="nessus-report-header" />
    </xsl:if>
        <xsl:apply-templates select="results" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>
This XSLT is for version 1.4 of the nessus report XML.
</xsl:text>
        <br />
        <xsl:value-of select="$newline" />
        <xsl:text>
This XML is version 
</xsl:text>
        <xsl:value-of select="@version" />
      </xsl:otherwise>
    </xsl:choose>

	<!-- kludge to account for what appears to be a Firefox table rendering bug - if we put text here is 
             will have a grey background.... --> 
	<table bgcolor="#FFFFFF" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td class="default">
	<br /><hr /><br />
	<i>This html file was generated by a transform of the XML output from the
      		<a href="http://www.nessus.org">Nessus</a> security scanner. <br /> The XML Stylesheet was written by Axel Nennker and updated by Chuck Willis. <br />  The most recent version of the stylesheet can be found at <a href="http://www.securityfoundry.com/">http://www.securityfoundry.com/</a>.</i><br /></td>
	</tr></table>
  </xsl:template>

<!-- Variables for newlines and tabs - these get messed up by tidy
	so here is an extra copy 
  <xsl:param name="lang" select="'en'" />
  <xsl:variable name="newline">
    <xsl:text>&#10;</xsl:text>
  </xsl:variable>
  <xsl:param name="lang" select="'en'" />
  <xsl:variable name="tab">
    <xsl:text>&#09;</xsl:text>
  </xsl:variable>
  <xsl:param name="lang" select="'en'" />
  <xsl:variable name="newlinenewline">
    <xsl:text>&#10;&#10;</xsl:text>
  </xsl:variable>
  <xsl:param name="lang" select="'en'" />
  <xsl:variable name="newlinespacenewline">
    <xsl:text>&#10; &#10;</xsl:text>
  </xsl:variable>  <xsl:param name="lang" select="'en'" />
  <xsl:variable name="newlinenewlinenewline">
    <xsl:text>&#10;&#10;&#10;</xsl:text>
  </xsl:variable> -->

  <xsl:param name="lang" select="'en'" /> 
  <xsl:variable name="newline">
    <xsl:text>&#10;</xsl:text>
  </xsl:variable>
  
  <xsl:variable name="tab">
    <xsl:text>&#09;</xsl:text>
  </xsl:variable>
  
  <xsl:variable name="newlinenewline">
    <xsl:text>&#10;&#10;</xsl:text>
  </xsl:variable>
  
  <xsl:variable name="newlinespacenewline">
    <xsl:text>&#10; &#10;</xsl:text>
  </xsl:variable>  
 
  <xsl:variable name="newlinenewlinenewline">
    <xsl:text>&#10;&#10;&#10;</xsl:text>
  </xsl:variable>

  <xsl:template name="formatdata">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="contains($string,$tab)">
        <!--replacing tab with nothing -->
        <xsl:call-template name="formatdata">
          <xsl:with-param name="string"
          select="concat(substring-before($string,$tab), substring-after($string,$tab))" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="starts-with($string,$newline)">
        <!--replacing leading newline with nothing -->
        <xsl:call-template name="formatdata">
          <xsl:with-param name="string"
          select="substring($string, 2)" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains(substring($string, string-length($string)) ,$newline)">

        <!--replacing ending newline with nothing -->
        <xsl:call-template name="formatdata">
          <xsl:with-param name="string"
          select="substring($string, 1, string-length($string)-1)" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($string,$newlinenewlinenewline)">
        <!--replacing three newlines with two -->
        <xsl:call-template name="formatdata">
         <xsl:with-param name="string" select="concat(substring-before($string,$newlinenewlinenewline), concat($newlinenewline, substring-after($string,$newlinenewlinenewline)))"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($string,$newlinespacenewline)">
        <!--replacing two newlines with a space between to just the 
                two newlines - kludge to get rid of some extra empty lines in the output -->
        <xsl:call-template name="formatdata">
          <xsl:with-param name="string" select="concat(substring-before($string,$newlinespacenewline), concat($newlinenewline, substring-after($string,$newlinespacenewline)))"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <!-- otherwise pass string to replacenewlines -->
        <xsl:call-template name="replacenewlines">
          <xsl:with-param name="string" select="$string" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template name="replacenewlines">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="contains($string,$newline)">
        <!--replacing newlines with <br> -->
        <!-- call createlinks function  -->
        <xsl:call-template name="createlinks">
          <xsl:with-param name="string"
          select="substring-before($string,$newline)" />
        </xsl:call-template>
        <br />
        <xsl:call-template name="replacenewlines">
          <xsl:with-param name="string"
          select="substring-after($string,$newline)" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <!-- call createlinks here, too -->
        <xsl:call-template name="createlinks">
          <xsl:with-param name="string" select="$string" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template name="createlinks">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="contains($string,'BID')">
        <xsl:call-template name="bidcreatelinks">
          <xsl:with-param name="string" select="$string" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($string,'CVE-')">
        <xsl:call-template name="cvecreatelinks">
          <xsl:with-param name="string" select="$string" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($string,'CAN-')">
        <xsl:call-template name="cvecreatelinks">
          <xsl:with-param name="string" select="$string" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($string,'http://')">
        <xsl:call-template name="httpcreatelinks">
          <xsl:with-param name="string" select="$string" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$string" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template name="cvecreatelinks">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="contains($string,'CVE-')">
        <xsl:call-template name="cvecreatelinks">
          <xsl:with-param name="string"
          select="substring-before($string,'CVE-')" />
        </xsl:call-template>
        <xsl:variable name="after-cve">
          <xsl:value-of select="substring-after($string,'CVE-')" />
        </xsl:variable>
        <xsl:variable name="cve">
          <xsl:value-of select="substring($after-cve,1,9)" />
        </xsl:variable>
        <a href="http://cgi.nessus.org/cve.php3?cve=cve-{$cve}">
          <xsl:text>
CVE-
</xsl:text>
          <xsl:value-of select="$cve" />
        </a>
        <xsl:call-template name="createlinks">
          <xsl:with-param name="string"
          select="substring($after-cve, 10)" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($string,'CAN-')">
        <xsl:value-of select="substring-before($string,'CAN-')" />
        <xsl:variable name="after-cve">
          <xsl:value-of select="substring-after($string,'CAN-')" />
        </xsl:variable>
        <xsl:variable name="cve">
          <xsl:value-of select="substring($after-cve,1,9)" />
        </xsl:variable>
        <a href="http://cgi.nessus.org/cve.php3?cve=can-{$cve}">
          <xsl:text>
CAN-
</xsl:text>
          <xsl:value-of select="$cve" />
        </a>
        <xsl:call-template name="createlinks">
          <xsl:with-param name="string"
          select="substring($after-cve, 10)" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$string" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template name="bidcreatelinks">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="contains($string,':')">
        <xsl:value-of select="substring-before($string,':')" />
        <xsl:text>
 : 
</xsl:text>
        <xsl:call-template name="bidcreatelinks">
          <xsl:with-param name="string"
          select="substring-after($string,':')" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="contains($string,',')">
        <xsl:call-template name="bidcreatelinks">
          <xsl:with-param name="string"
          select="substring-before($string,',')" />
        </xsl:call-template>
        <xsl:text>
, 
</xsl:text>
        <xsl:call-template name="bidcreatelinks">
          <xsl:with-param name="string"
          select="substring-after($string,',')" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:variable name="bidnumber">
          <xsl:value-of select="normalize-space($string)" />
        </xsl:variable>
        <a href="http://www.securityfocus.com/bid/{$bidnumber}">
          <xsl:value-of select="$bidnumber" />
        </a>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template name="httpcreatelinks">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="contains($string,'http://')">
        <xsl:value-of select="substring-before($string,'http://')" />
        <xsl:variable name="url">
          <xsl:value-of select="substring-after($string,'http://')" />
        </xsl:variable>
        <xsl:choose>
          <xsl:when test="contains($url,' ')">
            <xsl:call-template name="httpcreatelinkremovetrailingdot">

              <xsl:with-param name="string"
              select="substring-before($url,' ')" />
            </xsl:call-template>
            <xsl:text>
 
</xsl:text>
            <xsl:call-template name="createlinks">
              <xsl:with-param name="string"
              select="substring-after($url,' ')" />
            </xsl:call-template>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="httpcreatelinkremovetrailingdot">

              <xsl:with-param name="string" select="$url" />
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$string" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- This template is a kludge to not include in the link a trailing period that 
        can be found in at least one url in the output of Nikto -->
  <xsl:template name="httpcreatelinkremovetrailingdot">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="contains(substring($string, string-length($string)), '.')">

        <a href="http://{substring($string, 1, string-length($string)-1)}">

          <xsl:text>
http://
</xsl:text>
          <xsl:value-of select="substring($string, 1, string-length($string)-1)" />
        </a>
        <xsl:text>
.
</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <a href="http://{$string}">
          <xsl:text>
http://
</xsl:text>
          <xsl:value-of select="$string" />
        </a>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
