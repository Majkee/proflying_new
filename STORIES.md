# ProFlying Academy — User Stories

## Roles

| Role | Scope | Description |
|------|-------|-------------|
| **super_admin** | Global | Full access to all studios, all settings, all data |
| **manager** | Per-studio | Manages students, groups, passes, payments, holidays within assigned studio(s) |
| **instructor** | Per-studio | Marks attendance, views students/groups/schedule for assigned groups |

---

## 1. Authentication

| # | Story | Role |
|---|-------|------|
| 1.1 | As a user, I can sign in with my email and password so that I can access the system. | All |
| 1.2 | As a user, I see a Polish-language error message when my credentials are wrong. | All |
| 1.3 | As a user, I am automatically redirected to the dashboard after signing in. | All |
| 1.4 | As a user, I am redirected to the login page if I try to access a protected route while unauthenticated. | All |
| 1.5 | As a user, I can sign out via the avatar menu in the top-right corner. | All |
| 1.6 | As a user, my session is refreshed automatically on every page load so I stay logged in. | All |

---

## 2. Studio Selection

| # | Story | Role |
|---|-------|------|
| 2.1 | As a user with multiple studios, I can switch between them via the studio dropdown in the topbar. | All |
| 2.2 | As a user with a single studio, I see my studio name displayed statically (no dropdown). | manager, instructor |
| 2.3 | As a super_admin, I can select "Wszystkie studia" to enter all-studios mode. | super_admin |
| 2.4 | As a user, my selected studio is remembered across sessions via local storage. | All |
| 2.5 | As a user, I can pick a studio from the dedicated studio selection page (`/studios`). | All |
| 2.6 | As a user, if no studio was previously selected, the system defaults to my profile's default studio, then "Srem", then the first available studio. | All |

---

## 3. Navigation & Layout

| # | Story | Role |
|---|-------|------|
| 3.1 | As a user, I see a sidebar on desktop with links to: Pulpit, Obecnosc, Grafik, Kursantki, Grupy, and (role-dependent) Platnosci and Ustawienia. | All |
| 3.2 | As a user on mobile, I see a fixed bottom navigation bar with primary links and a "Wiecej" overflow menu. | All |
| 3.3 | As a manager or super_admin, I see the "Platnosci" link in the navigation. | manager, super_admin |
| 3.4 | As a super_admin, I see the "Ustawienia" link in the navigation. | super_admin |
| 3.5 | As a user, I see a notification bell icon in the topbar that shows upcoming student birthdays. | All |
| 3.6 | As a user, I can click the notification bell to see birthday notifications split into "Dzisiaj" and "Nadchodzace" (next 7 days). | All |
| 3.7 | As a user, I can click a birthday notification to navigate to that student's detail page. | All |
| 3.8 | As a user, I see my name and role in the avatar dropdown menu. | All |

---

## 4. Dashboard

| # | Story | Role |
|---|-------|------|
| 4.1 | As a user, I see a stat card showing the count of active students in my studio. | All |
| 4.2 | As a user, I see a stat card showing the count of active groups in my studio. | All |
| 4.3 | As a manager/super_admin, I see a stat card showing this month's total revenue in PLN. | manager, super_admin |
| 4.4 | As a manager/super_admin, I see a stat card showing the count of students with overdue payments. | manager, super_admin |
| 4.5 | As a manager/super_admin, I see an alert banner showing how many students lack an active pass, with a link to the payments page. | manager, super_admin |
| 4.6 | As a user, I see a birthday banner listing students whose birthday is today, with links to their profiles. | All |
| 4.7 | As a manager/super_admin, I see a "Do oplaty dzisiaj" section listing students in today's classes who have no pass, an expired pass, or an unpaid pass. | manager, super_admin |
| 4.8 | As a manager/super_admin, I can click "Oplac" next to an unpaid student to navigate to their payment/pass page. | manager, super_admin |
| 4.9 | As a user, I see a calendar widget that I can toggle between month and week views. | All |
| 4.10 | As a user, I can navigate the calendar forward/backward and jump to today. | All |
| 4.11 | As a user, I see group classes as blue chips on the calendar (month view) or time blocks (week view), and I can click them to open the group detail. | All |
| 4.12 | As a user, I see public holidays marked in red on the calendar. | All |
| 4.13 | As a user, I see student birthdays marked with pink chips (month view) or cake icons (week view) on the calendar. | All |
| 4.14 | As a user, in week view I see a red line indicating the current time that updates every minute. | All |
| 4.15 | As a user, in month view I can click "+N wiecej" to expand and see all events for a day with many entries. | All |

