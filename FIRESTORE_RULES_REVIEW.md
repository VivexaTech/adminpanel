# Firestore Security Rules Review

## Current Rules Status ✅

The rules have been updated to allow:
- **Super Admin** (`vivexatech@gmail.com`): Full access to all collections
- **Staff Members**: Can query and read their own staff document by email
- **Staff Members**: Can read/update their own tasks and attendance

## Key Rules Breakdown

### 1. Staff Collection (`/staff/{docId}`)
```javascript
allow read: if isSuperAdmin() || 
  isAdminUser() || 
  (request.auth != null && resource.data.email == request.auth.token.email);
```
✅ **This allows staff members to query their own document by email**

### 2. Tasks Collection (`/tasks/{docId}`)
- Staff can read tasks where `assigneeId` matches their staff ID
- Staff can only update `status`, `progress`, and `updatedAt` fields
- Only admins can create/delete tasks

### 3. Attendance Collection (`/attendance/{docId}`)
- Staff can read/create/update their own attendance records
- Only admins can delete attendance records

## Potential Issues & Solutions

### Issue 1: Email Case Sensitivity
**Problem**: If the email in the staff document doesn't exactly match the auth token email (case-sensitive), the query will fail.

**Solution**: Ensure emails are stored in lowercase in the staff collection, or use case-insensitive comparison (not directly supported in Firestore rules).

**Action**: When creating staff records, normalize emails to lowercase:
```javascript
email: formData.email.toLowerCase().trim()
```

### Issue 2: isStaffMember() Circular Dependency
**Problem**: The `isStaffMember()` function uses `get()` which requires read permission, potentially causing evaluation issues.

**Current Implementation**: The function checks if super admin or admin user first, then checks email match. This should work, but if there are issues, we can simplify.

### Issue 3: Query Evaluation
**Problem**: When querying `where('email', '==', user.email)`, Firestore evaluates rules for each potential document.

**Solution**: The current rule should work because it allows reading when `resource.data.email == request.auth.token.email`, which matches the query condition.

## Testing Checklist

Before deploying, verify:

1. ✅ Super admin can access all collections
2. ✅ Staff member can query their own staff document by email
3. ✅ Staff member can read their own tasks
4. ✅ Staff member can update their own task status/progress
5. ✅ Staff member can read their own attendance
6. ✅ Staff member can create/update their own attendance
7. ✅ Staff member CANNOT access other staff's data
8. ✅ Staff member CANNOT access admin routes

## Deployment Steps

1. Copy the complete rules from `FIRESTORE_RULES.txt`
2. Go to Firebase Console → Firestore Database → Rules
3. Paste the rules
4. Click **Publish**
5. Wait for rules to deploy (usually instant)
6. Test with a staff member account

## Troubleshooting

If you still get "Missing or insufficient permissions":

1. **Check email match**: Ensure the email in the staff document exactly matches the Google Sign-In email (case-sensitive)
2. **Check staff status**: Ensure `status === 'active'` in the staff document
3. **Check Firestore indexes**: Some queries may require composite indexes (check Firebase Console for prompts)
4. **Verify rules deployed**: Check the Rules tab to ensure your rules are published
5. **Check browser console**: Look for specific error messages that might indicate which rule is failing

## Email Normalization Recommendation

To avoid case-sensitivity issues, update `StaffModal.js` to normalize emails:

```javascript
const dataToSave = {
  ...formData,
  email: formData.email.toLowerCase().trim(), // Normalize email
  type: type === 'employees' ? 'employee' : 'intern',
  // ... rest of fields
};
```
