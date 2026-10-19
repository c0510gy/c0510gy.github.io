# Sanggeon Yun — Academic CV

A responsive academic website with About me, Research interests, Education, Publications, and Honors & awards, plus a dedicated CV page showing the Google Drive PDF. All editable profile content and CV settings live in **`content.json`**. No build step or JavaScript edits are needed to change the content.

## Update the website on GitHub

The site is published at [sanggeon.com](https://sanggeon.com/) from the `master` branch, using the repository root (`/`) as the GitHub Pages publishing source.

1. Open [content.json in the GitHub editor](https://github.com/c0510gy/c0510gy.github.io/edit/master/content.json).
2. Edit the relevant values, using the field guide below. Keep the JSON valid, including commas and quotation marks.
3. Choose **Commit changes** and save the change to `master`.
4. Check the repository’s [Actions page](https://github.com/c0510gy/c0510gy.github.io/actions) for the Pages deployment, then refresh the website after it succeeds.

Committing changes to the publishing branch updates the website automatically. There is no build command or separate upload step.

## Edit and preview locally

From a local checkout of this repository on `master`, fetch the latest changes before editing:

```sh
git pull --ff-only origin master
```

1. Open `content.json` in a text editor, change the relevant values, and save it.
2. From the repository root, check the JSON syntax:

   ```sh
   python3 -m json.tool content.json > /dev/null
   ```

3. Start a local server from the same directory:

   ```sh
   python3 -m http.server 4173 --bind 127.0.0.1
   ```

4. Open [the local preview](http://127.0.0.1:4173) and refresh after each edit. The page reads the JSON on every load. Use the HTTP preview; opening `index.html` directly as a file does not reliably allow the browser to load JSON.

The syntax check catches malformed JSON. The webpage also validates field types, required values, links, and rates. If the page shows a content-loading error, inspect the browser console for the field to fix, save the correction, and retry.

After checking the preview, review, commit, and push your changes:

```sh
git diff
git add content.json
git commit -m "Update academic CV"
git push origin master
```

Add any other files you intentionally edited to the `git add` command. Local edits become public after they are pushed and the GitHub Pages deployment succeeds. GitHub authentication and repository write access are required to push.

Keep `.nojekyll` in the repository root so the files are published directly. Keep `CNAME` set to `sanggeon.com` and `site.url` set to `https://sanggeon.com/` unless you are deliberately changing the domain. The Pages publishing source should remain **Deploy from a branch → master → /(root)**.

## Content fields

Keep `schemaVersion` set to `1` and preserve the top-level keys. Arrays can be empty, but must remain arrays. Education, honors, profile links, research interests, and About me paragraphs appear in their JSON order. Publications are sorted by descending year, preserving JSON order within each year.

| Key | What to edit |
| --- | --- |
| `site` | `title`, `description`, `url`, the five labels in `sectionTitles`, `publicationLabel` (currently “selected publications”), and `publicationNote` (currently “* Equal contribution”). The count itself is calculated automatically. |
| `profile` | Name, pronunciation, Korean name and language, role, affiliation, lab, email, portrait, profile links, and the author name to bold in publications. |
| `cv` | CV page title, introductory description, and the Google Drive PDF file ID. |
| `about` | One string per paragraph. Use `**text**` for bold. Other Markdown and HTML are not interpreted. |
| `researchInterests` | One string per compact interest label. |
| `education` | Institution, degree, period, GPAs, distinction, and academic highlights. |
| `publications` | One object per paper, including its authors, venue, year, links, and optional acceptance details. |
| `honors` | One object per award or achievement, with its title and optional period and description. Use `**text**` in descriptions to highlight competitiveness or award amounts. |

JSON uses double quotes, commas between entries, and no trailing commas or comments. Numbers and booleans are unquoted. Escape a double quote inside text as `\"`. Optional fields may be omitted or set to `null`; do not use an empty string for them. Required strings must be non-empty.

### Profile and links

`profile.name`, `role`, `affiliation`, `email`, and the `links` array are required. `pronunciation`, `nativeName`, `nativeNameLanguage`, `lab`, `publicationAuthorName`, and `portrait` are optional. Use `"nativeNameLanguage": "ko"` for Korean text. Set `portrait` to `null` to remove the photo, or supply both `src` and `alt`.

`profile.publicationAuthorName` is currently `"S. Yun"`. The renderer bolds matching text and an immediately following `*` in each author list. If the author format changes, update this value too. For equal contribution, put `*` directly after the relevant names in `authors`; `equalContribution` is retained as metadata and does not insert stars automatically.

Each profile link needs `label` and `url`; `icon` and the boolean `download` are optional. Supported icons are `mail`, `scholar`, `linkedin`, `blog`, `github`, `download`, `user`, `research`, `paper`, `award`, `arrow`, and `location`. An omitted icon uses an arrow. Links accept HTTPS, HTTP, and relative paths; profile links also accept `mailto:`. Use paths such as `assets/Sanggeon-Yun-CV.pdf` relative to the repository root. Update the Email link as well as `profile.email` when changing your address.

### Embedded CV

The profile's **CV** link opens `cv.html`, which displays the PDF through Google Drive's embedded viewer. The surrounding page uses the same fonts and styling as the academic profile. A direct **Open in Google Drive** link remains available if a browser cannot display the embedded viewer.

```json
"cv": {
  "title": "Curriculum vitae",
  "description": "View my full academic CV below.",
  "googleDriveFileId": "1LhoWyRC6YKXsxjudRj8PFXEN6aSUfwJE"
}
```

Use the file ID between `/d/` and `/view` in the Google Drive sharing URL. The page derives both the preview and direct-view URLs from this one value. `title` and `googleDriveFileId` are required; `description` may be omitted or set to `null`. The PDF's sharing settings must allow visitors to view it.

Replacing the PDF's contents in Google Drive while retaining the same file ID updates the embedded document without redeploying this website. If the file ID changes, update the JSON and commit the change to `master`. The no-JavaScript fallback links in `index.html` and `cv.html` are static, so update those too when changing the document. Editing the profile JSON does not edit the PDF itself.

Google Scholar remains a profile link. No citation snapshot, chart, or automatic citation fetching is implemented.

### Add or edit education

Copy an object inside `education`, separate entries with a comma, then change its values. `institution`, `degree`, and `period` are required. `gpa`, `majorGpa`, `distinction`, and `highlights` are optional; `highlights` is an array of strings.

```json
{
  "institution": "Kookmin University",
  "degree": "B.S. in Computer Science",
  "period": "2019–2023",
  "gpa": "4.49/4.5",
  "majorGpa": "4.5/4.5",
  "distinction": "Graduated with highest honors · Ranked 1st of 145",
  "highlights": ["Full-tuition merit scholarship"]
}
```

GPA values are automatically bold. Education distinctions and highlights use dark red. Honors & awards titles use bold black, even when the same award also appears under Education.

### Add a publication

Add an object inside `publications`. Publication labels are generated automatically; do not add an `id` or a number. This is a template to replace with the paper's actual details:

```json
{
  "title": "Your paper title",
  "authors": "S. Yun, A. Collaborator",
  "year": 2027,
  "venue": "VENUE",
  "fullVenue": "Full Conference or Journal Name",
  "type": "conference",
  "url": null,
  "equalContribution": false,
  "acceptanceRate": null,
  "oralAcceptanceRate": null,
  "extraDetail": null
}
```

`title`, `authors`, `venue`, and `type` are required. Published records also require a positive integer `year`. Supported types are `conference`, `journal`, `award`, and `preprint`. Records with `"type": "preprint"` are excluded from the page, publication count, and numbering. An accepted paper may still link to arXiv; its type determines whether it is shown.

The page sorts publications by descending year and preserves their JSON order within the same year. It then numbers each type from the bottom of the displayed list upward: `C1`, `C2`, … for conference papers, `J1`, `J2`, … for journal papers, and `A1`, `A2`, … for awarded papers. The bottommost paper of each type receives `1`; the topmost receives that type's highest number. Adding, removing, or reordering publications updates the labels automatically.

Use `venue` for the short name, or the complete name when no abbreviation is used, such as `IEEE Access`. It appears bold and blue. A different `fullVenue` appears in italic parentheses; omit it or repeat `venue` to avoid showing a second name.

Optional fields are `url`, `fullVenue`, `distinction`, `acceptanceRate`, `oralAcceptanceRate`, `equalContribution`, and `extraDetail`. Use `"distinction": "Oral"` to display the compact dark-red “Oral presentation” label. Rates are numbers from 0 to 100 without a percent sign: `25.7`, not `"25.7%"`. Missing or `null` rates are hidden. Use `extraDetail` for information such as an impact factor or award note. Omit `url` or set it to `null` when no paper link is available.

### Add an honor or award

Add an object inside `honors`. Only `title` is required; `period` and `description` may be omitted or `null`.

```json
{
  "title": "ICS Dean’s Recruitment Fellowship",
  "period": "2023",
  "description": "University of California, Irvine · **$20,000** fellowship"
}
```

Descriptions support `**text**` markup, as About me paragraphs do. Mark award amounts, percentages, rankings, or selection counts to display them in bold blue—for example, `**$20,000**`, `**top 10%**`, or `**1st of 145**`. Other Markdown and HTML are not interpreted. Award titles remain bold black.

## Files and sources

- `.nojekyll`: tells GitHub Pages to publish the static files directly.
- `CNAME`: retains the `sanggeon.com` custom domain.
- `content.json`: editable content and publication data.
- `index.html`: page structure, icon definitions, and loading/error states.
- `app.js`: content loading, validation, and rendering.
- `cv.html`, `cv.js`, `cv.css`: embedded Google Drive CV page, loading/error states, and responsive viewer styling.
- `styles.css`: typography, black body text, blue venue names and award metrics, dark-red education and oral highlights, responsive layout, and print styling.
- `assets/Sanggeon-Yun-CV.pdf`: the original local CV archive; the website's CV link now opens the Google Drive viewer.
- `assets/profile.webp`: optimized portrait sourced from the author’s previous website. Only orientation, size, and encoding were adjusted; portrait framing is CSS.
- `assets/fonts/`: locally hosted Lora and Source Sans 3 fonts, with their SIL Open Font License notices.

Publication data comes from the supplied September 2026 CV: 29 non-preprint records (21 conference papers, 7 journal papers, and 1 awarded paper), including 17 supplied acceptance rates and 2 oral acceptance rates. Missing rates are omitted. The source's repeated M. Imani in NeuroHash, TaskCLIP's ECCV 2025 Workshop entry, and the 2024 date on KDD 2025 Outstanding Reviewer are preserved for the author to review.

The archived local PDF remains unchanged and includes additional experience, service, teaching, projects, technical skills, and preprints. Its BIASLab undergraduate internship end date has a source typo; the author confirmed July 2023. The embedded CV uses the separately maintained Google Drive document.
