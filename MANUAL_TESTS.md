# ProFlying Academy — Manual Test Checklist

Use this file to manually verify all user flows. Work through each section in order.
Check the box when a test passes. Note any failures inline.

**Roles needed:** You'll need accounts for `super_admin`, `manager`, and `instructor` to cover all cases.

---

## 0. Auth & Redirects

- [ ] **0.1** Visit `/` while logged out → redirected to `/login`
- [ ] **0.2** Visit `/dashboard`, `/students`, `/groups`, `/payments`, `/attendance`, `/schedule`, `/settings` while logged out → all redirect to `/login`
- [ ] **0.3** Visit `/login` while already logged in → redirected to `/dashboard`
- [ ] **0.4** Visit `/callback?code=<valid_code>` → session exchanged, redirected to `/dashboard`
- [ ] **0.5** Visit `/callback` with no `code` param → redirected to `/login?error=auth`
- [ ] **0.6** Visit `/callback?next=https://evil.com` → `next` param rejected, redirected to `/dashboard`

---

## 1. Login Page (`/login`)

**UI:** Card "ProFlying Academy", subtitle "Zaloguj sie do swojego konta", Email field (`twoj@email.pl`), Haslo field, button "Zaloguj sie"

- [ ] **1.1** Submit with valid credentials → redirected to `/dashboard`
- [ ] **1.2** Submit with wrong password → error "Nieprawidlowy email lub haslo"
- [ ] **1.3** Button shows "Logowanie..." while request is in flight
- [ ] **1.4** Submit with empty email → browser prevents submit
- [ ] **1.5** Submit with empty password → browser prevents submit

---

## 2. Navigation & Layout

### 2.1 Sidebar (desktop)

- [ ] **2.1.1** All roles see: Pulpit, Obecnosc, Grafik, Kursantki, Grupy
- [ ] **2.1.2** Only `super_admin`/`manager` see "Platnosci"
- [ ] **2.1.3** Only `super_admin` sees "Ustawienia"
- [ ] **2.1.4** Active route link is highlighted (blue tint)
- [ ] **2.1.5** Click "ProFlying" logo → navigates to `/dashboard`

### 2.2 Mobile Navigation (bottom bar)

- [ ] **2.2.1** Bottom bar shows: Pulpit, Obecnosc, Grafik, Kursantki
- [ ] **2.2.2** "Wiecej" button expands: Grupy + role-gated items (Platnosci, Ustawienia)
- [ ] **2.2.3** Instructor does NOT see Platnosci or Ustawienia in "Wiecej"

### 2.3 User Menu (top-right avatar)

- [ ] **2.3.1** Click avatar → dropdown shows full name and role (Administrator / Manager / Instruktor)
- [ ] **2.3.2** Click "Wyloguj sie" → signed out, redirected to `/login`
- [ ] **2.3.3** Profile with no name → shows generic User icon and "Uzytkownik"

### 2.4 Studio Switcher (topbar)

- [ ] **2.4.1** Non-super_admin with 1 studio → studio name shown as plain text (no dropdown)
- [ ] **2.4.2** User with 2+ studios or super_admin → dropdown with all studios (name + address)
- [ ] **2.4.3** Click a studio → switches active studio, data reloads
- [ ] **2.4.4** super_admin sees "Wszystkie studia" option with globe icon
- [ ] **2.4.5** Selected studio is highlighted with `bg-accent`
- [ ] **2.4.6** Refresh page → previously selected studio is remembered (localStorage)

### 2.5 Notification Bell (topbar)

- [ ] **2.5.1** Student with birthday today → pink badge with count on bell icon
- [ ] **2.5.2** Click bell → popover with "Dzisiaj" section listing birthday students
- [ ] **2.5.3** Student with birthday in next 7 days → "Nadchodzace" section
- [ ] **2.5.4** No upcoming birthdays → "Brak powiadomien"
- [ ] **2.5.5** Click a birthday row → navigates to `/students/{id}`

---

## 3. Dashboard (`/dashboard`)

### 3.1 Stats Cards

