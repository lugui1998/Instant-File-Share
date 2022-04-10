const API = 'https://api.cloudflare.com/client/v4/' +
  'zones/ZONE_HERE/';
const SUBDOMAINS = [
  {
    domain: 'SUBDOMAIN_HERE',
    key: 'YOUR_HASH_HERE',
    id: 'SUBDOMAIN_ID_HERE',
  },
];

const AUTH = { // Your Cloudflare API credentials
    email: 'YOUR_EMAIL_HERE',
    key: 'YOUR_API_KEY_HERE',
}

addEventListener('fetch', function(event) {
  event.respondWith(
    handleRequest(event.request).catch(handleError)
  );
});

async function handleRequest(request) {
  if (!request.headers.has('X-Auth')){
    return new Response(null, {
      status: 400
    });
  }

  const key = await sha256(request.headers.get('X-Auth'));
  const sub = SUBDOMAINS.find(s => s.key === key);
  if (!sub) {
    return new Response(null, {
      status: 400
    });
  }

  const ip = request.headers.get('CF-Connecting-IP');
  await updateIp(sub.domain, sub.id, ip);

  return new Response('ok ' + sub.domain, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8'
    }
  });
}

function handleError(error) {
  console.error('Uncaught error:', error)

  const { stack } = error
  return new Response(stack || error, {
    status: 500,
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8'
    }
  })
}

async function updateIp(sub, id, ip) {
  await fetch(API + 'dns_records/' + id, {
    method: 'PUT',
    headers: {
      'X-Auth-Email': auth.email,
      'X-Auth-Key': auth.key,
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      'type': 'A',
      'name': sub,
      'content': ip,
    }),
  });
}

function buf2hex(buffer) {
  return [...new Uint8Array(buffer)].map(
    x => x.toString(16).padStart(2, '0')
  ).join('');
}

async function sha256(data) {
  return buf2hex(await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(data)
  ));
}
