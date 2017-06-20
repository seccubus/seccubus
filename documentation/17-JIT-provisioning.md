---
version: 2
category: user
layout: page
title: JIT provisioning of users
---
# Is it possible to provision users Just In Time (JIT)?

Seccubus supports JIT provisioning of users if usernames are injected via a header as of development version 2.35.2 or release 2.36.

Let assume you have the following in your configuration file:

```
    <auth>
        <http_auth_header>REMOTEUSER</http_auth_header>
        <sessionkey><Some randomString></sessionkey>
        <jit_group>ADMINISTRATORS</jit_group>
    </auth>
```

This configuration sniplet derects Seccubus for the following behaviour.

Assume there is an authenticating proxy between Seccubus and the user

```
+------+           +-------+           +----------+
| User | --------> | Proxy | --------> | Seccubus |
+------+           +-------+           +----------+
```

This proxy authenticates users and injects the username in a header like this:

```
REMOTEUSER: seccubus
```

If the user doesn't exist and the `<jit_group>` directive exists, the user will be created on the fly, if jit_group is set to `ADMINISTRATORS` the user will be created on the fly and be granted adminstrator privileges.