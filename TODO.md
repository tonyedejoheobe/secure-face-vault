- [x] Investigate current repo wiring: identify where “Initialize Storage” triggers edge function invocation

- [ ] Confirm Supabase edge function names invoked by frontend (`src/lib/api.ts`) match deployed function names
- [ ] Verify required env vars are set for frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) on Netlify

- [x] Add improved error reporting so function invocation failures show function name + underlying Supabase error

- [ ] If needed, implement/route a real “initialize storage” edge function (bucket/policies setup) and call it from the UI
- [x] Run build + (if possible) local function tests (client build)

