# Slotwise Netlify Deployment

## Build settings

Build command:

```text
npm run build
```

Publish directory:

```text
dist
```

## Environment variables

Add these in Netlify Site settings, not in source files:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Do not add a service role key, database password, admin password, or private secret to Netlify frontend variables.

## Routing

Netlify uses `netlify.toml` to send all non-asset routes to `index.html`.

This keeps direct URLs working:

```text
/
/smm-admin
/abc-beauty-studio
/xyz-aircon-services
```

## Supabase Auth

Email/password login does not need OAuth redirect configuration.

After deployment, update Supabase Auth URL settings:

1. Open Supabase.
2. Go to Authentication.
3. Open URL Configuration.
4. Set Site URL to your Netlify URL.
5. Add the same Netlify URL to Redirect URLs if Supabase asks for allowed URLs.

Do not enable public signup for this phase.
