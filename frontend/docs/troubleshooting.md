# Troubleshooting Guide

## ✅ Issues Fixed

### 1. "Please call createAppKit before using useAppKit hook"
**Status**: ✅ RESOLVED

**Solution Applied**:
- Moved `createAppKit` initialization to `useEffect` in providers
- Added client-side mounting checks to all Reown components
- Added loading states while AppKit initializes

### 2. SSR/Hydration Issues
**Status**: ✅ RESOLVED

**Solution Applied**:
- Added `mounted` state checks in all Reown components
- Proper client-side rendering guards
- Loading states during hydration

## 🔧 Common Issues & Solutions

### Environment Variables Not Set
**Symptoms**:
- AppKit not connecting
- "Project ID not defined" errors

**Solution**:
```bash
# Copy the example file
cp .env.example .env.local

# Update with your actual values:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_actual_alchemy_key
```

Get your project ID from: https://dashboard.reown.com

### MetaMask SDK Warnings
**Symptoms**:
```
Module not found: Can't resolve '@react-native-async-storage/async-storage'
```

**Status**: ⚠️ HARMLESS WARNING
- This is a known MetaMask SDK warning
- Does not affect functionality
- Safe to ignore

### Network Switch Failures
**Symptoms**:
- Network switch doesn't work
- Wrong network displayed

**Solution**:
1. Check if wallet supports the target network
2. Ensure network is properly configured in `wagmi-config.ts`
3. Try manual network switch in wallet first

### Social Login Not Working
**Symptoms**:
- Social login buttons don't respond
- Authentication fails

**Solution**:
1. Verify project ID is correct
2. Check domain is configured in Reown dashboard
3. Ensure browser allows popups for the domain
4. Try in incognito mode to rule out extensions

### Modal Not Opening
**Symptoms**:
- Connect button clicks but nothing happens
- Console shows hook errors

**Solution**:
1. Check if `createAppKit` was called successfully
2. Verify all environment variables are set
3. Check browser console for initialization errors
4. Refresh page to restart AppKit initialization

## 🏥 Health Checks

### 1. Verify AppKit Initialization
Check browser console for:
```
✅ AppKit initialized successfully
❌ AppKit initialization failed
```

### 2. Test Basic Connection
1. Visit `/reown-features`
2. Check if status shows "Ready" and "Disconnected"
3. Try connecting with any method

### 3. Verify Environment
```bash
# Check if env vars are loaded
echo $NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
echo $NEXT_PUBLIC_ALCHEMY_API_KEY
```

## 🐛 Debug Mode

### Enable Detailed Logging
Add to your `.env.local`:
```
NEXT_PUBLIC_DEBUG=true
```

### Check Network Requests
1. Open browser DevTools → Network tab
2. Filter by "reown" or "walletconnect"
3. Look for failed requests

### AppKit State Inspection
Use the `/reown-features` page to inspect:
- Connection status
- Network information
- Theme settings
- Account details

## 📞 Getting Help

### Before Reporting Issues:
1. ✅ Check this troubleshooting guide
2. ✅ Verify environment variables are set
3. ✅ Test in different browser/incognito mode
4. ✅ Check browser console for errors

### Useful Information to Include:
- Browser and version
- Error messages from console
- Steps to reproduce
- Environment variable status (without revealing actual values)

### Resources:
- [Reown Documentation](https://docs.reown.com)
- [Reown Dashboard](https://dashboard.reown.com)
- [GitHub Issues](https://github.com/reown-com/appkit/issues)