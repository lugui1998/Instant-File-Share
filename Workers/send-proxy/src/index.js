export default {
  async fetch(request) {
    return handleRequest(request);
  },
};

async function handleRequest(request) {
  const newURL = new URL(request.url);
  newURL.host = 'send.lugui.in';
  newURL.port = 1443;

  let cache = caches.default;
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  let response = await fetch(newURL.toString(), {
    method: request.method,
    body: request.body,
    redirect: 'manual',
  });

  // cache the response if is is an image
  if (response.headers.get('content-type').startsWith('image/')) {
    cache.put(request, response.clone());
  }

  response = new Response(response.body, response);

  return response;
}