---

## 5. Students

### 5.1 Student List

| # | Story | Role |
|---|-------|------|
| 5.1.1 | As a user, I can view a list of all active students in my studio. | All |
| 5.1.2 | As a user, I can search students by name using a live search bar. | All |
| 5.1.3 | As a user, I see the total count of matching students displayed. | All |
| 5.1.4 | As a user, I see each student's name, contact info (phone/email), pass type, date range, and payment status badge (Oplacony / Nieoplacony / Wygasl). | All |
| 5.1.5 | As a user, I can see the auto-renewal indicator on students with auto-renewing passes. | All |
| 5.1.6 | As a user, I can click a student row to navigate to their detail page. | All |
| 5.1.7 | As a manager/super_admin, I can click "Dodaj" to navigate to the new student form. | manager, super_admin |

### 5.2 Student Creation

| # | Story | Role |
|---|-------|------|
| 5.2.1 | As a manager/super_admin, I can create a new student by filling in their full name (required), phone, email, date of birth, and notes. | manager, super_admin |
| 5.2.2 | As a manager/super_admin, I see a validation error if the name is shorter than 2 characters. | manager, super_admin |
| 5.2.3 | As a manager/super_admin, I see a validation error if the phone number doesn't match the Polish format (+48 XXX XXX XXX). | manager, super_admin |
| 5.2.4 | As a manager/super_admin, I see a validation error if the email format is invalid. | manager, super_admin |
| 5.2.5 | As a manager/super_admin, the submit button is disabled when the name field is empty. | manager, super_admin |
| 5.2.6 | As a manager/super_admin, after successfully creating a student I am redirected to the students list. | manager, super_admin |
| 5.2.7 | As a manager/super_admin, I can cancel creation and go back to the previous page. | manager, super_admin |

### 5.3 Student Detail

| # | Story | Role |
|---|-------|------|
| 5.3.1 | As a user, I can view a student's full name, phone (clickable tel: link), email (clickable mailto: link), date of birth, and notes. | All |
| 5.3.2 | As a manager/super_admin, I can click "Edytuj" to edit the student's information inline. | manager, super_admin |
| 5.3.3 | As a user, I can see the student's active group memberships in the "Grupy" tab, and click them to go to the group detail. | All |
| 5.3.4 | As a user, I can see the student's pass history in the "Karnet" tab, showing template name, active/expired badge, paid/unpaid badge, date range, entries used/total, price, and auto-renewal info. | All |
| 5.3.5 | As a manager/super_admin, I can click "Nowy karnet" to create a new pass for the student. | manager, super_admin |
| 5.3.6 | As a manager/super_admin, I can click "Odnow karnet" to renew an existing pass (pre-fills next start date). | manager, super_admin |
| 5.3.7 | As a manager/super_admin, I can see projected next renewal dates for auto-renewing passes. | manager, super_admin |
| 5.3.8 | As a manager/super_admin, I can click "Zapisz platnosc" on an unpaid active pass to navigate to the payment form. | manager, super_admin |
| 5.3.9 | As a manager/super_admin, I can view the student's payment history in the "Platnosci" tab. | manager, super_admin |

### 5.4 Student Editing

| # | Story | Role |
|---|-------|------|
| 5.4.1 | As a manager/super_admin, I can edit a student's name, phone, email, date of birth, and notes. | manager, super_admin |
| 5.4.2 | As a manager/super_admin, the form is pre-filled with the student's current data when editing. | manager, super_admin |
| 5.4.3 | As a manager/super_admin, the same validation rules apply when editing as when creating. | manager, super_admin |

---

## 6. Groups

### 6.1 Group List

