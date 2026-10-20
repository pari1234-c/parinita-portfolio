# Parinita Choudhari — Portfolio

A responsive personal portfolio built with HTML, CSS, and JavaScript. It uses the provided photos, certificate PDFs, patent publication PDFs, and final resume.

## Run locally
1. Extract the ZIP.
2. Open `parinita-portfolio-final` in VS Code.
3. Open `index.html` with Live Server, or open the file in a browser.

## Included features
- Animated typewriter introduction, scroll reveal effects, orbit animation, moving interest ticker, and scroll progress indicator
- Responsive navigation and mobile menu
- Education timeline, skill chips, project cards, leadership and achievement sections
- One mixed photo gallery with no category filters; click any image to enlarge it
- Direct links to original certificates and patent publication PDFs
- Downloadable final resume
- Optional visitor hello form

## Visitor tracking limitation
The optional visitor hello form stores submitted names in the current browser's local storage only. It does **not** send visitor identities to the portfolio owner or track visitors across devices. To do that, connect a backend such as Firebase, Supabase, or a Google Apps Script web app and configure its endpoint. Do not represent the demo form as global visitor tracking.

## Personal details
- GitHub: https://github.com/pari1234-c
- LinkedIn: https://www.linkedin.com/in/parinita-choudhari-927706362/
- Public email: parinita.choudhari.batch2024@sitnagpur.siu.edu.in

The site is static and does not require a build step.


## Visitor count, IP address and approximate location (Vercel + Supabase)
The portfolio now includes serverless tracking endpoints and a private dashboard page. This feature is **not active until the backend is configured and deployed**.

### 1. Create the database
1. Create a Supabase project.
2. Open its SQL Editor and run `supabase-visitors.sql`.
3. In Project Settings → API, copy the Project URL and `service_role` key. Keep the service-role key secret.

### 2. Add Vercel environment variables
In your Vercel project → Settings → Environment Variables, add:
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = the secret service-role key (server-side only)
- `ADMIN_DASHBOARD_PASSWORD` = a strong, unique password for your private visitor dashboard

Redeploy after adding variables.

### 3. Use the dashboard
- Public portfolio: `/`
- Private dashboard: `/admin.html`
- The footer shows only the aggregate visit count.
- The dashboard shows the 500 most recent visits, including IP, approximate city/region/country, optional coordinates, timestamp, user-agent, and referrer.
- The public website does not return the IP/location records. Only the password-protected server endpoint returns them.

### Important privacy/security notes
- This records visitor IP addresses and approximate IP-derived location. Add/retain the privacy notice and follow applicable privacy requirements.
- IP geolocation is approximate and can be wrong, especially with VPNs, proxies, mobile networks or shared networks.
- The dashboard password is checked server-side. Do not put Supabase service-role keys or the dashboard password in frontend code.
- The dashboard endpoint uses a simple shared password; for a public-facing professional site, consider upgrading to a proper authenticated admin account and rate limiting.
- Visits made while running a local file preview will not be logged. The Vercel deployment is required for Vercel geolocation headers.
