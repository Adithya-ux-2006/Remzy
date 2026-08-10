# Google sign-in: one-time provider setup

The Remzy application code, callback route, profile provisioning, and guest-data migration are automated. Google and Supabase require the project owner to create and paste the OAuth credential once.

## 1. Google Auth Platform

Create a **Web application** OAuth client for Remzy with only the `openid`, email, and profile scopes.

Authorized JavaScript origins:

- `https://remzyy.netlify.app`
- `http://localhost:5173`

Authorized redirect URI:

- `https://rbnscuuujybrhhsggdof.supabase.co/auth/v1/callback`

Copy the generated Client ID and Client Secret. Do not add either value to this repository or to a `VITE_*` environment variable.

## 2. Supabase Auth

For project `rbnscuuujybrhhsggdof`:

1. Open **Authentication → Providers → Google**.
2. Enable Google and paste the Client ID and Client Secret.
3. Under **Authentication → URL Configuration**, set the Site URL to `https://remzyy.netlify.app`.
4. Add these redirect URLs:
   - `https://remzyy.netlify.app/auth/callback`
   - `http://localhost:5173/auth/callback`
   - `https://**--remzyy.netlify.app/auth/callback` for Netlify previews

## 3. Automated verification

Run:

```powershell
npm run auth:verify-google
```

The command reads the public Supabase Auth settings and fails until the Google provider is enabled. It never prints the public key, Client ID, or Client Secret.
