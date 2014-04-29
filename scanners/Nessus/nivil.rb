#! /usr/bin/env ruby
# Copyright 2013 Frank Breedijk, Zate Berg
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

require 'optparse'
require 'uri'
require 'net/https'
require 'rexml/document'

include REXML


options = {}

optparse = OptionParser.new do |opts|
    opts.banner = "Nessus Wrapper for Seccubus v2\nUsage: ./nivil.rb [options] "
    opts.on('-u', '--user USER', 'Username to login to Nessus') do |username|
      options[:username] = username
    end
    opts.on('-p', '--password PASSWD', 'Password to login to Nessus') do |passwd|
      options[:passwd] = passwd
    end
    opts.on('-s', '--server SERVER', 'Server name (localhost is default)') do |server|
      options[:server] = server
    end
    opts.on('-l', '--policy POLICY', 'Policy to scan with' ) do |policy|
      options[:policy] = policy
    end
    opts.on('-t', '--target TARGET', 'Target to scan') do |target|
      options[:target] = target
    end
    opts.on('-n', '--name NAME', 'Scan name') do |name|
      options[:name] = name
    end
    opts.on('-h', '--help', 'Display help') do
      puts opts
      exit
    end
    opts.on('-f', '--file INFILE', 'File of hosts to scan') do |file|
        options[:file] = file
    end
    opts.on('--show-policies', 'Shows Server Policies') do
        options[:showpol] = true
    end
    opts.on('--show-reports', 'Shows Server Reports') do
        options[:showrpt] = true
    end
    opts.on('-g', '--get-report RPTID', 'Download Report in Nessus V2 format.') do |rpt|
        options[:rptid] = rpt
    end
    opts.on('-o', '--out FILE', 'Optional filename to output to.') do |out|
        options[:out] = out
    end
    opts.on('-c', '--check', 'Checks the status of a report supplied with -g') do
        options[:check] = true
    end
    opts.on('--port PORT', 'Optional portnumber to connect to Nessus. Defaults to 8834.') do |port|
    	options[:port] = port || "8834"
    end
    case ARGV.length
    when 0
      puts opts
      exit
    end
    @fopts = opts
end
optparse.parse!

if !options[:port]
    options[:port] = "8834"
end

if !options[:cfile]
    if !(options[:username] and options[:passwd] and options[:server])
        puts
        puts("**[FAIL]** Missing Arguments")
        puts
        puts @fopts
        exit
    end
end

# Our Connection Class

class NessusConnection
    def initialize(user, pass, server, port)
        @username = user
        @passwd = pass
        @server = server
        @nurl = "https://#{@server}:" + port + "/"
        # @nurl = "https://#{@server}:8834/"
        @token = nil
        @status = nil

    end
    
    def connect(uri, post_data)
        url = URI.parse(@nurl + uri)
        request = Net::HTTP::Post.new( url.path )
        request.set_form_data(post_data)
        if not defined? @https
            @https = Net::HTTP.new( url.host, url.port )
            @https.use_ssl = true
            @https.verify_mode = OpenSSL::SSL::VERIFY_NONE
        end
        begin
            res = @https.request(request)
        rescue
            puts("error connecting to server: #{@nurl} with URI: #{uri}")
            exit
        end
        return res.body
    end
end

def show_policy(options)
    uri = "scan/list"
    post_data = { "token" => @token }
    stuff = @n.connect(uri, post_data)
    docxml = REXML::Document.new(stuff)
    policies=Array.new
    docxml.elements.each('/reply/contents/policies/policies/policy') { |policy|
        entry=Hash.new
        entry['id']=policy.elements['policyID'].text
        entry['name']=policy.elements['policyName'].text
        if policy.elements['policyComments'] == nil
	    entry['comment']=" "
	else
	    entry['comment']=policy.elements['policyComments'].text
	end
        policies.push(entry)
    }
    puts("ID\tName")
    policies.each do |policy|
        puts("#{policy['id']}\t#{policy['name']}")
    end 
end

def login(options)
    uri = "login"
    post_data =  { "login" => options[:username], "password" => options[:passwd] }
    #p post_data
    stuff = @n.connect(uri, post_data)
    docxml = REXML::Document.new(stuff)
    if docxml == '' 
            @token=''
    else
	    begin
	    @status = docxml.root.elements['status'].text
            @token = docxml.root.elements['contents'].elements['token'].text
            @name = docxml.root.elements['contents'].elements['user'].elements['name'].text
            @admin = docxml.root.elements['contents'].elements['user'].elements['admin'].text
	    rescue
	    	puts "error #{@status}"
		sleep 60
		exit
	    end
    end
