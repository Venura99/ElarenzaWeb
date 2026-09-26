import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache override: the free Workers plan has no R2/KV bindings
// configured, and this site's pages are either static assets or rendered per
// request against Turso.
export default defineCloudflareConfig();
