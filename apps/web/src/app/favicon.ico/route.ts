export function GET(request: Request) {
  const url = new URL('/icon', request.url);
  return Response.redirect(url, 308);
}


