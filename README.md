# Instant File Share

Instant File Share is a project that allows users to share files by generating a URL with a single click on the context menu of any file.

It is a standalone solution which is focused on simplicity and ease of use.

This works by setting up a http server on the local machine and then serving the file on a randomly generated route. Forwarding the port is necessary so requests to the generated URL are not blocked by the router.



## Requirements

- [Node.js](https://nodejs.org/en/) 16.x
- Forward ports in your router.


## Installation on Windows

- Before anything else be sure to have [Node.js](https://nodejs.org/en/) installed and running propperly.
- Start a cmd terminal as **administrator** (needed for adding the registry key for the context menu entry), navigate to the project's directory and run the following command:

```
npm run setup
```

- Forward port 80 on your router to port 8020

## Notes

- You can change the port in the `config.json` file.
- if you forward a port different than 80, you will need to change the `copy.js` file.

## Advanced: Cloudflare Setup

This part assumes you have your domain already setup with Cloudflare.

- Create a subdomain for your project (or not)
- Set up a Worker with the contents of `workers/proxy.js`
- Edit the Worker's hostname to include its url and port it is going to forward the requests.
- Save it, assign to the domain or subdomain you created and enable it.
- Generate a new certificate for the domain.
- Save the certificate files on the project's directory (recommended to keep them in a separate directory such as `data/cert/`).
- Fill the data of the cert and key files in the `config.json` file.


## Usage

Right click on any file and select "Copy Share URL".
The URL will be copied to your clipboard.

## TODO

- Add supoort for HTTPS. ✔️
- Add support for Cloudflare Workers proxy. ✔️
- Add support for third party web server Proxy.

