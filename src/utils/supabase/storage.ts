// ⚠️  MOVED TO BACKEND — do not use this file.
//
// STL uploads and signed-URL generation use the service-role Supabase client,
// which must never run in the browser.  All storage operations are handled by
// the Express server in server/routes/orders.js  (upload) and
// server/routes/admin.js  (signed-URL download).
