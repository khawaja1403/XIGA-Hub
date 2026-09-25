# XIGA Hub

Final frontend for the XIGA Hub private task/work platform.

## Included
- Supabase email/password authentication
- Optional referral code at signup and ?ref= auto-fill
- Live wallet, subscription, task levels and open tasks
- Task claiming with server-side deposit reservation and 24h lock rules
- Server-side deadlines
- 3 Canva-link submission workflow
- Submission approval / revision / rejection
- Recharge requests (minimum Rs.400)
- Withdrawal requests for Easypaisa/JazzCash
- Referral tracking and Rs.200 bonus after referred subscription approval
- Notifications and transaction history
- User profile
- Admin dashboard, users (with full detail view + manual notify), subscriptions, tasks, submissions, recharges, withdrawals, referrals, transactions and task-level management

## Vercel environment variables
VITE_SUPABASE_URL=https://edldbyxwcffqussrouzm.supabase.co
VITE_SUPABASE_ANON_KEY=<your Supabase publishable key>

Never put a Supabase secret/service-role key in VITE_ variables or browser code.

## Database
The Supabase database for the current XIGA Hub project has already been updated with the core RPCs and security protections used by this frontend. If moving to another Supabase project, recreate the existing schema plus the XIGA Hub database functions before deploying this frontend.

**New requirement for this version:** the admin "Notify" feature inserts directly into `notifications` for an arbitrary user_id. Your `notifications` table RLS needs an INSERT policy that allows rows where `auth.uid()`'s profile has `role = 'admin'`, targeting any `user_id`. If that policy doesn't exist yet, add it before using the Notify button — otherwise it will fail with a permission error (which the UI will now show as a toast, not fail silently).

## Admin
An account is treated as an admin only when public.profiles.role = 'admin' and is_blocked = false. There is no email-based admin bypass anywhere in this codebase. Do not expose Supabase secret keys in the frontend.

## Important business rules
- Approval: returns the reserved task deposit + configured payout.
- Rejection: reserved task deposit is forfeited, as requested for the XIGA Hub workflow.
- Revision: deposit remains reserved until a later submission is approved or rejected/expired.
- Withdrawal requests reserve balance until paid or rejected.
- Referral bonus is awarded only after the referred user's subscription is approved.

## Known limitation: user deletion
True deletion of a Supabase Auth user requires the service-role key, which must never run in frontend/browser code. This version intentionally does NOT implement a "delete user" button for that reason — doing so client-side would either be fake (only deleting the profiles row, leaving an orphaned auth account) or would require exposing a secret key, both of which were explicitly ruled out. Block/unblock remains the safe way to disable an account from the frontend. If you need real deletion, add a Supabase Edge Function (running server-side with the service-role key) and call that function from the admin panel instead.
