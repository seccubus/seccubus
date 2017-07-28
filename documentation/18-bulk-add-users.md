---
version: 2
category: user
layout: page
title: Adding multiple users in one go
---
# Is it possible to add users in bulk?

Yes you can, via the command prompt:

```bash
for name in user1 user2 user3 user4 user5; do
	bin/add_user -u $name --name $name --isadmin
	bin/seccubus_passwd -u $name -p=NotVerySecureThisIs
done
```
