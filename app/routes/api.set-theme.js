import { json, createCookieSessionStorage } from '@remix-run/node';

const VALID_THEMES = ['dark', 'light'];

export async function action({ request }) {
  const formData = await request.formData();
  const theme = formData.get('theme');

  if (!VALID_THEMES.includes(theme)) {
    return json({ status: 'error' }, { status: 400 });
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.error('[security] SESSION_SECRET is not set — session integrity is compromised');
  }

  const { getSession, commitSession } = createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 604_800,
      path: '/',
      sameSite: 'lax',
      secrets: [secret || 'neuralis-dev-secret'],
      secure: process.env.NODE_ENV === 'production',
    },
  });

  const session = await getSession(request.headers.get('Cookie'));
  session.set('theme', theme);

  return json(
    { status: 'success' },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    }
  );
}
