# README

This includes material from the Elite Dangerous wiki at Fandom and is licensed under the Creative Commons Attribution-Share Alike License.

* https://elite-dangerous.fandom.com
* https://www.fandom.com/licensing

The purpose of exporting this data is to be able to provide additional information inside ICARUS Terminal, such as context sensitive information about modules, equipment, items, factions, etc and to provide a glossary/codex.

This will be done with appropriate licensing information and credits / backlinks.

## Exporting Data via API

This can be exported using the API via REST queries:

https://elite-dangerous.fandom.com/api.php?action=query&list=allpages&aplimit=500&export=true&format=json

## Data Dump via API

The Wiki Team have writen a python2 script to help with exporting data in bulk:

https://github.com/WikiTeam/wikiteam/wiki/Tutorial

To use this script you will need to have Python v2 installed and install dependancies:

    curl https://bootstrap.pypa.io/pip/2.7/get-pip.py --output get-pip.py
    sudo python2 get-pip.py
    pip2 install kitchen requests mwclient lxml

Note: Some of the documentation on the offical site is wrong, this is an example of the correct way to use this script:

    python2 dumpgenerator.py --api=https://elite-dangerous.fandom.com/api.php --xml --curonly --images --resume --delay=1

This will generate an XML dump of the site.

The text on this wiki is released under Creative Commons Attribution-Share Alike License.