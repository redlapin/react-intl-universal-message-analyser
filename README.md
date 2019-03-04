# react-intl-universal-message-analyser
a simple analyse tool acting as "eyes" to scan your app checking if there are redundant messages in your local message files while using react-intl-universal lib. It aimes to reduce your html page size.

This mini programs travers the specified files and compares them to the local message file to see how many messages are not used in your application. 

It helps to manage your international messages to keep your local message file clean.

The output is like the following. This means there are 43 messages used in you application but not appearing in your local international message files. These 43 messages should be applied then. There are 26 messages appearing in your local international message files but not used in your application and these messages should be deleted.

```
number of messages in using: 706
number of messages existing: 689
number of lacked messages: 43
number of redundant messages: 26


list of lacked messages:
key_message_one
key_message_two



list of redundant messages:
key_message_three
key_message_four

```

## Get Started

### Install
```sh
npm install react-intl-universal-message-analyser --save-dev
```

### Usage
add the following shell command to the "script" section in your package.json file:
```
<your script command>: messageCheck -t<target folders to traverse> aa/bb,cc/dd -f<local message file to be compared> aa.json -i<intl variable name used in your js/ts files> intl
```
### Keywords
- react-intl-universal
- redundance check
- analyse tool