- [ ] **3.1.1** "Aktywne kursantki" card → correct count (all roles)
- [ ] **3.1.2** "Aktywne grupy" card → correct count (all roles)
- [ ] **3.1.3** "Przychod (miesiac)" card → shows amount in zl (manager/super_admin only)
- [ ] **3.1.4** "Zaleglosci" card → overdue student count (manager/super_admin only)
- [ ] **3.1.5** Instructor role → only sees first 2 stat cards

### 3.2 Banners & Alerts

- [ ] **3.2.1** Students without active pass → yellow alert banner "N kursantek bez aktywnego karnetu" with "Sprawdz" link to `/payments` (manager/super_admin only)
- [ ] **3.2.2** Student birthday today → pink banner "Dzisiaj urodziny: {name}" with links to profiles
- [ ] **3.2.3** Instructor role → no yellow alert banner shown

### 3.3 "Do oplaty dzisiaj" Section (manager/super_admin)

- [ ] **3.3.1** Students in today's classes with no pass/expired pass/unpaid pass → listed with group code, reason, and "Oplac" button
- [ ] **3.3.2** "Oplac" for student with `unpaid_pass` → goes to `/payments/record?student={id}&pass={passId}`
- [ ] **3.3.3** "Oplac" for student with `expired` or `no_pass` → goes to `/students/{id}?tab=passes`
- [ ] **3.3.4** All students paid → "Wszystko oplacone" with green checkmark

### 3.4 Calendar

- [ ] **3.4.1** Week view shows Mon-Sat columns with group time blocks
- [ ] **3.4.2** Navigate with prev/next arrows → moves to adjacent week
- [ ] **3.4.3** Click a group block → navigates to `/groups/{groupId}`
- [ ] **3.4.4** Red line shows current time (updates every minute)
- [ ] **3.4.5** Holidays shown in red in column header
- [ ] **3.4.6** Birthdays shown with cake icon in column header
- [ ] **3.4.7** Load error → ErrorCard "Nie udalo sie zaladowac pulpitu" with retry button

---

## 4. Students

### 4.1 Student List (`/students`)

- [ ] **4.1.1** Header "Kursantki" with "Dodaj" button → links to `/students/new`
- [ ] **4.1.2** Search bar "Szukaj kursantki..." → typing filters list in real time
- [ ] **4.1.3** Count label shows "N kursantek"
- [ ] **4.1.4** Each row shows: name, price (if pass), phone/email, payment badge, pass info
- [ ] **4.1.5** Payment badges: "Oplacony" (green), "Nieoplacony" (red), "Wygasl" (red destructive)
- [ ] **4.1.6** Auto-renewing pass shows "Auto" outline badge
- [ ] **4.1.7** Student with no pass → "Brak karnetu"
- [ ] **4.1.8** Click a student row → navigates to `/students/{id}`
- [ ] **4.1.9** No students → EmptyState "Brak kursantek" with "Dodaj kursantke" button
- [ ] **4.1.10** Search returns no results → EmptyState "Brak wynikow"

### 4.2 Create Student (`/students/new`)

**Fields:** Imie i nazwisko *, Telefon, Email, Data urodzenia, Notatki

- [ ] **4.2.1** Submit with name < 2 chars → "Imie i nazwisko musi miec co najmniej 2 znaki"
- [ ] **4.2.2** Submit with name > 100 chars → "Imie i nazwisko moze miec maksymalnie 100 znakow"
- [ ] **4.2.3** Submit with invalid phone (e.g. `123`) → "Nieprawidlowy numer telefonu (np. +48 600 000 000)"
- [ ] **4.2.4** Submit with invalid email → "Nieprawidlowy adres email"
- [ ] **4.2.5** Submit button disabled when name is empty
- [ ] **4.2.6** Button shows "Zapisywanie..." during save
- [ ] **4.2.7** Successful create → toast "Kursantka dodana", redirect to `/students`
- [ ] **4.2.8** DB error → toast "Nie udalo sie zapisac kursantki"
- [ ] **4.2.9** "Anuluj" → goes back

### 4.3 Student Detail (`/students/{id}`)

**Tabs:** Grupy | Karnet | Platnosci (manager/super_admin only)

