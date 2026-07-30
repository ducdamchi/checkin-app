# HTFL Makerspace Check-In App — User Guide

Welcome! This guide will walk you through everything you need to know about using the HTFL Makerspace Check-In App. No technical knowledge required.

---

## Part 1: How to Use the App

### Getting to the App

Open any web browser (Chrome, Safari, Firefox, etc.) and go to:

**https://htfl-makerspace.github.io/checkin-app**

The app works on computers, tablets (like iPads), and phones. For the best check-in experience, we recommend using a tablet placed at the entrance of your space.

### Signing In

When you first open the app, you'll see a sign-in screen. Enter the email address and password that were set up for your makerspace location. Once signed in, the app will remember you — you won't need to sign in again unless you sign out.

To sign out, click the **Sign out** button in the top-right corner of the screen.

### The Check-In Page

This is the main screen you'll see after signing in. It's designed to be simple enough that visitors can use it on their own.

#### How it works

The screen shows three large buttons:

- **Adult +1** — for visitors aged 18 or above
- **Teen +1** — for visitors aged 12 to 17
- **Child +1** — for visitors aged 11 or below

When a visitor arrives, they (or a staff member) simply tap the button that matches their age group. That's it — the check-in is recorded instantly.

#### The Undo feature

Mistakes happen! When someone taps a button, a small notification appears at the bottom of the screen with an **Undo** button. You have **10 seconds** to press Undo if the wrong button was tapped or if the tap was accidental. A small countdown bar shows how much time is left. After 10 seconds, the notification disappears and the check-in is final.

This design was intentional — we wanted the check-in process to be as fast as possible (just one tap), while still giving a safety net for mistakes. There's no confirmation dialog that slows people down.

#### Clock and weather widget

In the top-right corner of the check-in screen, you'll see a small widget showing the current time, date, and temperature. It also has a nice animated background that changes based on the actual weather outside (sunny, cloudy, rainy, snowy, etc.) and whether it's daytime or nighttime.

### The Dashboard Page

To switch to the dashboard, use the toggle at the top of the screen that says **Check In** / **Dashboard**. The dashboard shows you a summary of all check-ins over time, displayed as a bar chart and a data table.

#### Filters

At the top of the dashboard, you have four dropdown menus to customize your view:

- **Granularity** — Choose how to group the data: by hour, day, week, month, or year. For example, "Day" will show you one bar per day, while "Hour" will show one bar per hour.

- **Age Group** — Filter to see only a specific age group (Adult, Teen, or Child), or choose "All" to see everyone.

- **Time Range** — Choose the time window you want to look at:
  - *Today* — just today's check-ins
  - *Last 7 days* — the past week
  - *Last 30 days* — the past month
  - *This year* — from January 1st of the current year
  - *All time* — every check-in ever recorded

- **Data Source** — Normally set to "Live Data" to see your real check-ins. The "Demo" options (Quiet, Medium, Busy) show sample data so you can explore what the dashboard looks like with different volumes of visitors, without affecting your real data.

#### Color by age group

There's a checkbox labeled **Color by age group**. When turned on, each bar in the chart is split into three colors — one for adults, one for teens, and one for children — so you can see the breakdown at a glance. The data table below the chart will also show separate columns for each age group. When turned off, everything is shown as a single combined count.

#### Your preferences are saved

All of your filter choices (granularity, age group, time range, data source, and the color-by-age setting) are automatically saved in your browser. If you close the app and come back later, your dashboard will look exactly the way you left it.

### Dark Mode

Click the moon/sun icon in the top-right corner of the header to switch between light mode and dark mode. This preference is also saved in your browser.

---

## Part 2: How This App Was Made (Behind the Scenes)

This section is for anyone curious about the technology behind the app. We'll keep it simple — no coding knowledge needed!

### The basics

The Check-In App is a **web application**, meaning it runs entirely in your web browser. There's nothing to download or install. It's essentially a website that behaves like an app.

### The building blocks

The app is built with a few key technologies:

- **React** — This is a popular tool (created by Facebook) for building interactive websites. It's what makes the buttons, charts, dropdowns, and everything you see on screen work smoothly. When you tap a check-in button, React instantly updates what you see without needing to reload the whole page.

- **shadcn/ui** — This is a collection of pre-designed visual components (buttons, tables, dropdown menus, cards, etc.) that gives the app a clean, modern, and consistent look. Think of it like a set of building blocks for the visual design.

- **Recharts** — This is the tool that draws the bar charts on the dashboard. It takes the check-in numbers and turns them into the visual graphs you see.

- **Supabase** — This is the app's "backend" — the place where all the data lives. When someone taps a check-in button, that record gets sent to Supabase's database and stored securely in the cloud. Supabase also handles the sign-in system, making sure only authorized users can access the app. Think of Supabase as the app's brain and memory, running on servers somewhere in the cloud so your data is safe even if your tablet breaks.

### Where does the app live?

The app is hosted for free on **GitHub Pages**, a service provided by GitHub (a widely-used platform where developers store and share code). The app's code is stored in a GitHub repository (like a folder in the cloud), and GitHub Pages automatically turns that code into the website you visit. This means:

- The app is always available online at its web address
- It costs nothing to host
- Updates can be published quickly

### How data flows

Here's the simple version of what happens when someone checks in:

1. A visitor taps "Adult +1" on the tablet
2. The app (running in the browser) sends that record to Supabase's cloud database
3. Supabase saves it with a timestamp and the age group
4. Later, when you open the dashboard, the app asks Supabase to add up all the check-ins and group them by time period
5. The results come back and get displayed as the chart and table you see

All of this happens in a fraction of a second.

### Privacy and security

- The app requires a sign-in, so only authorized makerspace staff can access the check-in screen and dashboard
- No personal information about visitors is collected — just an anonymous count by age group
- All data is transmitted securely over HTTPS (the same encryption used by banks and online stores)
- The database is hosted by Supabase, which runs on Amazon Web Services (AWS) infrastructure

---

*If you have questions or run into any issues with the app, reach out to your makerspace's tech team.*
