# Importing graduates from the form

Students fill in the Microsoft Form; the import turns every response into a graduate page in one go.
Pages arrive **Published**, so staff can review them on the site before launch. To hide one while it's
being fixed, untick **Published** in the dashboard.

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
7. **Review on the site.** Fix anything the report flagged, and anything else you spot, in the dashboard.
   To hide a page while it's being fixed, untick **Published**. During the launch period, switch the
   dashboard to publish straight away (see "Launch period" below) so fixes go live with one Save.

## Students who resubmit, and running it again

Students can correct their answers in two ways:

- **Editing in Forms** (the form allows saving and editing): after submitting they click **Save my
  response to edit**, then later go to forms.office.com › Filled forms › the form › **Edit response**.
  The Excel file then has their edited answers. (Forms can't replace an uploaded file this way.)
- **Submitting again** (needs **One response per person** switched off in the form's settings): they only
  fill in what they're changing, e.g. a corrected bio or one replacement image, and leave the rest
  blank. For this, every question except Full name and Programme must be optional in the form; the
  import report still flags anyone missing an answer or an image.

The import **combines** each student's submissions, oldest to newest by their time stamp ("Last
modified time" when edited in Forms, otherwise "Completion time"): each question takes the newest
answer that isn't blank. An image and its description go together, so a new upload brings its own
description (a blank one is flagged in the report), while a new description on its own updates the
earlier image's description. A blank answer never removes anything; to take something away, edit the
page in the dashboard. Submissions belong to the same student when they come from the same OP sign-in
and the names are the same or nearly so (a corrected spelling still counts), so staff can submit for
several students from their own account. The report says which submissions were combined, what the
newest one changed, and when a name was corrected (delete any page made under the old name).

- Running the import again skips graduates it already added. To bring in corrections, add `--replace`:
  it updates only graduates the import made and nobody has changed in the dashboard since (each
  imported page carries a fingerprint of its content in its `imported` field), so staff edits,
  including ticking Published, are never overwritten.
- A graduate whose folder already exists from the dashboard is never touched.

## What it does with the answers

| Form question | On the website |
| --- | --- |
| Full name | Name (and the folder name, e.g. `aria-te-rangi`) |
| Programme | Discipline: must match a Discipline's title or the dashboard's Discipline list |
| About you | About the graduate (each line becomes a paragraph) |
| Quote | Quote (curly quotation marks added if the student didn't type any) |
| Project name, Project description | Project |
| Hero image, Card image, Headshot (+ descriptions) | `hero.jpg`, `card.jpg`, `headshot.jpg` and their alt text (the hero's description is also shown as its caption). No headshot description: "Portrait of <name>". |
| Gallery images (+ descriptions) | `gallery-01.jpg`... in the order uploaded, paired with the description lines in order (each description is also shown as the image's caption). A leading "01", "1." etc. is removed. If every line is numbered, lines are paired by number, so a skipped number leaves that image without a description instead of shifting the rest. |
| Video, Video caption | A YouTube or Vimeo link shown under the hero image, with its caption. Anything else is left out and reported. Staff can put the video above the hero image in the dashboard ("Show the video above the hero image"). |
| Public email, Website, Instagram, LinkedIn, Behance, Other links | Contact links. `https://` is added where missing; an Instagram or Behance handle becomes a full address; YouTube and Facebook links are recognised. |

Every page gets the **Profile first** layout and is **Published**. Images are turned the right way up,
shrunk to at most 2500 px, saved as JPG (PNG when transparent; other formats such as WebP, GIF or TIFF are converted) and stripped of hidden camera and GPS data.

If a question is renamed in the form, add the new title to `COLUMNS` at the top of
`scripts/import-graduates.mjs`. The import works out which file belongs to which answer from the links in
the Excel file, so the upload folders' names ("Question", "Question 1"...) don't matter.

Options: `--check` (report only) · `--replace` (refresh earlier imports) · `--unpublished` (import as
Unpublished instead).

## Launch period: publishing straight away, and "Publish all drafts"

Normally every dashboard edit goes through Workflow (Save, In review, Ready, Publish). Around launch that's
slow, so there are two tools:

- **Publish all drafts** (GitHub): repo > **Actions** > **Publish all drafts** > **Run workflow**. It
  publishes every draft waiting in the dashboard's Workflow in one go (or only those at Ready, if you
  choose), then rebuilds the site. Anything it can't publish (e.g. two drafts changing the same file) is
  listed in the run's summary and left in Workflow.
- **Publish straight away** (dashboard): **Site settings > Dashboard > How Save works**. Choose
  “Publish straight away” and Save (this one change still goes through Workflow; publish it). After the site
  rebuilds (a few minutes), reload the dashboard: Save now makes changes live immediately and the
  Workflow page is gone. Switch back to “Approval steps” after launch.

  Before switching to “Publish straight away”, run **Publish all drafts** (or discard the drafts): drafts
  still waiting in Workflow are hidden from the dashboard while it's switched off.