- [ ] **4.3.1** Header shows student name; phone is clickable `tel:` link; email is `mailto:` link
- [ ] **4.3.2** "Edytuj" button → switches to edit form pre-filled with current data
- [ ] **4.3.3** Edit save → toast "Kursantka zaktualizowana", returns to detail view
- [ ] **4.3.4** Tab "Grupy" → lists active group memberships as clickable cards
- [ ] **4.3.5** No groups → "Brak przypisanych grup"
- [ ] **4.3.6** Tab "Karnet" → pass history; each pass shows: template name, Aktywny/Wygasl badge, Oplacony/Nieoplacony badge, date range, entries used/total, price
- [ ] **4.3.7** "Nowy karnet" button → inline PassForm appears
- [ ] **4.3.8** "Odnow karnet" button (if existing pass) → PassForm with pre-filled next start date
- [ ] **4.3.9** Auto-renewing pass shows projected next period dates
- [ ] **4.3.10** "Zapisz platnosc" on unpaid active pass → links to `/payments/record?student={id}&pass={passId}` (manager/super_admin only)
- [ ] **4.3.11** Tab "Platnosci" → payment history with amount, method badge, date
- [ ] **4.3.12** Instructor role → only 2 tabs visible (no Platnosci)
- [ ] **4.3.13** URL `?tab=passes` → opens on Karnet tab
- [ ] **4.3.14** Student not found → "Nie znaleziono kursantki" with back link

---

## 5. Groups

### 5.1 Group List (`/groups`)

- [ ] **5.1.1** Header "Grupy" with "Dodaj" button → links to `/groups/new`
- [ ] **5.1.2** Groups displayed as cards, grouped by day (Mon-Sun)
- [ ] **5.1.3** Each card: code badge, level badge (colored), name, time, instructor, member count / capacity
- [ ] **5.1.4** Hover over card → trash icon appears (top-right)
- [ ] **5.1.5** Click card body → navigates to `/groups/{id}`
- [ ] **5.1.6** No groups → EmptyState "Brak grup" with "Dodaj grupe" button

### 5.2 Group Deactivation

- [ ] **5.2.1** Click trash icon → confirmation dialog "Dezaktywuj grupe" with group code and name
- [ ] **5.2.2** Dialog shows loading spinner, then: "Aktywnych czlonkow: N", "Sesji ogolem: N"
- [ ] **5.2.3** Warning text about consequences visible
- [ ] **5.2.4** "Anuluj" → dialog closes, nothing happens
- [ ] **5.2.5** "Dezaktywuj" → button shows "Dezaktywacja...", group removed from list
- [ ] **5.2.6** Verify: group `is_active=false`, memberships deactivated, future sessions cancelled

### 5.3 Create Group (`/groups/new`)

**Fields:** Kod grupy *, Nazwa *, Dzien tygodnia, Godzina rozpoczecia, Godzina zakonczenia, Poziom, Instruktor, Pojemnosc

- [ ] **5.3.1** Empty code → "Kod grupy jest wymagany"
- [ ] **5.3.2** End time <= start time → "Godzina zakonczenia musi byc pozniejsza niz rozpoczecia"
- [ ] **5.3.3** Capacity > 100 → "Pojemnosc moze wynosic maksymalnie 100"
- [ ] **5.3.4** Duplicate code → "Kod grupy juz istnieje w tym studiu"
- [ ] **5.3.5** Level dropdown populated from group_levels table
- [ ] **5.3.6** Instructor dropdown populated from studio's active instructors
- [ ] **5.3.7** Successful create → toast "Grupa dodana", redirect to `/groups`
- [ ] **5.3.8** "Anuluj" → goes back

### 5.4 Group Detail (`/groups/{id}`)

- [ ] **5.4.1** Header shows: group name, code badge, level badge, day, time, instructor
- [ ] **5.4.2** "Sprawdz obecnosc" button → navigates to `/attendance/{groupId}`
- [ ] **5.4.3** "Edytuj" button → switches to edit form
- [ ] **5.4.4** Edit save → toast "Grupa zaktualizowana"
- [ ] **5.4.5** Group not found → "Nie znaleziono grupy" with back link

### 5.5 Group Roster (on Group Detail)

