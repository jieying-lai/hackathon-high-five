# Talent Portal interview buddy

The Talent Portal now loads `/static/js/interview-buddy.js` and its stylesheet from `candidate.html`. Refresh the running workspace to see the character above Ask Lumi. Click it to open the interview room inside the workspace; no visitor download or installation is needed. Drag it with a mouse or touch, or move the focused button with arrow keys. Home resets its position.

The simulator is isolated in a same-origin iframe to avoid interfering with the portal's existing global styles and scripts. Only the authenticated `/api/cv/me` response supplies the current account's applications and optional skill prefill. An application selection copies its company and vacancy title into editable fields. Manual company and role entry works without an application. No application, CV, employer access or hiring record is changed.

Choose English or Chinese questions and feedback. Six role-based questions cover introductions, skill experience, a professional scenario, behavioral experience, motivation and candidate questions. Five role families have specific scenarios; custom job titles are retained and mapped to a family when possible. Unmatched roles use a generic scenario. The company name and pasted JD provide context; there is no company research or extraction of JD requirements.

Coaching is rule-based and explicitly identified in the room. It detects common skill-gap responses, brief answers and mentions of actions or outcomes, then offers a truthful editable response structure. It does not judge technical correctness or use a generative AI model. Bracketed placeholders must be filled with genuine experiences. There are no competence scores, hiring predictions, CV updates or employer sharing.

Answers remain in frame memory while the room is open. Closing the overlay unloads the room and clears its current practice; reopening always starts at the company/role setup page. Only buddy coordinates are stored in localStorage. Browser speech playback and optional browser speech recognition depend on platform support and permissions. Speech recognition may use the browser vendor's service. Text entry always remains available. Closing the room stops playback and recognition. Downloading notes is optional.

## Validation

- `node tests/interview-practice.test.cjs`: application prefill, language, six questions, skill-gap response, retry, recap, download, escaping and room close.
- `node tests/interview-buddy.test.cjs`: pointer drag versus activation, coordinates, keyboard movement/reset and same-origin/source checks.
- JavaScript syntax checks and `git diff --check` passed.
- Flask test-client check rendered the Talent Portal, served every room asset and confirmed `/api/cv/me` rejects unauthenticated access, using a temporary database.
- Windows Computer Use could not confidently determine Chrome's current URL and stopped before browser interaction. Desktop/mobile visual acceptance and microphone behavior remain unverified.

These repository edits affect the local website. An existing hosted copy requires the project's normal deployment/republish process.
