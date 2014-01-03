A node.js wrapper for aptitude package management. Currently only supports 3 methods:

### Update

Uses `apt-get update` to update the local apt cache

### Show

Uses `dpkg -s` to parse some data about a named package

### Install

Uses `apt-get install -y` to install a package

### Uninstall

Uses `apt-get remove -y` to remove a package
