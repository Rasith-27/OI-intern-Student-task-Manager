# StudyFlow — Student Task Manager (with Frontend Authentication)

A professional, responsive, and feature-complete Student Task Manager web application featuring an integrated **frontend authentication system** (Sign In, Create Account, Session Persistence, User Profile Management, and Multi-User Task Isolation). Built for the **OASIS INFOBYTE SIP** Web Development & Designing Internship (Level 2 — Task 3).

---

## Security & Demonstration Disclaimer

> [!IMPORTANT]
> **Frontend Demonstration Authentication Notice:**  
> Authentication in this application is implemented strictly as a **client-side demonstration** utilizing the browser's `localStorage` API (`studyFlowUsers`, `studyFlowSession`, `studyFlowTasks`).  
> In production environments, authentication should always be handled by a secure backend service utilizing HTTPS, password hashing (e.g. bcrypt/argon2), JWTs/secure HTTP-only session cookies, and robust server-side access controls.

---

## OASIS INFOBYTE SIP

- **Domain:** Web Development & Designing
- **Level:** Level 2
- **Task:** Task 3 — To-Do Web App
- **Project Name:** StudyFlow — Student Task Manager
- **Project Folder:** `WebDev-L2-Task3-DevTasks`

---

## Objective

Create a premium, student-focused task management workspace that fulfills all mandatory OASIS Level 2 Task 3 To-Do requirements (Add, Edit, Complete, Delete, Restore, Counts, Filters, Search, Timestamps, LocalStorage) enhanced with a professional frontend authentication system and user-specific task isolation.

---

## Authentication Architecture

```text
               STUDYFLOW
                   │
                   ↓
             LOGIN / SIGN UP
                   │
         ┌─────────┴─────────┐
         │                   │
      Sign In             Register
         │                   │
         └─────────┬─────────┘
                   ↓
               DASHBOARD
                   │
       ┌───────────┼───────────┐
       ↓           ↓           ↓
    Pending    Completed    Profile
       │
  Add / Edit
  Complete
  Delete
       │
       ↓
    LocalStorage
```

---

## Demo Student Accounts

For quick evaluation of multi-user data isolation, the app includes pre-seeded demo accounts:

| Student | Email | Password | Academic Focus |
| :--- | :--- | :--- | :--- |
| **Alex Morgan** | `alex@studyflow.edu` | `StudyFlow123!` | Computer Science |
| **Sarah Jenkins** | `sarah@studyflow.edu` | `StudyFlow123!` | Pre-Med Biology |

*You can also click the quick-login buttons on the Sign In page, or register any new custom account.*

---

## Features

### 1. Frontend Authentication & Session Guard
- **Sign In & Registration:** Clean, animated tabbed interface with glassmorphic cards.
- **Form Validation:** Real-time inline error handling for required fields, valid email format, minimum password length (6 characters), and matching password confirmation (zero native `alert()` calls).
- **Password Visibility:** Accessible eye buttons to show/hide passwords.
- **Remember Me & Session Persistence:** Sessions persist across browser reloads via `studyFlowSession`.
- **Protected Dashboard:** Unauthenticated users cannot view or manipulate the dashboard without a valid session.
- **User Profile Menu:** Interactive user avatar with initials, full name, email, student role badge, profile modal, and one-click Logout.

### 2. Multi-User Task Isolation
- Tasks are strictly partitioned by `userId`. Tasks created by Alex are completely private and invisible to Sarah, and vice-versa.
- Real-time statistics and progress calculations reflect only the logged-in user's tasks.

### 3. Core Task 3 To-Do Management
- **Add Task:** Fast task creation with subject categorization (`Assignment`, `Exam Prep`, `Research`, `Reading`, `Project`, `Lecture Review`, `General`), priority levels (`Low`, `Medium`, `High`), and optional due dates.
- **Inline Task Editing:** Modify task titles directly inside cards with Save/Cancel buttons and text auto-selection (no browser `prompt()`).
- **Complete & Restore Tasks:** Strikethrough completed styling, completion timestamps, and instant restore capability.
- **Delete Task & Clear Completed:** Custom accessible confirmation modal dialogs (zero browser `confirm()`).
- **Real-Time Search & Filters:** Instant search by task title and subject; status tabs (`All`, `Pending`, `Completed`); subject dropdown.
- **Dynamic Sorting:** Sort by `Newest`, `Oldest`, `Due Date (Soonest)`, `Priority High → Low`, `Priority Low → High`, `Title A → Z`.
- **Dynamic Statistics & Semester Velocity:** 4 live metric cards (`TOTAL TASKS`, `PENDING`, `COMPLETED`, `PROGRESS %`) + animated sidebar progress bar.
- **Dark / Light Theme Engine:** Dual-mode theme system saved in `localStorage`.
- **Toast Notifications:** Accessible non-blocking status toasts (`aria-live="polite"`).
- **Timestamps:** Native JavaScript Date formatting for creation and completion events.