- [ ] **5.5.1** "Kursantki (N)" header with count
- [ ] **5.5.2** Member list shows name + phone for each member
- [ ] **5.5.3** "Dodaj" button → dialog "Dodaj kursantke do grupy" with student selector
- [ ] **5.5.4** Only students NOT already in group shown in selector
- [ ] **5.5.5** All students in group → "Wszystkie kursantki sa juz w tej grupie"
- [ ] **5.5.6** Select student and click "Dodaj" → member added, list refreshes
- [ ] **5.5.7** Trash icon per member → soft-removes (is_active=false, left_at=today)
- [ ] **5.5.8** No members → "Brak kursantek w tej grupie"

---

## 6. Attendance

### 6.1 Attendance Index (`/attendance`)

- [ ] **6.1.1** Header "Obecnosc" with subtitle about today's classes
- [ ] **6.1.2** Today's groups shown as cards: code, level, name, time, instructor, member count
- [ ] **6.1.3** "Sprawdz" button on each card → navigates to `/attendance/{groupId}`
- [ ] **6.1.4** Instructor role → only sees their own groups
- [ ] **6.1.5** No classes today → EmptyState "Brak zajec dzisiaj"

### 6.2 Attendance Grid (`/attendance/{groupId}`)

**Navigation:** prev-week (ChevronLeft), date display, next-week (ChevronRight)
**Summary bar:** "Obecne: N/Total" with colored dot counts
**Button:** "Gosc" (UserPlus icon)

- [ ] **6.2.1** Date defaults to closest past occurrence of group's day_of_week
- [ ] **6.2.2** Navigate previous week → date -7 days
- [ ] **6.2.3** Navigate next week → date +7 days
- [ ] **6.2.4** Session auto-created on date change (no manual step needed)

### 6.3 Marking Attendance

Per-student row shows: name, pass badge, note icon, payment icon, Check button (green), X button (red)

- [ ] **6.3.1** Click green Check on unmarked student → marked "present" (button highlighted green)
- [ ] **6.3.2** Click green Check again → toggled to "absent"
- [ ] **6.3.3** Click red X on unmarked student → marked "absent" (button highlighted red)
- [ ] **6.3.4** Click red X again → toggled to "present"
- [ ] **6.3.5** Change is instant (optimistic update), DB call happens in background
- [ ] **6.3.6** Student with expired pass → red badge "Brak karnetu (dd.MM.yyyy)"
- [ ] **6.3.7** Student with pass expiring in <=7 days → orange badge "Karnet wygasa dd.MM.yyyy"
- [ ] **6.3.8** Summary bar updates live as attendance is marked

### 6.4 Note Dialog

Click message icon on a student → dialog "Notatka - {studentName}"

- [ ] **6.4.1** Quick note buttons: Kontuzja, Urlop, Choroba, Spozniona
- [ ] **6.4.2** Click a quick note → fills textarea
- [ ] **6.4.3** Type custom note + click "Zapisz" → note saved, status set to "excused"
- [ ] **6.4.4** Student with note → message icon highlighted; note text shown below name
- [ ] **6.4.5** "Anuluj" → no change

### 6.5 Guest/Substitute Dialog

Click "Gosc" button → dialog "Dodaj goscia"

- [ ] **6.5.1** Enter name + click "Dodaj" → if existing student found, marked present as substitute; if not found, new student created first
- [ ] **6.5.2** Press Enter → same as "Dodaj"
- [ ] **6.5.3** "Dodaj" disabled if name is empty/whitespace
- [ ] **6.5.4** Substitute shown in grid with "(gosc)" label
- [ ] **6.5.5** "Anuluj" → no change

### 6.6 Quick Payment Dialog

Click banknote icon on a student → dialog "Platnosc - {studentName}"

- [ ] **6.6.1** Loads student's active passes; auto-selects if only 1
- [ ] **6.6.2** Amount pre-filled from selected pass price
- [ ] **6.6.3** Method toggle: "Gotowka" / "Przelew"
- [ ] **6.6.4** No active passes → "Brak aktywnego karnetu"
- [ ] **6.6.5** "Zapisz" → payment recorded, success state shown, dialog auto-closes after ~1s
- [ ] **6.6.6** "Zapisz" disabled if no pass or no amount
- [ ] **6.6.7** "Anuluj" → closes dialog

