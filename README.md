# Careline patient portal

## Supabase setup

1. In Supabase, open **SQL Editor**, paste in `supabase-schema.sql`, and run it. This creates patient profiles, appointment records, row-level security, signup profile creation, and the server-side loyalty calculation.
2. In **Project Settings → API Keys**, copy the project URL and the **publishable** key (or legacy `anon` key). Put them in `supabase-config.js`. Never put a `service_role` or secret key in this browser app.
3. In **Authentication → URL Configuration**, set the Site URL to `https://clinichospital.gt.tc/` (or your deployed URL) and add `https://clinichospital.gt.tc/**` to the redirect allow list. Enable Email under **Authentication → Providers**. Supabase may require users to confirm their email before their first sign-in.
4. Open `login.html` to create a patient account. Authenticated bookings are saved in Supabase. After a visit, staff must mark that appointment `completed` in Supabase; only completed appointments count toward loyalty.

The configured rewards are 10% after both 6 months of membership and 5 completed appointments, and 15% after both 12 months and 10 completed appointments. The appointment discount is recalculated by the database when a booking is created.

The current booking screen uses a $60 consultation fee for Dr. Sofia Reyes. The database trigger owns this fee and discount calculation; do not grant browser users permission to update appointment statuses. The SQL setup gives patient accounts access only to their own profile and appointments.
