# College Loop — College Event Management System (MERN)

Create and manage college events. Clubs organize events, students discover, save and register, the admin oversees everything.

Highlights: illustrated event posters (organizer uploads always take precedence), search / club / date-range / "open only" filters, student bookmarks (Saved events), optional registration capacity enforced on the server, a colour-coded calendar, role-based dashboards and a persistent light/dark theme.

## Stack
MongoDB + Mongoose · Express + Node · React (Vite) · JWT auth · bcrypt password hashing · Multer (poster upload)

## Run it

```bash
# 1) backend  (http://localhost:5000)
cd backend
npm install
cp .env.example .env     # then edit MONGO_URI, or set USE_MEMORY_DB=true to try it with no MongoDB installed
npm run seed             # skip if USE_MEMORY_DB=true (it seeds itself)
npm run dev

# 2) frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

## Demo accounts (created by the seed)
| Role | Email | Password |
|---|---|---|
| Admin | admin@college.edu | admin123 |
| Organizer (Technical Club) | technical@college.edu | organizer123 |
| Organizer (other clubs) | media@ / cultural@ / innovation@ / women@ / financial@ / film@college.edu | organizer123 |
| Student | student@college.edu | student123 |

Students can also self-register on the Register page.

## REST API
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | public (creates a student) |
| POST | /api/auth/login | public |
| GET | /api/events?search=&club=&when=upcoming\|past | any logged-in user |
| GET | /api/events/mine | student: registered events, organizer: club events |
| GET | /api/events/saved | student: bookmarked events |
| GET | /api/events/:id | any logged-in user |
| POST | /api/events | admin, organizer (multipart, `poster` file, optional `capacity`) |
| PUT | /api/events/:id | admin, owning organizer |
| DELETE | /api/events/:id | admin, owning organizer |
| POST / DELETE | /api/events/:id/register | student (register / cancel; rejected with 409 when the event is full) |
| POST / DELETE | /api/events/:id/save | student (bookmark / remove bookmark) |
| GET | /api/events/:id/participants | admin, owning organizer |
| GET | /api/clubs | public |
| POST / PUT / DELETE | /api/clubs[/:id] | admin |

## Structure
```
backend/   config/ models/ controllers/ routes/ middleware/ uploads/ seed.js server.js
frontend/  src/{components, pages, services, context, utils}
```

Posters are saved to `backend/uploads/` and only their URL path is stored in MongoDB.

Default event artwork lives in `frontend/public/posters/` (hand-made SVG illustrations, no photos of people): one poster per sample event plus one default per club for events created without an upload. The College Loop logo comes from `brand_assests/loopppp.png`; web-sized copies are in `frontend/public/brand/`.