end

def logout(options)
    uri = "logout"
    post_data = { "token" => @token }
    stuff = @n.connect(uri, post_data)
end

def show_reports(options)
    uri = "report/list"
    post_data = { "token" => @token }
    stuff = @n.connect(uri, post_data)
    docxml = REXML::Document.new(stuff)
    reports=Array.new
    docxml.elements.each('/reply/contents/reports/report') {|report|
        entry=Hash.new
        entry['id']=report.elements['name'].text if report.elements['name']
        entry['name']=report.elements['readableName'].text if report.elements['readableName']
        entry['status']=report.elements['status'].text if report.elements['status']
        entry['timestamp']=report.elements['timestamp'].text if report.elements['timestamp']
        reports.push(entry)
    }
    puts("ID\tName")
    reports.sort! { |a,b| b['timestamp'] <=> a['timestamp'] }
    reports.each do |report|
        t = Time.at(report['timestamp'].to_i)
        puts("#{report['id']}\t#{report['name']}\t\t#{t.strftime("%H:%M %b %d %Y")}")
    end 
end

def get_report(options)
    status = nil
    uri = "scan/list"
    post_data = { "token" => @token }
    stuff = @n.connect(uri, post_data)
    begin
    docxml = REXML::Document.new(stuff)
    docxml.elements.each('/reply/contents/scans/scanList/scan') {|scan|
        
        if scan.elements['uuid'].text == options[:rptid]
            @status = scan.elements['status'].text
            @now = scan.elements['completion_current'].text
            @total = scan.elements['completion_total'].text   
        end
    }
    rescue
#	puts ("Warning: cannot get scan status")
    end
    
    puts("#{@status}|#{@now}|#{@total}")
    if @status != "OK"
        #puts("Scan it not completed, cannot download")
        exit
    end
    stuff = nil
    uri = "file/report/download"
    post_data = { "token" => @token, "report" => options[:rptid]  }
    stuff = @n.connect(uri, post_data)
    
    if options[:rptid]
        if options[:out]
            File.open("#{options[:out]}.nessus", 'w') {|f| f.write(stuff) }
            exit
        else
            File.open("#{options[:rptid]}.nessus", 'w') {|f| f.write(stuff) }
            exit
        end
        
    else
        puts("Error: No Report Specified")
    end
end


@n = NessusConnection.new(options[:username], options[:passwd], options[:server], options[:port])

if options[:showpol]
    login(options)
    show_policy(options)
    logout(options)
    exit
end

if options[:showrpt]
    login(options)
    show_reports(options)
    logout(options)
    exit
end

if options[:rptid]
    login(options)
    get_report(options)
    logout(options)
    exit
end

login(options)

##verify policy
uri = "scan/list"
pid = options[:policy]
post_data = { "token" => @token }
stuff = @n.connect(uri, post_data)
docxml = REXML::Document.new(stuff)
policies=Array.new
docxml.elements.each('/reply/contents/policies/policies/policy') { |policy|
    entry=Hash.new
    entry['id']=policy.elements['policyID'].text
    entry['name']=policy.elements['policyName'].text
    if policy.elements['policyComments'] == nil
        entry['comment']=" "
    else
	entry['comment']=policy.elements['policyComments'].text
    end
    policies.push(entry)
}
match = nil
policies.each {|p|
    if p['id'].to_i == pid.to_i
        match = pid
        next
    end
}
if match.nil?
    puts("No Matching Policy ID: #{pid}")
    exit
end

tgts = ""

if options[:file]
	File.open("#{options[:file]}", "r") do |tgtf|
		while (line = tgtf.gets)
			tgts << line
			tgts << ","
		end
	end
	tgts.chop!
else
	tgts = options[:target]
end

#start scan
uri = "scan/new"
post_data = { "token" => @token, "policy_id" => options[:policy], "scan_name" => options[:name], "target" => tgts }
stuff = @n.connect(uri, post_data)
docxml = REXML::Document.new(stuff)
uuid=docxml.root.elements['contents'].elements['scan'].elements['uuid'].text

puts("#{uuid}")




