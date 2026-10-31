# Accounts, Sync & Friends — Plan

## What we're building

- **Accounts.** Sign up with your email. To sign in, you type a 6-digit code that gets emailed to you (no password to remember). Email *links* are avoided on purpose: on iPhone, a home-screen app can't receive them, so the code is typed into the app instead.
- **Sync.** Your journal, humidor, profile, badges and vault reviews are saved to your account. The app keeps working offline and catches up when you're back online. A new phone just needs you to sign in.
- **Friend codes.** Every account gets a short code like `MW-7K3Q9`, shown on your Profile with a **Share** button (opens the iPhone share sheet) and a **Copy** button.
- **Follow by code.** Enter someone's code to follow them. It's one-way, like Instagram: you see their stuff, and they don't see yours unless they also enter your code. No approval step.
- **What followers can see:**
  - Your smoking logs (cigar, rating, flavors, smoke notes, pairing, what you enjoyed). Any log can be marked **Keep private**.
  - Your profile: name, location, bio, favorites, stats and featured badges.
  - Your humidor.
- **What stays private, always:** your vault reviews, your email, and anything marked Keep private.

## How it will look in the app

- **New Friends tab** in the bottom bar.
  - **Feed:** your friends' latest smokes, newest first. Each card shows who, the cigar, stars, flavors and a line of their notes. Tap it for the full log, or tap their name for their profile.
  - **Following / Followers lists**, with **Unfollow** and **Remove follower**.
  - **+ Add a friend:** type or paste a code.
- **Friend profile page.** Their header, featured badges, stats and badge tiers (worked out from the logs they share), recent smokes and humidor. Includes a "Log this cigar" button on any of their logs, so you can try what they're smoking.
- **Log form.** Gets a **Keep private** switch.
- **Profile tab.** Shows your friend code, a sign-in or sign-out button, and **Delete my account**.

## What you need to do first (about 5 minutes, when ready)

1. Go to **supabase.com** and sign up (signing in with GitHub is easiest).
2. Click **New project**. Name it `humidor-journal`, pick the region closest to you, and let it generate a database password. You won't need that password for the app, but keep it somewhere safe.
3. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and click **Run**.
4. Go to **Authentication → Sign In / Providers → Email**:
   - Make sure Email is **enabled**.
   - Set the email OTP length to **6**.
5. Go to **Authentication → Emails → Magic Link** template, and change the message so it shows the code:
   `Your MyWrap code is {{ .Token }}`
6. Go to **Project Settings → API**. Send Claude the **Project URL** and the **anon / publishable key**.
   - These two are *meant* to be inside the app. The database rules in `schema.sql` are what keep data safe.
   - **Never** share the `service_role` / secret key.

## Build order

| Phase | What | Sessions |
|---|---|---|
| 1 | Sign in with email code. 21+ confirmation. Upload your existing phone data on first sign-in. Automatic sync. Sign out. Privacy policy page. | 1 |
| 2 | Friend code on Profile (Share and Copy). Add a friend by code. Following / Followers lists. | 1 |
| 3 | Friends feed. Friend profile pages. Keep private switch on logs. | 1 |
| 4 | Before inviting people: Delete my account, Block a user, and a final privacy review. | small |

## Things to know

- **Cost:** free. Supabase's free plan covers far more users and data than we'll need for a long time.
- **Free projects pause** after about a week with no activity. Opening the Supabase dashboard wakes it back up. Once people use the app regularly, this won't happen.
- **Your current data is safe.** It stays on your phone, and the first sign-in uploads it to your account.
- **Age:** sign-up asks people to confirm they're 21 or older. The privacy policy will say what's stored and who can see it.