---

## 7. Payments (manager/super_admin only)

### 7.1 Payments Overview (`/payments`)

- [ ] **7.1.1** Header "Platnosci" with "Zapisz platnosc" button → `/payments/record`
- [ ] **7.1.2** Month navigation: left/right arrows, month name in Polish
- [ ] **7.1.3** Revenue cards: "Razem" (total + count), "Gotowka", "Przelewy"
- [ ] **7.1.4** Search "Szukaj kursantki..." → filters unpaid/overdue lists

### 7.2 Unpaid Passes ("Karnety bez platnosci" — orange border)

- [ ] **7.2.1** Lists active passes without payment for current period
- [ ] **7.2.2** Each row: student name, template · dates · price, "Auto" badge if auto_renew
- [ ] **7.2.3** "Oplac" button → `/payments/record?student={id}&pass={passId}`
- [ ] **7.2.4** Empty → card not shown

### 7.3 Overdue Students ("Zaleglosci" — yellow border)

- [ ] **7.3.1** Lists students with expired/no pass who have active group memberships
- [ ] **7.3.2** Shows "Karnet wygasl: dd.MM.yyyy" or "Brak karnetu"
- [ ] **7.3.3** "Oplac" button → `/students/{id}?tab=passes`
- [ ] **7.3.4** Empty → card not shown

### 7.4 Payment History

- [ ] **7.4.1** Paginated list (20 per page): amount, Gotowka/Przelew badge, student name, date
- [ ] **7.4.2** "Poprzednia" / "Nastepna" buttons for pagination
- [ ] **7.4.3** Page indicator "N / M"
- [ ] **7.4.4** No payments → "Brak platnosci do wyswietlenia"

### 7.5 Record Payment (`/payments/record`)

**Fields:** Kursantka * (search dropdown), Karnet * (select), Kwota (zl) *, Metoda platnosci (select), Notatki

- [ ] **7.5.1** With `?student=id&pass=id` → student pre-selected, pass pre-selected, amount pre-filled
- [ ] **7.5.2** Without params → type to search students (dropdown list appears)
- [ ] **7.5.3** Selected student shown with "Zmien" option
- [ ] **7.5.4** Student with no active passes → warning "Brak aktywnego karnetu" with link to create pass
- [ ] **7.5.5** Submit with amount < 1 → "Kwota musi wynosic co najmniej 1 zl"
- [ ] **7.5.6** Submit with amount > 100000 → "Kwota nie moze przekraczac 100 000 zl"
- [ ] **7.5.7** Successful submit → toast "Platnosc zapisana", success card, redirect to `/payments` after 1.5s
- [ ] **7.5.8** DB error → toast "Nie udalo sie zapisac platnosci"
- [ ] **7.5.9** "Anuluj" → goes back
- [ ] **7.5.10** Submit button disabled when no student or no amount

### 7.6 Student Payment History (`/payments/{studentId}`)

- [ ] **7.6.1** Header "Platnosci - {student name}" with "Zapisz platnosc" button
- [ ] **7.6.2** Payment list: amount, method badge, date, notes
- [ ] **7.6.3** No payments → "Brak platnosci do wyswietlenia"

---

## 8. Passes

### 8.1 Create Pass (on Student Detail → Karnet tab)

**Fields:** Typ karnetu (select), Cena (zl), Liczba wejsc, Od (date), Do (date), Automatyczne odnawianie (checkbox), Notatki

- [ ] **8.1.1** Select template → auto-fills: price, entries, auto_renew, calculates valid_until
- [ ] **8.1.2** Change valid_from → valid_until recalculates
- [ ] **8.1.3** Price < 0 → "Cena nie moze byc ujemna"
- [ ] **8.1.4** valid_until < valid_from → "Data zakonczenia musi byc pozniejsza niz rozpoczecia"
- [ ] **8.1.5** entries_total = 0 → "Liczba wejsc musi byc wieksza niz 0"
- [ ] **8.1.6** Successful create → toast "Karnet utworzony", form closes
- [ ] **8.1.7** "Anuluj" → form hidden

