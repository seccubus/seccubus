# ------------------------------------------------------------------------------
# Copyright 2017 Frank Breedijk, Glen Hinkle
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

# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "bento/fedora-25"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  #config.vm.network "forwarded_port", guest: 8443, host: 8443, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
  #   vb.memory = "1024"
  # end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Define a Vagrant Push strategy for pushing to Atlas. Other push strategies
  # such as FTP and Heroku are also available. See the documentation at
  # https://docs.vagrantup.com/v2/push/atlas.html for more information.
  # config.push.define "atlas" do |push|
  #   push.app = "YOUR_ATLAS_USERNAME/YOUR_APPLICATION_NAME"
  # end

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", inline: <<-SHELL
  #   apt-get update
  #   apt-get install -y apache2
  # SHELL

  config.vm.define "f24" do |f|
    f.vm.network "forwarded_port", guest: 8443, host: 8824, host_ip: "127.0.0.1"
    f.vm.box = "bento/fedora-24"
  end

  config.vm.define "f25" do |f|
    f.vm.network "forwarded_port", guest: 8443, host: 8825, host_ip: "127.0.0.1"
    f.vm.box = "bento/fedora-25"
  end

  #config.vm.define "f26" do |f|
  #  f.vm.network "forwarded_port", guest: 8443, host: 8826, host_ip: "127.0.0.1"
  #  f.vm.box = "bento/fedora-26"
  #end

  config.vm.define "u14" do |f|
    f.vm.network "forwarded_port", guest: 8443, host: 8814, host_ip: "127.0.0.1"
    f.vm.box = "bento/ubuntu-14.04"
  end

  config.vm.define "u16" do |f|
    f.vm.network "forwarded_port", guest: 8443, host: 8816, host_ip: "127.0.0.1"
    f.vm.box = "bento/ubuntu-16.04"
  end

  config.vm.define "d8" do |f|
    f.vm.network "forwarded_port", guest: 8443, host: 8808, host_ip: "127.0.0.1"
    f.vm.box = "bento/debian-8.2"
  end

  config.vm.define "d9" do |f|
    f.vm.network "forwarded_port", guest: 8443, host: 8809, host_ip: "127.0.0.1"
    f.vm.box = "bento/debian-9.0"
  end

  config.vm.define "c7" do |f|
    f.vm.network "forwarded_port", guest: 8834, host: 18834, host_ip: "127.0.0.1"
    f.vm.box = "bento/centos-7.3"
  end


end
