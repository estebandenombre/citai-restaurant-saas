# Payment Keys Deletion System

## 📋 Overview

This system provides secure functionality to delete payment gateway keys from the database for security purposes. Users can delete keys for individual gateways or clear all payment keys at once.

## 🔧 Features

### Individual Gateway Key Deletion
- Delete keys for specific payment gateways (Stripe, PayPal, Apple Pay)
- Automatically disables the gateway after key deletion
- Confirmation dialog to prevent accidental deletion
- Visual feedback with loading states

### Bulk Key Deletion
- Clear all payment keys for a restaurant at once
- Disables all payment gateways
- Disables payments globally for the restaurant
- Comprehensive confirmation dialog

### Security Features
- Row Level Security (RLS) protection
- User authentication required
- Restaurant-specific access control
- Database-level validation

## 🗄️ Database Functions

### `delete_payment_gateway_keys(restaurant_uuid, gateway_id)`
Deletes payment keys for a specific gateway.

**Parameters:**
- `restaurant_uuid`: UUID of the restaurant
- `gateway_id`: String identifier of the gateway (stripe, paypal, apple_pay)

**Returns:** Boolean indicating success

### `clear_all_payment_keys(restaurant_uuid)`
Clears all payment keys for a restaurant.

**Parameters:**
- `restaurant_uuid`: UUID of the restaurant

**Returns:** Boolean indicating success

### `has_payment_keys_configured(restaurant_uuid)`
Checks if a restaurant has any payment keys configured.

**Parameters:**
- `restaurant_uuid`: UUID of the restaurant

**Returns:** Boolean indicating if keys exist

### `get_gateways_with_keys(restaurant_uuid)`
Returns a list of gateway names that have keys configured.

**Parameters:**
- `restaurant_uuid`: UUID of the restaurant

**Returns:** Array of gateway names

## 🚀 API Endpoints

### DELETE `/api/payments/delete-keys`
Delete keys for a specific gateway.

**Request Body:**
```json
{
  "gatewayId": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment keys for stripe have been deleted successfully",
  "gatewayId": "stripe"
}
```

### DELETE `/api/payments/clear-all-keys`
Clear all payment keys for a restaurant.

**Request Body:** None required

**Response:**
```json
{
  "success": true,
  "message": "All payment keys have been cleared successfully",
  "restaurantId": "uuid"
}
```

## 🎨 UI Components

### Delete Keys Button
- Red destructive button with trash icon
- Only appears when gateway has keys configured
- Loading state during deletion process
- Confirmation dialog before deletion

### Clear All Keys Button
- Located in page header for easy access
- Destructive styling to indicate critical action
- Comprehensive confirmation dialog
- Disables all payment functionality

## 📱 User Interface

### Payment Settings Page
The delete functionality is integrated into the payment settings page:

1. **Individual Gateway Deletion:**
   - Delete button appears next to "Test Connection" for each gateway
   - Only visible when gateway has keys configured
   - Confirmation dialog specific to the gateway

2. **Bulk Deletion:**
   - "Clear All Keys" button in page header
   - Always visible for easy access
   - Comprehensive warning about disabling all payments

### Confirmation Dialogs
- **Individual Gateway:** "Are you sure you want to delete the payment keys for [Gateway Name]? This action cannot be undone and will disable the gateway."
- **All Keys:** "Are you sure you want to clear ALL payment keys? This action cannot be undone and will disable all payment gateways."

## 🔒 Security Considerations

### Authentication & Authorization
- All endpoints require user authentication
- Users can only delete keys for their own restaurant
- Row Level Security (RLS) policies enforce access control

### Data Protection
- Keys are completely removed from database
- No backup or recovery of deleted keys
- Gateway is automatically disabled after key deletion

### Audit Trail
- Database functions log operations with RAISE NOTICE
- API endpoints log errors and operations
- User actions are tracked through authentication

## 🛠️ Installation

### 1. Database Setup
Execute the SQL script to create the required functions:

```sql
-- Run in Supabase SQL Editor
\i scripts/230-add-payment-keys-delete-function.sql
```

### 2. Verification
Run the verification script to ensure everything is working:

```sql
-- Run in Supabase SQL Editor
\i scripts/231-verify-payment-keys-deletion.sql
```

### 3. Force Clear (if needed)
If the regular functions don't work, use the force clear script:

```sql
-- Run in Supabase SQL Editor
\i scripts/232-force-clear-payment-keys.sql
```

### 4. API Endpoints
The API endpoints are automatically available:
- `/api/payments/delete-keys`
- `/api/payments/clear-all-keys`

### 5. Frontend Integration
The delete functionality is already integrated into the payment settings page.

## 📊 Usage Examples

### Delete Stripe Keys
```typescript
// Using PaymentService
const result = await PaymentService.deletePaymentKeys(restaurantId, 'stripe')
if (result.success) {
  console.log('Stripe keys deleted successfully')
}
```

### Clear All Keys
```typescript
// Using PaymentService
const result = await PaymentService.clearAllPaymentKeys(restaurantId)
if (result.success) {
  console.log('All payment keys cleared')
}
```

### Check if Keys Exist
```sql
-- Using database function
SELECT has_payment_keys_configured('restaurant-uuid-here');
```

## ⚠️ Important Notes

1. **Irreversible Action:** Key deletion cannot be undone
2. **Payment Disruption:** Deleting keys will disable payment processing
3. **Gateway Disable:** Gateways are automatically disabled after key deletion
4. **No Recovery:** Deleted keys cannot be recovered from the system

## 🔍 Troubleshooting

### Common Issues

1. **"No Keys to Delete" Error**
   - Gateway doesn't have any keys configured
   - Check if keys were already deleted

2. **"Restaurant not found" Error**
   - User authentication issue
   - Restaurant ID not found in database

3. **"Failed to delete payment keys" Error**
   - Database connection issue
   - Check Supabase logs for details
   - API endpoints now use direct database operations instead of RPC functions

4. **"Internal server error" Error**
   - Check browser console for detailed error logs
   - API endpoints include comprehensive logging
   - Verify database table structure

5. **Keys still appear in inputs after deletion**
   - Frontend now reloads data from database after deletion
   - Check if refresh is working properly
   - Verify API response is successful

### Debug Steps

1. **Check Database Functions**
   ```sql
   -- Verify functions exist
   SELECT proname FROM pg_proc WHERE proname LIKE '%payment%keys%';
   ```

2. **Check Current Payment Settings**
   ```sql
   -- View current settings for a restaurant
   SELECT settings FROM restaurant_payment_settings WHERE restaurant_id = 'your-restaurant-id';
   ```

3. **Test Function Manually**
   ```sql
   -- Test delete function
   SELECT delete_payment_gateway_keys('your-restaurant-id', 'stripe');
   
   -- Test clear all function
   SELECT clear_all_payment_keys('your-restaurant-id');
   ```

4. **Force Clear if Needed**
   ```sql
   -- Use force clear function
   SELECT force_clear_payment_keys('your-restaurant-id');
   
   -- Verify keys are cleared
   SELECT verify_payment_keys_cleared('your-restaurant-id');
   ```

5. **Check User Authentication**
   - Verify user is logged in
   - Check restaurant ownership
   - Review RLS policies

6. **Review API Logs**
   - Check browser network tab
   - Review server logs
   - Verify API endpoint responses

## 📈 Future Enhancements

1. **Audit Logging:** Track all key deletion operations
2. **Backup System:** Optional key backup before deletion
3. **Scheduled Deletion:** Automatic key rotation
4. **Key Recovery:** Secure key recovery mechanism
5. **Bulk Operations:** Delete keys for multiple restaurants
