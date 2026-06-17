export async function GET() {
  const payload = JSON.stringify({ type: 'AUTH_ERROR', error: 'Auth is disabled for this local MVP' });
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Auth disabled</title>
</head>
<body>
<script>
if (window.parent && window.parent !== window) {
  window.parent.postMessage(${payload}, '*');
}
</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