| # | Story | Role |
|---|-------|------|
| 6.1.1 | As a user, I can view all active groups in my studio, organized by day of week (Monday through Sunday). | All |
| 6.1.2 | As a user, each group card shows the code badge, level badge (colored), name, time, instructor name, and member count / capacity. | All |
| 6.1.3 | As a user, I can click a group card to navigate to its detail page. | All |
| 6.1.4 | As a manager/super_admin, I can click "Dodaj" to navigate to the new group form. | manager, super_admin |
| 6.1.5 | As a manager/super_admin, I can hover over a group card to reveal a delete (deactivate) icon. | manager, super_admin |
| 6.1.6 | As a manager/super_admin, clicking the delete icon shows a confirmation dialog with the count of active members and total sessions that will be affected. | manager, super_admin |
| 6.1.7 | As a manager/super_admin, confirming deactivation soft-deletes the group (sets inactive), deactivates all memberships, and cancels future sessions. | manager, super_admin |

### 6.2 Group Creation

| # | Story | Role |
|---|-------|------|
| 6.2.1 | As a manager/super_admin, I can create a new group by filling in: code (required, unique per studio), name (required), day of week, start time, end time, level, instructor, and capacity. | manager, super_admin |
| 6.2.2 | As a manager/super_admin, I see a validation error if start time is after or equal to end time. | manager, super_admin |
| 6.2.3 | As a manager/super_admin, I see a validation error if capacity is outside 1-100. | manager, super_admin |
| 6.2.4 | As a manager/super_admin, I can select from available group levels (configured in settings). | manager, super_admin |
| 6.2.5 | As a manager/super_admin, I can select an instructor from the studio's active instructors list. | manager, super_admin |
| 6.2.6 | As a manager/super_admin, after successfully creating a group I am redirected to the groups list. | manager, super_admin |
| 6.2.7 | As a manager/super_admin, I can cancel creation and go back. | manager, super_admin |

### 6.3 Group Detail

| # | Story | Role |
|---|-------|------|
| 6.3.1 | As a user, I can view the group's name, code badge, level badge, day of week, time range, and instructor name. | All |
| 6.3.2 | As a user, I can click "Sprawdz obecnosc" to navigate to the attendance grid for this group. | All |
| 6.3.3 | As a manager/super_admin, I can click "Edytuj" to edit the group's details inline. | manager, super_admin |
| 6.3.4 | As a user, I can see the group roster (list of active members with names and phone numbers). | All |
| 6.3.5 | As a manager/super_admin, I can add a student to the group roster by selecting from studio students who are not yet members. | manager, super_admin |
| 6.3.6 | As a manager/super_admin, I can remove a student from the group roster (soft-delete: sets `is_active=false` and records `left_at`). | manager, super_admin |

### 6.4 Group Editing

| # | Story | Role |
|---|-------|------|
| 6.4.1 | As a manager/super_admin, I can edit a group's code, name, day of week, times, level, instructor, and capacity. | manager, super_admin |
| 6.4.2 | As a manager/super_admin, the form is pre-filled with the group's current data when editing. | manager, super_admin |

---

## 7. Schedule

| # | Story | Role |
|---|-------|------|
| 7.1 | As a user on desktop, I see a weekly schedule grid (Mon-Sat columns) with all active groups shown as cards in their respective day columns. | All |
| 7.2 | As a user on mobile, I see a tabbed view with one tab per day, defaulting to the current day. | All |
| 7.3 | As a user, each group card shows the code badge, level badge, name, time, instructor, and member count / capacity. | All |
| 7.4 | As a user, I can click a group card to navigate to its detail page. | All |

---

## 8. Attendance

### 8.1 Attendance Group List

| # | Story | Role |
|---|-------|------|
| 8.1.1 | As a user, I see today's groups for my studio listed as cards. | All |
| 8.1.2 | As an instructor, I only see groups where I am the assigned instructor. | instructor |
| 8.1.3 | As a user, each card shows the group code, level badge, name, time, instructor name, and member count. | All |
| 8.1.4 | As a user, I can click a group card to open the attendance grid for that group. | All |

### 8.2 Attendance Grid

