# KDN Admin – setup (one time, ~30 min)

Admin panel: **https://kdnfitness.com/admin**
Tabs: Inbox (read/reply/new mail), Users (members, KDN ID, validity), Payments (Razorpay + manual UPI), Coupons, Website (plan prices, announcement bar, email signature).

Do the steps in order. Everything is in the Cloudflare dashboard unless it says otherwise.

## 1. Database (D1)
1. Cloudflare → **Storage & Databases → D1** → **Create** → name `kdn-admin`.
2. Open it → **Console** → paste the whole of `db/schema.sql` → **Execute**.
3. Copy the **Database ID** (needed in step 5).
4. **Workers & Pages → your kdnfitness Pages project → Settings → Bindings → Add → D1 database**
   Variable name `DB`, database `kdn-admin`. Add it for **Production**.

## 2. Lock /admin with Cloudflare Access (login)
1. Cloudflare → **Zero Trust** (pick the Free plan if asked; choose a team name, e.g. `kdnfitness`).
2. **Access → Applications → Add → Self-hosted**.
   - Name: `KDN Admin`
   - Domain: `kdnfitness.com`, path: `admin`
   - Policy: **Allow**, Include → **Emails** → your email (e.g. kabirdiwaan7@gmail.com)
   - Login method: One-time PIN (email code).
3. After saving, open the application → copy the **Application Audience (AUD) Tag**.
4. Your team domain is `<team-name>.cloudflareaccess.com` (Zero Trust → Settings → Custom pages / Team domain).

## 3. Sending mail (Resend)
1. Sign up at resend.com → **Domains → Add** `kdnfitness.com` → it shows DNS records.
2. Add those records in Cloudflare DNS (they are on `send.` and `resend._domainkey`, so Hostinger mail keeps working). Wait until Resend says **Verified**.
3. Resend → **API Keys → Create** (Sending access) → copy the key.

## 4. Pages project variables
Pages project → **Settings → Variables and Secrets** (Production). Add:

| Name | Value | Type |
|---|---|---|
| `ACCESS_TEAM_DOMAIN` | `kdnfitness.cloudflareaccess.com` (your team) | Text |
| `ACCESS_AUD` | AUD tag from step 2 | Secret |
| `ADMIN_EMAILS` | your email (comma-separate for more) | Text |
| `RESEND_API_KEY` | key from step 3 | Secret |
| `MAIL_FROM` | `KDN Fitness <support@kdnfitness.com>` | Text |
| `RAZORPAY_WEBHOOK_SECRET` | any long random text (same as step 6) | Secret |

Then **Deployments → Retry deployment** (or push any commit) so the new settings apply.

## 5. Receiving mail in the admin
Mail keeps landing in the Hostinger mailbox; a copy is forwarded to Cloudflare, which saves it for the admin.

1. Put the D1 Database ID into `email-worker/wrangler.toml` (or send it to Claude to do it).
2. Cloudflare → **Workers & Pages → Create → Import a repository** → `kdnlite/fitness`, **root directory** `email-worker`, project name `kdn-inbox` → Deploy.
3. Cloudflare → kdnfitness.com → **Email → Email Routing → Settings → Subdomains → Add** `in.kdnfitness.com` (adds its MX records; the main domain's Hostinger MX stays untouched).
4. Email Routing → **Routing rules → Catch-all** for `in.kdnfitness.com` → Action **Send to a Worker** → `kdn-inbox`.
5. Hostinger → **Emails → support@kdnfitness.com → Forwarders** → forward to `inbox@in.kdnfitness.com`, **keep a copy** in the mailbox.
6. Test: send a mail from Gmail to support@kdnfitness.com → it should appear in the admin Inbox within a minute.

## 6. Razorpay (when live payments start)
Razorpay Dashboard → **Settings → Webhooks → Add**
- URL: `https://kdnfitness.com/api/razorpay/webhook`
- Secret: same as `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured`, `payment.failed`, `refund.processed`

At checkout pass `notes: { email, plan: "ind" | "fam" | "gym", name, coupon }`.
On a captured payment the member is created/extended by 3 months, gets a KDN ID, and is emailed the ID + validity.

## Public endpoints used by the website/app
- `GET /api/public/content` – plan prices + banner (used by `/kdn-live.js` on the home page).
- `POST /api/public/coupon` `{code, plan}` – checks a coupon from the Coupons tab.
