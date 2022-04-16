# Instant File Share

Instant File Share is a project that allows users to share files by generating a URL with a single click on the context menu of any file.

It is a standalone solution which is focused on simplicity and ease of use, intended to creating temporary links for files on your machine and not for generating permanent links.

This works by setting up a http server on the local machine and then serving the file on a randomly generated route. Forwarding ports is necessary so requests to the generated URL are not blocked by the router.

Multiple machines on the same network can use the system as long as they are running it on different ports.

## Requirements

- [Node.js](https://nodejs.org/en/) 16.x
- Forward ports in your router.


## Installation on Windows

- Before anything else be sure to have [Node.js](https://nodejs.org/en/) installed and running propperly.
- Clone or download this repository to the directory you want to install it to.
- Start a cmd terminal as **administrator** (needed for adding the registry key for the context menu entry), navigate to the project's directory and run the following command:

```
npm run setup
```

- Forward port 80 on your router to port 1080 (or wharever port you set the config.json file). In case you want to use the Cloudflare setup with HTTPS, forward port 443 to 1443 instead.


## Notes

- You can change the ports in the `server/config.json` file.
- If you change the local API port you will need to change it on the `command/copy.js`` script.
- Using ports othe rthan 80 and 443 will result in a URL that contains the port number. ``e.g. https://example.com:8080/file``

## Advanced: Cloudflare Setup

This part assumes you have your domain already setup with Cloudflare.

### DDNS Setup
- Create a A record subdomain for the DDNS (e.g. `ip`) with proxy status **DISABLED**.
- Create a Worker with the contents of the ``workers/ddns.js`` file.
- FIll the data of the worker replacing:
``ZONE_HERE`` with the zone ID of the A record.
``SUBDOMAIN_HERE`` with the subdomain of the A record.
``YOUR_HASH_HERE`` with the [sha256](https://emn178.github.io/online-tools/sha256.html) hash of a string of your choice.
``SUBDOMAIN_ID_HERE`` with the ID of the A record.
``YOUR_EMAIL_HERE`` with your email address.
``YOUR_API_KEY_HERE`` with your Cloudflare API key.
It should look like this:
```JS
const API = 'https://api.cloudflare.com/client/v4/' +
  'zones/6edsx0986s0dd7sf60s78dhf0sdfb/';
const SUBDOMAINS = [
  {
    domain: 'ip',
    key: 'a8s7dfg57as6d5gh87asd4h8asd4h86a5sd4h9qsd67rgh7a6sdh9asd6h4',
    id: '5hfd6s5d8fh6sad8afhj67486',
  },
];

const AUTH = {
    email: 'example@example.',
    key: '4sd7f685h43s87d56fhasdfgsad95'
}
```
- To finish, fill the `ddns` entry of the `command/config.json` file with the URL of your Worker and the password you hashed above.

### Proxy Setup

- Create a subdomain for the proxy, this will be the URL you send to people (e.g. `send`)
- Set up a Worker with the contents of `workers/proxy.js`
- Edit thescript's hostname to include its url and port it is going to forward the requests.
- Save and assign it to the subdomain you created.
- Generate a new certificate for the domain.
- Save the certificate file on your computer. (Preferably on the projects data folder)
- Fill the path of the cert and key files in the `server/config.json` file.


## Usage

Right click on any file and select "Copy Share URL".
The URL will be copied to your clipboard.

## TODO

- Add supoort for HTTPS. ✔️
- Add support for Cloudflare Workers proxy. ✔️
- Add support for third party web server Proxy.

