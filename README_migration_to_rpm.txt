Seccubus is available as rpm starting from version 1.5.0. To be compliant with
the LSB, a few changes have to be made to the layout of Seccubus. No problem of
course if you're just starting with Seccubus, but if you already have an
install, a few changes have to be made.

    /home/seccubus            => /opt/Seccubus
    /home/seccubus/www        => /opt/Seccubus/www
    /home/seccubus/bin        => /opt/Seccubus/bin

    /home/seccubus/var        => /var/lib/Seccubus
    /home/seccubus/etc/config => /etc/Seccubus/config

Of these, only the 'var' and the 'config' are site specific. If you move your
scan data from /home/seccubus/var to /var/lib/Seccubus and update
/etc/Seccubus/config to match your /home/seccubus/etc/config, all should be
fine.
The rpm install adds a config file to apache (/etc/httpd/conf.d/Seccubus.conf).
Make sure you remove (or adapt) your previous apache config.
