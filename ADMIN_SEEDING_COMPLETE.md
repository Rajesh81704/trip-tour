# ✅ Admin User Seeding Complete

**Date:** July 19, 2026  
**Status:** ✓ Admin user successfully created in new cluster

## Admin Credentials

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Email** | `admin@triptootravels.com` |
| **Password** | `admin@123` |

## How to Login

1. Go to your admin panel: `http://103.138.96.92:8000/admin/login` (or your frontend admin URL)
2. Enter username or email: `admin`
3. Enter password: `admin@123`
4. Click Login

## Database Details

- **Cluster:** New MongoDB cluster (cluster0.rtyuckp.mongodb.net)
- **Database:** travel
- **Collection:** admins
- **User Status:** ✓ Active and ready to use

## Seeding Script Used

Location: `scripts/seed-admin.ts`

Features:
- ✓ Hashes password with bcrypt (salt rounds: 12)
- ✓ Checks for existing admin before creating
- ✓ Connects to database using MONGODB_URI from .env
- ✓ Displays confirmation with admin credentials

## Running the Script Again

If you need to reseed (WARNING: Will create duplicate if admin already exists):

```bash
npx ts-node scripts/seed-admin.ts
```

The script will detect existing admin and skip creation.

## Reset/Change Admin Password

To change the admin password manually:

1. Connect to MongoDB cluster
2. Update the admins collection:
   ```javascript
   // In mongosh or MongoDB Compass
   db.admins.updateOne(
     { username: "admin" },
     { $set: { password: "<new_hashed_password>" } }
   )
   ```

To hash a new password using bcrypt:
```bash
node -e "require('bcrypt').hash('new_password', 12).then(h => console.log(h))"
```

## Next Steps

1. **Test admin login:**
   - Verify you can login with admin/admin@123
   - Check admin dashboard functionality

2. **Secure the credentials:**
   - Consider changing the default password after first login
   - Store credentials securely in your password manager

3. **Deploy to production:**
   - Ensure `.env` is deployed with new MONGODB_URI
   - Restart the server/redeploy application
   - Test admin login on production

## Troubleshooting

### Admin login not working
- Verify server is connected to new cluster (check `/info` endpoint)
- Ensure `.env` has correct MONGODB_URI
- Check that admin document exists in database

### Password not accepted
- Verify password is exactly `admin@123`
- Check for extra spaces or typos
- If password was changed, use the new password

### Need to create another admin
- Modify `scripts/seed-admin.ts` with different username/email
- Run: `npx ts-node scripts/seed-admin.ts`

## Security Notes

⚠️ **Important:**
- This is a development/initial setup password
- Change the password after first login in production
- Don't share these credentials
- Use environment variables for sensitive data

## Support

For issues with admin seeding:
1. Check MongoDB connectivity: `npm run dev` and test `/info` endpoint
2. Review seeding script output for errors
3. Verify admin document in database using MongoDB Compass or mongosh

---

**Seeding Status:** ✅ COMPLETE
**Admin User:** Ready to use
**Next Action:** Deploy updated `.env` to production and restart server
