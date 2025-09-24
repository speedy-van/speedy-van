# Render Deployment Guide - Speedy Van

## Quick Setup for Render

### 1. Environment Variables
Copy all variables from `RENDER_ENV_VARIABLES.md` to your Render service:

1. Go to Render Dashboard → Your Service → Environment
2. Add each variable from the list
3. Save configuration

### 2. Build Configuration
Your `render.yaml` is already configured with:
- ✅ pnpm 10.17.0
- ✅ Shared packages build first
- ✅ Correct build order
- ✅ PORT configuration

### 3. Database
- ✅ Neon Postgres configured
- ✅ Connection string ready
- ✅ SSL enabled

### 4. Services Configured
- ✅ Stripe (Live)
- ✅ Mapbox
- ✅ SMS (The SMS Works)
- ✅ Email (ZeptoMail + SendGrid)
- ✅ Pusher (Real-time)
- ✅ OpenAI

### 5. Deployment Steps

1. **Push to GitHub** (already done)
2. **Connect to Render**:
   - Import from GitHub
   - Select this repository
   - Use `render.yaml` configuration

3. **Add Environment Variables**:
   - Copy from `RENDER_ENV_VARIABLES.md`
   - Add each variable to Render dashboard

4. **Deploy**:
   - Render will automatically build and deploy
   - Build should complete successfully
   - Service will be available at your Render URL

### 6. Post-Deployment

1. **Test the application**:
   - Visit your Render URL
   - Test booking flow
   - Verify all features work

2. **Monitor logs**:
   - Check Render logs for any issues
   - Verify database connections
   - Test API endpoints

### 7. Custom Domain (Optional)

1. Add custom domain in Render dashboard
2. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL`
3. Redeploy service

## Troubleshooting

### Build Issues
- Check that all environment variables are set
- Verify pnpm version (10.17.0)
- Check build logs for specific errors

### Runtime Issues
- Verify database connection
- Check API keys are correct
- Monitor application logs

### Performance
- Monitor resource usage
- Check for memory leaks
- Optimize if needed

## Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test locally first
4. Contact support if needed

---

**Ready to deploy!** 🚀
