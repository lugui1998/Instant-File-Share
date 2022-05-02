addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, { status: 500 })
    )
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  url.host = 'send.lugui.in';
  url.port = 1443;

  return await fetch(url.toString(), {
    headers: headers,
    method: request.method,
    body: request.body,
    redirect: 'manual',
  });
}