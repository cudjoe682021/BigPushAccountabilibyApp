# BigPush Watchdog (Phase 2)

Community reporting app: residents pick a project, report a problem, and see
verified vs. reported status separately. Built fresh against the Phase 1 API
since no existing Watchdog repo was found — this replaces "extend the
existing screens" with "these are the screens," matching the six originally
planned (Splash, Home Dashboard, Project Detail, Report a Problem,
Confirmation, Notifications).

## Setup

```bash
cd mobile
npm install
```

Set the deployed API URL in `app.json` under `expo.extra.apiBaseUrl` (defaults
to `http://localhost:3000` for local development against the `../` backend).
                                                                      
```bash
npm start
```
## What's here

- **Home Dashboard** — lists projects from `GET /api/projects` with a status badge (on schedule / delayed / work stopped / not recently verified).                                                                      
- **Project Detail** — verified inspections and community reports shown in two separate sections, per the platform's rule that they never merge.
- **Report a Problem** — category buttons, GPS auto-captured via expo-location, optional name/phone, submits to `POST /api/community-reports`.
- **Confirmation** — shows how many other reports exist on the same project in the last 30 days (the read-time "grouping" the API provides).
- **Notifications** — placeholder until Phase 5's alert job exists.

## Not yet wired

- Photo/video attachment (`expo-image-picker` is in `package.json` but the Report screen doesn't call it yet, and Cloudinary upload isn't wired up).
- Push notifications for real alerts (Phase 5).                                                                      
- Any offline queueing for reports submitted with no signal.                                                                      
