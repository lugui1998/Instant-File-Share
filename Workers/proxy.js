addEventListener("fetch", (event) => {
    event.respondWith(
      handleRequest(event.request).catch(
        (err) => new Response(err.stack, { status: 500 })
      )
    );
  });
  
  async function handleRequest(request) {
    const url = new URL(request.url);
    url.hostname = 'send.lugui.in';
    url.port = 1443;
  
    return fetch(url.href);
  }