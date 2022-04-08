# Instant File Share

Instant File Share is a project that allows users to share files by generating a URL with a single click on the context menu of any file.

It is a standalone solution which is focused on simplicity and ease of use and not on security (yet). Hence why it uses HTTP instead of HTTPS by default.



## Requirements

- [Node.js](https://nodejs.org/en/) 16.x
- Forward ports in your router.


## Installation on Windows

- Before anything else be sure to have [Node.js](https://nodejs.org/en/) installed and running propperly.
- Start a Terminal as **administrator** (needed for adding the registry key for the context menu entry), navigate to the project's directory and run the following command:

```
npm run setup
```

- Forward port 80 on your router to port 8020

## Notes

- You can change the port in the `config.json` file.
- if you forward a port different than 80, you will need to change the `copy.js` file.

## Usage

Right click on any file and select "Copy Share URL".
The URL will be copied to your clipboard.

## TODO

- Add support for Proxy.
- Add supoort for HTTPS.
- Add support for Cloudflare Workers proxy.