| # | Story | Role |
|---|-------|------|
| 8.2.1 | As a user, I see the group name, code, and the selected date with a relative label ("Dzisiaj", day name). | All |
| 8.2.2 | As a user, I can navigate between weeks using left/right arrows (jumps 7 days, aligned to the group's day of week). | All |
| 8.2.3 | As a user, I see a list of all active group members with their names. | All |
| 8.2.4 | As a user, I see each student's pass status badge: "Brak karnetu" (red) if expired/missing, "Karnet wygasa DD.MM.YYYY" (orange) if expiring within 7 days. | All |
| 8.2.5 | As a user, I can mark a student as present by clicking the green check button. | All |
| 8.2.6 | As a user, I can mark a student as absent by clicking the red X button. | All |
| 8.2.7 | As a user, clicking an already-active attendance button toggles to the opposite status. | All |
| 8.2.8 | As a user, attendance changes are applied optimistically (instantly in the UI) and rolled back on error. | All |
| 8.2.9 | As a user, I see a summary bar showing "Obecne: X/Y" with color-coded dots for present, absent, and excused counts. | All |

### 8.3 Attendance Notes

| # | Story | Role |
|---|-------|------|
| 8.3.1 | As a user, I can click the note icon on a student to open the note dialog. | All |
| 8.3.2 | As a user, I can select a quick note (Kontuzja, Urlop, Choroba, Spozniona) or type a free-text note. | All |
| 8.3.3 | As a user, saving a note automatically sets the student's status to "excused". | All |
| 8.3.4 | As a user, I see a note indicator icon on students who have a note for the current session. | All |

### 8.4 Guest / Substitute Entry

| # | Story | Role |
|---|-------|------|
| 8.4.1 | As a user, I can click the "Gosc" button to add a guest student to the attendance. | All |
| 8.4.2 | As a user, I enter the guest's full name in the substitute dialog. | All |
| 8.4.3 | As a user, if the guest name matches an existing student in the studio, that student is marked as present with `is_substitute=true`. | All |
| 8.4.4 | As a user, if the guest name does not match any existing student, a new student record is created and then marked as present. | All |
| 8.4.5 | As a user, guest/substitute entries appear in the attendance list labeled "(gosc)" after regular members. | All |

### 8.5 Quick Payment from Attendance

| # | Story | Role |
|---|-------|------|
| 8.5.1 | As a user, I can click the payment icon on a student to open the quick payment dialog. | All |
| 8.5.2 | As a user, the dialog shows the student's active passes; if there is only one, it is auto-selected. | All |
| 8.5.3 | As a user, I can select a pass, enter/confirm the amount (pre-filled from pass price), and choose the payment method (Gotowka / Przelew). | All |
| 8.5.4 | As a user, after a successful payment I see a checkmark confirmation in the dialog. | All |
| 8.5.5 | Note: the actual payment insert is restricted by database RLS to manager and super_admin roles. | manager, super_admin |

---

## 9. Passes

### 9.1 Pass Creation

| # | Story | Role |
|---|-------|------|
| 9.1.1 | As a manager/super_admin, I can create a new pass for a student from their detail page ("Nowy karnet" button). | manager, super_admin |
| 9.1.2 | As a manager/super_admin, I select a pass template which auto-populates: price, entries total, auto-renew default, and valid_until (calculated from valid_from + duration_days). | manager, super_admin |
| 9.1.3 | As a manager/super_admin, I can override the auto-populated price, entries total, valid_from, and valid_until. | manager, super_admin |
| 9.1.4 | As a manager/super_admin, I can toggle the auto-renew checkbox. | manager, super_admin |
| 9.1.5 | As a manager/super_admin, I can add optional notes to the pass. | manager, super_admin |
| 9.1.6 | As a manager/super_admin, I see a validation error if valid_from is after valid_until. | manager, super_admin |

### 9.2 Pass Renewal

| # | Story | Role |
|---|-------|------|
| 9.2.1 | As a manager/super_admin, I can renew an existing pass via the "Odnow karnet" button on the student detail page. | manager, super_admin |
| 9.2.2 | As a manager/super_admin, the renewal form pre-fills the next start date (day after old pass's valid_until). | manager, super_admin |
| 9.2.3 | As a manager/super_admin, renewing a pass deactivates the old pass and creates a new one. | manager, super_admin |

### 9.3 Pass Auto-Renewal (System)

| # | Story | Role |
|---|-------|------|
| 9.3.1 | As a system process, passes with `auto_renew=true` are automatically renewed when they expire (via scheduled database function). | System |
| 9.3.2 | As a system process, auto-renewal calculates the new period with the same duration, starting from the day after expiry (skipping to next working day). | System |
| 9.3.3 | As a system process, auto-renewal extends the new period duration by the number of weekday public holidays within that range. | System |
| 9.3.4 | As a system process, auto-renewal resets entries_used to 0. | System |

### 9.4 Pass Display

| # | Story | Role |
|---|-------|------|
| 9.4.1 | As a user, I can see a student's pass history on their detail page showing: template name, active/expired badge, paid/unpaid badge, date range, entries used/total, price. | All |
| 9.4.2 | As a user, I can see the projected next renewal period for auto-renewing passes. | All |

---

## 10. Payments

### 10.1 Payments Overview

| # | Story | Role |
|---|-------|------|
| 10.1.1 | As a manager/super_admin, I can view the payments overview page. | manager, super_admin |
| 10.1.2 | As a manager/super_admin, I can navigate between months using left/right arrows. | manager, super_admin |
| 10.1.3 | As a manager/super_admin, I see three revenue summary cards: total (Razem), cash (Gotowka), and transfers (Przelewy) — each showing amount and count. | manager, super_admin |
| 10.1.4 | As a manager/super_admin, I can search unpaid/overdue lists by student name. | manager, super_admin |
| 10.1.5 | As a manager/super_admin, I see a list of unpaid passes (active passes with no payment for the current period). | manager, super_admin |
| 10.1.6 | As a manager/super_admin, I can click "Oplac" on an unpaid pass to navigate to the payment form pre-filled with that student and pass. | manager, super_admin |
| 10.1.7 | As a manager/super_admin, I see a list of overdue students (active students with expired or no pass). | manager, super_admin |
| 10.1.8 | As a manager/super_admin, I can click "Oplac" on an overdue student to navigate to their passes tab. | manager, super_admin |
| 10.1.9 | As a manager/super_admin, I see a paginated payment history (20 per page) with amount, method badge, student name, and date. | manager, super_admin |
| 10.1.10 | As a manager/super_admin, I can navigate between payment history pages using Previous/Next buttons. | manager, super_admin |

### 10.2 Payment Recording

| # | Story | Role |
|---|-------|------|
| 10.2.1 | As a manager/super_admin, I can record a new payment from the payments page ("Zapisz platnosc" button). | manager, super_admin |
| 10.2.2 | As a manager/super_admin, I can search for a student by name when no student is preselected. | manager, super_admin |
| 10.2.3 | As a manager/super_admin, the form can be pre-filled with a student and pass via URL query parameters (`?student=UUID&pass=UUID`). | manager, super_admin |
| 10.2.4 | As a manager/super_admin, I can select a pass from the student's active passes. | manager, super_admin |
| 10.2.5 | As a manager/super_admin, the amount is pre-filled from the selected pass's price. | manager, super_admin |
| 10.2.6 | As a manager/super_admin, I can choose the payment method: Gotowka (cash) or Przelew (transfer). | manager, super_admin |
| 10.2.7 | As a manager/super_admin, I can add optional notes to the payment. | manager, super_admin |
| 10.2.8 | As a manager/super_admin, the submit button is disabled when no student or amount is entered. | manager, super_admin |
| 10.2.9 | As a manager/super_admin, after a successful payment I see a confirmation and am redirected to the payments list. | manager, super_admin |
| 10.2.10 | As a manager/super_admin, I can cancel and go back to the previous page. | manager, super_admin |

### 10.3 Student Payment History

| # | Story | Role |
|---|-------|------|
| 10.3.1 | As a manager/super_admin, I can view a specific student's payment history from `/payments/[studentId]`. | manager, super_admin |
| 10.3.2 | As a manager/super_admin, I can click "Zapisz platnosc" to record a new payment for that student. | manager, super_admin |

---

## 11. Settings

### 11.1 Settings Hub

| # | Story | Role |
|---|-------|------|
| 11.1.1 | As a super_admin, I can access the settings page from the sidebar navigation. | super_admin |
| 11.1.2 | As a super_admin, I see five settings sections as clickable cards: Studia, Uzytkownicy, Typy karnetow, Poziomy grup, Dni wolne. | super_admin |

### 11.2 Studio Management

| # | Story | Role |
|---|-------|------|
| 11.2.1 | As a super_admin, I can view a list of all studios with their name, address, and phone. | super_admin |
| 11.2.2 | As a super_admin, I can create a new studio by providing a name (required), address, and phone. | super_admin |
| 11.2.3 | As a super_admin, I can edit an existing studio's name, address, and phone. | super_admin |

### 11.3 User Management

| # | Story | Role |
|---|-------|------|
| 11.3.1 | As a super_admin, I can view a list of all user profiles with their name, role badge (Administrator / Manager / Instruktor), and active status. | super_admin |
| 11.3.2 | As a super_admin, I can create a new user account by providing: full name, email, password, global role, and studio assignment. | super_admin |
| 11.3.3 | As a super_admin, a new user account is created via Supabase Auth, then their profile role is updated, and they are assigned to the selected studio. | super_admin |

### 11.4 Pass Template Management

| # | Story | Role |
|---|-------|------|
| 11.4.1 | As a super_admin, I can view all pass templates for the active studio, including inactive ones (shown dimmed). | super_admin |
| 11.4.2 | As a super_admin, each template shows: name, active/inactive status, default price (PLN), duration (days), entries (or "Bez limitu"), and auto-renew flag. | super_admin |
| 11.4.3 | As a super_admin, I can create a new pass template with: name (required), default price, duration days, entries total (empty = unlimited), sort order, and auto-renew default. | super_admin |
| 11.4.4 | As a super_admin, I can edit an existing pass template's fields and toggle its active status. | super_admin |

### 11.5 Group Level Management

| # | Story | Role |
|---|-------|------|
| 11.5.1 | As a super_admin, I can view all group levels (including inactive ones) with their colored label badge, value/slug, and sort order. | super_admin |
| 11.5.2 | As a super_admin, I can create a new group level with: label (required), value/slug (required, lowercase with underscores), color (from 13 Tailwind options), and sort order. | super_admin |
| 11.5.3 | As a super_admin, I can edit an existing group level's label, color, sort order, and active status (value/slug is locked after creation). | super_admin |

### 11.6 Public Holiday Management

| # | Story | Role |
|---|-------|------|
| 11.6.1 | As a manager/super_admin, I can view public holidays for a selected year, with navigation between years. | manager, super_admin |
| 11.6.2 | As a manager/super_admin, each holiday shows: name, localized date, day name, and a weekend badge if applicable. | manager, super_admin |
| 11.6.3 | As a manager/super_admin, past holidays are shown dimmed. | manager, super_admin |
| 11.6.4 | As a manager/super_admin, I can add a new public holiday by providing a date and name. | manager, super_admin |
| 11.6.5 | As a manager/super_admin, I can delete a public holiday after confirming in a dialog. | manager, super_admin |
| 11.6.6 | As a manager/super_admin, I see a note that only weekday holidays (Mon-Fri) affect pass auto-renewal duration calculations. | manager, super_admin |

---

## 12. Error Handling & Feedback

| # | Story | Role |
|---|-------|------|
| 12.1 | As a user, if a page fails to load I see a user-friendly error screen with a "Try Again" button. | All |
| 12.2 | As a user, if a data fetch fails I see an error card with a "Retry" button on the affected section. | All |
| 12.3 | As a user, I see a success toast notification after successfully submitting a form (create/edit/payment). | All |
| 12.4 | As a user, I see an error toast notification if a form submission fails. | All |
| 12.5 | As a user, form fields show inline validation errors in Polish before submitting to the server. | All |
| 12.6 | As a user, errors are automatically reported to Sentry for monitoring. | All |

---

## 13. Loading States

| # | Story | Role |
|---|-------|------|
| 13.1 | As a user, I see skeleton loading UI (matching the page layout) while a page is loading. | All |
| 13.2 | As a user, I see a loading spinner while data is being fetched within a page. | All |
| 13.3 | As a user, form submit buttons are disabled and show a loading state while saving. | All |
