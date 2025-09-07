This is how to setup facebook login with supabase as "callback/backend" 


- Create a supabase project
- 

- Create a facebook app

0) 
Do not fill in Redirect URI Validator -> "Redirect URI to Check" (the top one) at all until everything is setup
https://akkqamshdlvjftnjfrvr.supabase.co/auth/v1/callback


1) 
In  facebook app
In Your app > ⚙️ App Settings  > Basic
Note facebook App
* ClientID and 
* Client Secret

2) 
In supabase project.
a)
Go to Authentication > SignIn/Providers > Facebook

Toggle to "Enabled"
Insert ClientID and Client Secret from step 1

b)
Go to Authentication > URL Configuration 
(if you dont use https locally, just use http)

 Add 
 Site URL:  https://localhost:3001

Redirect URLs:
 https://localhost:3001
 https://localhost:3001

c)
Note your Supabase Project URL
Project overview > scroll down, look for "Project URL"






3)
In Your app > ⚙️ App Settings  > Basic
Add app domains: 
akkqamshdlvjftnjfrvr.supabase.co


4)
In 
your app > Use Cases > Customize
https://developers.facebook.com/apps/1325516875828926/use_cases/customize/?use_case_enum=FB_LOGIN&selected_tab=settings&product_route=fb-login



