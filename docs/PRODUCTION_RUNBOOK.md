# EVNuvora — Production Hardening, Monitoring, Backups & Rollback Runbook

This runbook documents the operational standards for EVNuvora production infrastructure.

---

## 1. Secrets Management & Environment Isolation

### A. Environment Matrix

| Service | Environment Variable | Secret / Description | Config Location |
|---|---|---|---|
| **Render Backend** | `DATABASE_URL` | Neon Connection String (Pooled) | Render Dashboard $\to$ Environment |
| **Render Backend** | `DATABASE_URL_UNPOOLED` | Neon Direct Connection String | Render Dashboard $\to$ Environment |
| **Render Backend** | `JWT_ACCESS_SECRET` | 32+ char random cryptographic key | Render Dashboard $\to$ Environment |
| **Render Backend** | `JWT_REFRESH_SECRET` | 32+ char random cryptographic key | Render Dashboard $\to$ Environment |
| **Render Backend** | `RAZORPAY_KEY_ID` | Production/Test Razorpay Key ID | Render Dashboard $\to$ Environment |
| **Render Backend** | `RAZORPAY_KEY_SECRET` | Production/Test Razorpay Secret | Render Dashboard $\to$ Environment |
| **Vercel Admin** | `VITE_API_BASE_URL` | `https://evnuvora-api.onrender.com/api/v1` | Vercel Settings $\to$ Env Vars |
| **EAS Mobile Build** | `EXPO_PUBLIC_API_URL` | `https://evnuvora-api.onrender.com/api/v1` | `apps/mobile/eas.json` |

> [!CAUTION]
> **Secret Rotation Rule**:
> Never commit `.env` files with live production secrets to GitHub. If a secret key was ever committed during initial development, immediately generate a replacement in the Neon / Razorpay dashboard and update the Render environment variables.

---

## 2. Monitoring & Uptime Alerts

### A. Automated Uptime Heartbeat
Configure an uptime monitor (e.g. [UptimeRobot](https://uptimerobot.com) or [BetterStack](https://betterstack.com)) targeting:
```http
GET https://evnuvora-api.onrender.com/api/v1/health
```
- **Interval**: 5 minutes
- **Expected Status**: `200 OK`
- **Payload Verification**:
  ```json
  {
    "status": "healthy",
    "services": {
      "database": "connected"
    }
  }
  ```
- **Alert Channel**: Email / Slack / Telegram on 2 consecutive failed health checks.

### B. Render Health & Log Alerts
- Under **Render Dashboard $\to$ Settings $\to$ Notifications**, connect an alert webhook or email for:
  - Deploy Failed
  - Service Crashed / Unhealthy

---

## 3. Database Backups & Point-in-Time Recovery (PITR)

### A. Neon Point-in-Time Recovery
- Neon provides continuous write-ahead logging (WAL) enabling point-in-time restore to any second within the retention window.
- **Retention**: Verify the active branch retention under Neon Console $\to$ Project Settings.

### B. Manual / Scheduled pg_dump Cold Backups
To take an offsite backup snapshot from PowerShell:
```powershell
pg_dump "YOUR_DATABASE_URL_UNPOOLED" -F c -b -v -f "evnuvora_backup_$(Get-Date -Format 'yyyyMMdd_HHmm').dump"
```

### C. Test Restore Procedure
1. Create a temporary testing branch in Neon:
   ```bash
   neon branches create --name test-restore-branch
   ```
2. Verify table count and PostGIS extension on the new branch:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
3. Destroy the test branch after confirmation:
   ```bash
   neon branches delete test-restore-branch
   ```

---

## 4. Release Checklist & Rollback Runbook

### Pre-Release Checklist
1. **Migrations**: Add any new tables/columns in `server/src/db/migrations/` and execute `npm run db:migrate` against Neon **before** pushing backend code.
2. **Local Lint & Build Verification**:
   ```powershell
   npm run lint
   npm run build
   cd apps/mobile
   npx expo export --platform android
   ```
3. **EAS Android Production Build (AAB)**:
   ```powershell
   cd apps/mobile
   npx eas-cli build --platform android --profile production
   ```
4. **Google Play Console Upload**:
   - Upload the generated `.aab` to Internal Testing track.
   - Run a smoke test on a physical Android device.
   - Promote to Closed Testing or Production track.

### Rollback Runbook (Emergency Revert)
- **Render Backend**: Render Dashboard $\to$ Deploys $\to$ Select previous successful build $\to$ Click **Rollback**.
- **Vercel Admin**: Vercel Dashboard $\to$ Deployments $\to$ Select previous working build $\to$ Click **Promote to Production**.
- **Neon Database**: If an additive migration must be undone, write and execute a new corrective migration file (e.g. `00X_revert_...sql`). Never modify historical migration files directly.
