export default {
  async fetch(request) {
    return handleRequest(request);
  },
};

async function handleRequest(request) {
  const newURL = new URL(request.url);
  newURL.host = 'send.lugui.in';
  newURL.port = 1443;

  let response = await fetch(newURL.toString(), {
    method: request.method,
    body: request.body,
    headers: request.headers,
    redirect: 'manual',
  });

  response = new Response(response.body, response);

  return response;
}