---

## Technologies

- **HTML5:** Semantic markup, form controls, ARIA landmarks.
- **CSS3:** Custom properties (CSS variables), Flexbox, CSS Grid, Glassmorphism, animations, media queries.
- **Vanilla JavaScript (ES6+):** Clean modular functions, state management, event delegation, safe DOM creation.
- **LocalStorage API:** Browser storage for accounts (`studyFlowUsers`), sessions (`studyFlowSession`), and user-specific tasks (`studyFlowTasks`).

---

## Folder Structure

```
WebDev-L2-Task3-DevTasks/
│
├── index.html           # Authentication views, protected dashboard, modals, task lists
├── style.css            # Academic design system, dark/light themes, responsive layout
├── script.js            # Auth controller, user isolation, state engine, To-Do logic
│
├── assets/
│   └── icons/           # 14 SVG icons (eye, user, calendar, book-open, code, etc.)
│
├── screenshots/         # Directory prepared for user screenshot captures
│   └── .gitkeep
│
└── README.md            # Comprehensive project documentation
```

---

## How to Run

1. Open the project folder `WebDev-L2-Task3-DevTasks/`.
2. Double-click or open `index.html` in any modern web browser.
3. Sign in using a demo account (`alex@studyflow.edu` / `StudyFlow123!`) or click **"Create Account"** to register a new student account.

---

## Browser Testing

| Browser | Test Status | Notes |
| :--- | :---: | :--- |
| **Google Chrome** | **PASS** | Flawless auth transitions, smooth glassmorphism |
| **Microsoft Edge** | **PASS** | Crisp typography, responsive layout |
| **Mozilla Firefox** | **PASS** | Clean SVG icons, flawless form validation |
| **Safari / WebKit** | **PASS** | Smooth theme transitions and modal interactions |

---

## Responsive Testing

| Device Viewport | Resolution | Test Status | Observations |
| :--- | :--- | :---: | :--- |
| **Desktop** | 1440px &times; 900px | **PASS** | Full sidebar + 4-column statistics + split workspace |
| **Laptop** | 1024px &times; 768px | **PASS** | 2-column statistics grid, fluid spacing |
| **Tablet** | 768px &times; 1024px | **PASS** | Top navigation bar, responsive auth card |
| **Mobile** | 390px &times; 844px | **PASS** | Stacked controls, touch-friendly buttons (&ge; 44px) |
| **Small Mobile** | 320px &times; 568px | **PASS** | Compact header, zero horizontal scrollbar |

---

## OASIS Requirement Checklist

| # | Requirement | Status | Verification Detail |
| :-: | :--- | :-: | :--- |
| 1 | Input field + Add Task button | **PASS** | Validated, trim whitespace, duplicate prevention |
| 2 | New tasks appear in Pending | **PASS** | Instantly prepended to Pending list with timestamps |
| 3 | Mark Complete works | **PASS** | Line-through, muted style, moves to Completed list |
| 4 | Edit task works | **PASS** | Inline editing with Save/Cancel, input validation |
| 5 | Delete task works | **PASS** | Custom confirmation modal, permanent removal |
| 6 | Pending and Completed lists exist | **PASS** | Dedicated sections with dynamic header counters |
| 7 | Pending task count works | **PASS** | Dynamically updated in header, stats, and sidebar |
| 8 | Completed task count works | **PASS** | Dynamically updated in header, stats, and sidebar |
| 9 | Empty-state messages exist | **PASS** | Distinct empty states for Pending, Completed, Search |
| 10 | Timestamps implemented | **PASS** | Formatted creation and completion timestamps |
| 11 | LocalStorage implemented | **PASS** | Users, session, and tasks persist on reload |
| 12 | Frontend Authentication | **PASS** | Sign in, register, logout, session guard, user isolation |

---

## Author

**Mohamed Rasith M**  
OASIS INFOBYTE SIP — Web Development & Designing Intern
