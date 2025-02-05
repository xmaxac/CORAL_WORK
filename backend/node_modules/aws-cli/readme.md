# AWS-CLI

# Deprecated

This module only implemented the iam-servercertdel command.  I would recommend
using the official AWS CLI tools, available here:

https://www.npmjs.com/package/aws-sdk

## Command Line tools for Amazon Web Services

The purpose of these tools are to provide an alternative to the Java command line tools, and use
the aws-sdk node project.

These tools are at a very early stage and only one command is supported.

### To Install

```sh
npm install -g aws-cli
```

Edit the config.json file, to include your AWS keys

### To Use

All commands prefixed by aws, e.g.:

```sh
aws iam-servercertdel -s CERTIFICATE_NAME
```

## Commands Supported

[iam-servercertdel](http://docs.aws.amazon.com/IAM/latest/CLIReference/servercertdel.html)

```sh
aws iam-servercertdel -s CERTIFICATE_NAME
```