### 8.2 Renew Pass

- [ ] **8.2.1** "Odnow karnet" button appears when student has an existing pass
- [ ] **8.2.2** valid_from pre-set to day after old pass's valid_until
- [ ] **8.2.3** On save → old pass deactivated, new pass created
- [ ] **8.2.4** Toast "Karnet odnowiony"

---

## 9. Schedule (`/schedule`)

- [ ] **9.1** Desktop: 6-column grid (Mon-Sat) with group cards
- [ ] **9.2** Mobile: tabbed view per day, defaults to current day
- [ ] **9.3** Each card: code badge, level badge, name, time, instructor, member count/capacity
- [ ] **9.4** Click a card → navigates to `/groups/{groupId}`
- [ ] **9.5** Day with no groups (desktop) → "-" placeholder
- [ ] **9.6** No groups at all → EmptyState "Brak grup w grafiku"

---

## 10. Settings (super_admin only)

### 10.1 Settings Index (`/settings`)

- [ ] **10.1.1** Five cards: Studia, Uzytkownicy, Typy karnetow, Poziomy grup, Dni wolne
- [ ] **10.1.2** Each links to its sub-page

### 10.2 Studios (`/settings/studios`)

- [ ] **10.2.1** "Nowe studio" → dialog with: Nazwa *, Adres, Telefon
- [ ] **10.2.2** Edit (pencil icon) → dialog pre-filled
- [ ] **10.2.3** Save with empty name → button disabled
- [ ] **10.2.4** Successful create/edit → dialog closes, list refreshes

### 10.3 Users (`/settings/users`)

- [ ] **10.3.1** "Nowy uzytkownik" → dialog: Imie i nazwisko *, Email *, Haslo *, Rola, Studio
- [ ] **10.3.2** Role = super_admin → studio field hidden
- [ ] **10.3.3** Role = instructor/manager → studio select visible
- [ ] **10.3.4** "Utworz konto" disabled if any required field empty
- [ ] **10.3.5** Successful create → auth user created, profile updated, studio assigned
- [ ] **10.3.6** Duplicate email → error shown

### 10.4 Pass Types (`/settings/pass-types`)

- [ ] **10.4.1** "Nowy typ karnetu" → dialog: Nazwa *, Cena, Czas trwania, Wejscia, Kolejnosc, Auto-odnowienie checkbox
- [ ] **10.4.2** Edit → dialog pre-filled + "Aktywny" checkbox
- [ ] **10.4.3** Inactive template → "Nieaktywny" badge, reduced opacity
- [ ] **10.4.4** List shows: name, price, duration, entries (or "Bez limitu"), auto-renew indicator

### 10.5 Group Levels (`/settings/levels`)

- [ ] **10.5.1** "Nowy poziom" → dialog: Nazwa *, Klucz/slug * (create only), Kolor (picker), Kolejnosc
- [ ] **10.5.2** Edit → slug field locked
- [ ] **10.5.3** Color picker shows 13 Tailwind color swatches
- [ ] **10.5.4** Inactive level → "Nieaktywny" badge, reduced opacity

### 10.6 Holidays (`/settings/holidays`)

Accessible to manager and super_admin.

- [ ] **10.6.1** Year navigation with left/right arrows
- [ ] **10.6.2** "Dodaj dzien wolny" → dialog: Data *, Nazwa *
- [ ] **10.6.3** Holiday in the past → dimmed (opacity-50)
- [ ] **10.6.4** Holiday on weekend → "Weekend" badge
- [ ] **10.6.5** Trash icon → confirmation dialog "Usun dzien wolny?"
- [ ] **10.6.6** "Usun" in confirm → holiday deleted
- [ ] **10.6.7** "Anuluj" in confirm → no action
- [ ] **10.6.8** Footnote about weekday holidays affecting pass renewal visible

---

## 11. Studio Selection (`/studios`)

- [ ] **11.1** Grid of studio cards with name, address, phone
- [ ] **11.2** Click a card → studio switches, redirected to `/dashboard`

---

## 12. Role-Based Access Matrix

Verify these for each role:

