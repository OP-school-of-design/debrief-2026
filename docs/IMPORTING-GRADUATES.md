# Importing graduates from the form

Students fill in the Microsoft Form; the import turns every response into a graduate page in one go.
Pages arrive **Unpublished**: staff check each in the dashboard and tick **Published**.

## One-time setup on the in-house Mac

1. **Node.js:** download the LTS installer from nodejs.org and run it.
2. **Git:** open Terminal and type `git --version`. If macOS offers to install the developer tools, click Install.
3. **The repo:** in Terminal:
   ```
   cd ~
   git clone https://github.com/OP-school-of-design/debrief-2026.git
   cd debrief-2026
   npm ci
   ```
   Pushing needs a GitHub login on this Mac (GitHub Desktop, or a personal access token, as on your own Mac).

## Each import

Keep the downloaded Excel file and images **outside** the debrief-2026 folder (e.g. in Downloads), so
they're never pushed to GitHub: they hold students' names, OP email addresses and unpublished work.

1. **Download the answers:** in the form, **Responses** > **Open results in Excel**, then in Excel
   **File > Save a copy** (or Download) to the Downloads folder.
2. **Download the images:** in the Team, open **General > Files**, click **Documents** in the path, open
   **Apps > Microsoft Forms**, tick the form's folder and click **Download**. Double-click the .zip in
   Downloads to unpack it. (Or use **Add shortcut to OneDrive** on that folder and point the import at the
   synced folder in Finder; then there's nothing to download.)
3. **Check first** (writes nothing, just the report):
   ```
   cd ~/debrief-2026
   git pull
   npm ci
   npm run import -- --excel ~/Downloads/<results>.xlsx --files ~/Downloads/<unpacked folder> --check
   ```
   `npm ci` installs the import's tools; it only takes a moment when nothing has changed.
   Tip: type the start of the command, then drag the file or folder from Finder into Terminal to fill in
   its path.
4. **Read `import-report.md`** (in the debrief-2026 folder). It lists, for each student, anything to look
   at: missing images or descriptions, a programme that doesn't match, links that aren't web addresses,
   iPhone HEIC photos, portrait hero images, non-square card images...
5. **Import for real:** run the same command without `--check`.
6. **Push:**
   ```
   git add src/graduates
   git commit -m "Import graduates from the form"
   git push
   ```
   The first build after a big import takes longer (every new image is processed and uploaded); watch it
   under the repo's **Actions** tab.
7. **Check and publish** in the dashboard: open each graduate (the preview shows the whole page), fix
   anything the report flagged, tick **Published**, then Save > Ready > Publish as usual.

## Students who resubmit, and running it again

- If a student submits twice, the import uses their **latest** response.
- Running the import again skips graduates it already added. To refresh them from the form (e.g. after
  late changes), add `--replace`: it updates only graduates the import made and nobody has changed in the
  dashboard since (each imported page carries a fingerprint of its content in its `imported` field), so
  staff edits, including ticking Published, are never overwritten.
- A graduate whose folder already exists from the dashboard is never touched.

## What it does with the answers

| Form question | On the website |
| --- | --- |
| Full name | Name (and the folder name, e.g. `aria-te-rangi`) |
| Programme | Discipline: must match a Discipline's title or the dashboard's Discipline list |
| About you | About the graduate (each line becomes a paragraph) |
| Quote | Quote (curly quotation marks added if the student didn't type any) |
| Project name, Project description | Project |
| Hero image, Card image, Headshot (+ descriptions) | `hero.jpg`, `card.jpg`, `headshot.jpg` and their alt text. No headshot description: "Portrait of <name>". |
| Gallery images (+ descriptions) | `gallery-01.jpg`... in the order uploaded, paired with the description lines in order. A leading "01", "1." etc. is removed. |
| Public email, Website, Instagram, LinkedIn, Behance, Other links | Contact links. `https://` is added where missing; an Instagram or Behance handle becomes a full address; YouTube and Facebook links are recognised. |

Every page gets the **Profile first** layout and is **Unpublished**. Images are turned the right way up,
shrunk to at most 2500 px, saved as JPG (PNG when transparent) and stripped of hidden camera and GPS data.

If a question is renamed in the form, add the new title to `COLUMNS` at the top of
`scripts/import-graduates.mjs`. The import works out which file belongs to which answer from the links in
the Excel file, so the upload folders' names ("Question", "Question 1"...) don't matter.

Options: `--check` (report only) · `--replace` (refresh earlier imports) · `--publish` (import as Published,
e.g. for a rehearsal on a test copy).
