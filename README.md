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
- Admin dashboard, users, subscriptions, tasks, submissions, recharges, withdrawals, referrals, transactions and task-level management

## Vercel environment variables
VITE_SUPABASE_URL=https://edldbyxwcffqussrouzm.supabase.co
VITE_SUPABASE_ANON_KEY=<your Supabase publishable key>

Never put a Supabase secret/service-role key in VITE_ variables or browser code.

## Database
The Supabase database for the current XIGA Hub project has already been updated with the core RPCs and security protections used by this frontend. If moving to another Supabase project, recreate the existing schema plus the XIGA Hub database functions before deploying this frontend.

## Admin
An account is treated as an admin only when public.profiles.role = 'admin' and is_blocked = false. Do not expose Supabase secret keys in the frontend.

## Important business rules
- Approval: returns the reserved task deposit + configured payout.
- Rejection: reserved task deposit is forfeited, as requested for the XIGA Hub workflow.
- Revision: deposit remains reserved until a later submission is approved or rejected/expired.
- Withdrawal requests reserve balance until paid or rejected.
- Referral bonus is awarded only after the referred user's subscription is approved.