| Feature | super_admin | manager | instructor |
|---------|:-----------:|:-------:|:----------:|
| Sidebar: Platnosci | [ ] Yes | [ ] Yes | [ ] No |
| Sidebar: Ustawienia | [ ] Yes | [ ] No | [ ] No |
| Dashboard: overdue banner | [ ] Yes | [ ] Yes | [ ] No |
| Dashboard: revenue + overdue cards | [ ] Yes | [ ] Yes | [ ] No |
| Dashboard: "Do oplaty dzisiaj" | [ ] Yes | [ ] Yes | [ ] No |
| Student detail: Platnosci tab | [ ] Yes | [ ] Yes | [ ] No |
| Student detail: "Zapisz platnosc" | [ ] Yes | [ ] Yes | [ ] No |
| Attendance: sees all groups | [ ] Yes | [ ] Yes | [ ] No |
| Attendance: sees only own groups | [ ] N/A | [ ] N/A | [ ] Yes |
| Studio switcher: "Wszystkie studia" | [ ] Yes | [ ] No | [ ] No |

---

## 13. Toast Messages

Trigger each action and verify the toast appears:

| Action | Expected Success Toast | Expected Error Toast |
|--------|----------------------|---------------------|
| Create student | [ ] "Kursantka dodana" | [ ] "Nie udalo sie zapisac kursantki" |
| Update student | [ ] "Kursantka zaktualizowana" | [ ] "Nie udalo sie zapisac kursantki" |
| Create group | [ ] "Grupa dodana" | [ ] "Nie udalo sie zapisac grupy" |
| Update group | [ ] "Grupa zaktualizowana" | [ ] "Nie udalo sie zapisac grupy" |
| Create pass | [ ] "Karnet utworzony" | [ ] "Nie udalo sie zapisac karnetu" |
| Renew pass | [ ] "Karnet odnowiony" | [ ] "Nie udalo sie zapisac karnetu" |
| Record payment | [ ] "Platnosc zapisana" | [ ] "Nie udalo sie zapisac platnosci" |

---

## 14. Error Handling & Edge Cases

- [ ] **14.1** No studio assigned to non-super_admin → pages show empty states
- [ ] **14.2** super_admin in "Wszystkie studia" mode → data hooks may return empty
- [ ] **14.3** Saved studio in localStorage no longer exists → falls back to default_studio, then "Srem", then first
- [ ] **14.4** Initial load → full-screen LoadingSpinner while auth/studio context loads
- [ ] **14.5** Network error during data fetch → ErrorCard with "Sprobuj ponownie" button
- [ ] **14.6** Error boundary triggered → user-friendly error page with "Sprobuj ponownie"
- [ ] **14.7** Pass with entries_total = null → entries counter not shown (unlimited)

---

## 15. Complete End-to-End Flows

### 15.1 New Student → Group → Attendance → Payment

- [ ] Create a new student at `/students/new`
- [ ] Add the student to a group via group detail roster
- [ ] Go to attendance for that group → student appears in grid
- [ ] Mark student as present
- [ ] Create a pass for the student (student detail → Karnet tab → Nowy karnet)
- [ ] Record a payment for the pass (student detail → Karnet tab → Zapisz platnosc)
- [ ] Verify student shows "Oplacony" badge on students list

### 15.2 Pass Renewal Flow

- [ ] Student with expiring/expired pass → "Odnow karnet" button visible
- [ ] Click "Odnow karnet" → form pre-fills with next period dates
- [ ] Save → old pass deactivated, new pass active
- [ ] Record payment for the new pass
- [ ] Verify "Oplacony" badge

### 15.3 Group Deactivation Flow

- [ ] Create a group with 2+ members
- [ ] Go to groups list → hover and click trash icon
- [ ] Verify confirmation dialog shows correct member count
- [ ] Confirm deactivation
- [ ] Verify: group disappears from list, members' group count decremented, attendance page no longer shows this group

### 15.4 Guest Attendance Flow

- [ ] Go to attendance for a group
- [ ] Click "Gosc" → enter a name that does NOT exist in the system
- [ ] Verify: new student created, marked present with "(gosc)" label
- [ ] Click "Gosc" → enter a name that DOES exist in the system
- [ ] Verify: existing student marked present as substitute, no duplicate student created
