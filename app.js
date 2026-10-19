(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const richText = value => escapeHTML(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const iconNames = new Set(['mail','scholar','linkedin','blog','github','download','user','research','paper','award','arrow','location']);
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-${iconNames.has(name) ? name : 'arrow'}"/></svg>`;

  function validateContent(data) {
    const fail = message => { throw new Error(`content.json: ${message}`); };
    const object = (value, name) => { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${name} must be an object`); };
    const array = (value, name) => { if (!Array.isArray(value)) fail(`${name} must be an array`); };
    const string = (value, name) => { if (typeof value !== 'string' || !value.trim()) fail(`${name} must be a non-empty string`); };
    const optionalString = (value, name) => { if (value != null) string(value, name); };
    const url = (value, name, email = false) => {
      string(value, name);
      if (/[\u0000-\u0020\\]/.test(value) || value.startsWith('//')) fail(`${name} must be a safe URL or relative file path`);
      const parsed = new URL(value, 'https://example.invalid/');
      if (!['https:','http:',...(email ? ['mailto:'] : [])].includes(parsed.protocol)) fail(`${name} has an unsupported URL protocol`);
    };
    object(data, 'root');
    if (data.schemaVersion !== 1) fail('schemaVersion must be 1');
    object(data.site, 'site');
    for (const key of ['title','description','publicationLabel','publicationNote']) string(data.site[key], `site.${key}`);
    url(data.site.url, 'site.url');
    object(data.site.sectionTitles, 'site.sectionTitles');
    for (const key of ['about','researchInterests','education','publications','honors']) string(data.site.sectionTitles[key], `site.sectionTitles.${key}`);
    object(data.profile, 'profile');
    const profile = data.profile;
    for (const key of ['name','role','affiliation','email']) string(profile[key], `profile.${key}`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) fail('profile.email must be an email address');
    for (const key of ['pronunciation','nativeName','nativeNameLanguage','lab','publicationAuthorName']) optionalString(profile[key], `profile.${key}`);
    if (profile.portrait != null) {
      object(profile.portrait, 'profile.portrait');
      url(profile.portrait.src, 'profile.portrait.src');
      string(profile.portrait.alt, 'profile.portrait.alt');
    }
    array(profile.links, 'profile.links');
    profile.links.forEach((link, i) => {
      const name = `profile.links[${i}]`;
      object(link, name); string(link.label, `${name}.label`); url(link.url, `${name}.url`, true);
      if (link.icon != null && !iconNames.has(link.icon)) fail(`${name}.icon is not a supported icon`);
      if (link.download != null && typeof link.download !== 'boolean') fail(`${name}.download must be true or false`);
    });
    for (const key of ['about','researchInterests']) {
      array(data[key], key); data[key].forEach((text, i) => string(text, `${key}[${i}]`));
    }
    array(data.education, 'education');
    data.education.forEach((entry, i) => {
      const name = `education[${i}]`; object(entry, name);
      for (const key of ['institution','degree','period']) string(entry[key], `${name}.${key}`);
      for (const key of ['gpa','majorGpa','distinction']) optionalString(entry[key], `${name}.${key}`);
      if (entry.highlights != null) { array(entry.highlights, `${name}.highlights`); entry.highlights.forEach((text, j) => string(text, `${name}.highlights[${j}]`)); }
    });
    array(data.publications, 'publications');
    data.publications.forEach((entry, i) => {
      const name = `publications[${i}]`; object(entry, name);
      for (const key of ['title','authors','venue']) string(entry[key], `${name}.${key}`);
      if (!['conference','journal','award','preprint'].includes(entry.type)) fail(`${name}.type must be conference, journal, award, or preprint`);
      if (entry.year != null && (!Number.isInteger(entry.year) || entry.year < 1)) fail(`${name}.year must be a positive integer`);
      if (entry.type !== 'preprint' && entry.year == null) fail(`${name}.year is required for a published paper`);
      for (const key of ['fullVenue','distinction','extraDetail']) optionalString(entry[key], `${name}.${key}`);
      if (entry.url != null) url(entry.url, `${name}.url`);
      for (const key of ['acceptanceRate','oralAcceptanceRate']) {
        if (entry[key] != null && (typeof entry[key] !== 'number' || !Number.isFinite(entry[key]) || entry[key] < 0 || entry[key] > 100)) fail(`${name}.${key} must be a number from 0 to 100`);
      }
      if (entry.equalContribution != null && typeof entry.equalContribution !== 'boolean') fail(`${name}.equalContribution must be true or false`);
    });
    array(data.honors, 'honors');
    data.honors.forEach((entry, i) => {
      const name = `honors[${i}]`; object(entry, name); string(entry.title, `${name}.title`);
      for (const key of ['period','description']) optionalString(entry[key], `${name}.${key}`);
    });
  }

  function renderPaper(p, authorName, number) {
    const publicationTypes = {conference: ['C', 'Conference publication'], journal: ['J', 'Journal publication'], award: ['A', 'Awarded paper']};
    const [prefix, typeLabel] = publicationTypes[p.type];
    const title = escapeHTML(p.title);
    const authors = authorName ? escapeHTML(p.authors).replace(new RegExp(`${escapeRegExp(escapeHTML(authorName))}\\*?`, 'g'), '<strong>$&</strong>') : escapeHTML(p.authors);
    const url = p.url ? escapeHTML(p.url) : null;
    const shortName = `<strong class="pub-venue-short">${escapeHTML(p.venue)}</strong>`;
    const fullName = p.fullVenue && p.fullVenue !== p.venue ? ` (<em class="pub-venue-full">${escapeHTML(p.fullVenue)}</em>)` : '';
    const details = [
      p.distinction ? `<span class="pub-distinction">${escapeHTML(p.distinction === 'Oral' ? 'Oral presentation' : p.distinction)}</span>` : '',
      p.acceptanceRate != null ? `<span class="pub-rate">Acceptance rate: ${escapeHTML(p.acceptanceRate)}%</span>` : '',
      p.oralAcceptanceRate != null ? `<span class="pub-rate pub-rate--oral">Oral acceptance rate: ${escapeHTML(p.oralAcceptanceRate)}%</span>` : '',
      url ? `<a class="paper-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Read ${title}">Paper ${icon('arrow')}</a>` : ''
    ].filter(Boolean).join('');
    return `<article class="publication"><span class="pub-number" aria-label="${typeLabel} ${number}">${prefix}${number}</span><div class="pub-content"><h3 class="pub-title">${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}</h3><p class="pub-authors">${authors}</p><p class="pub-venue">${shortName}${fullName} · <span class="pub-year">${escapeHTML(p.year)}</span></p>${details ? `<div class="pub-details">${details}</div>` : ''}${p.extraDetail ? `<p class="pub-extra">${escapeHTML(p.extraDetail)}</p>` : ''}</div></article>`;
  }

  function renderEducation(entry) {
    const scores = [
      entry.gpa ? `GPA: <strong class="gpa-score">${escapeHTML(entry.gpa)}</strong>` : '',
      entry.majorGpa ? `Major GPA: <strong class="gpa-score">${escapeHTML(entry.majorGpa)}</strong>` : ''
    ].filter(Boolean).join(' · ');
    const highlights = (entry.highlights || []).map(text => `<strong class="academic-highlight">${escapeHTML(text)}</strong>`).join(' · ');
    return `<article class="education-entry"><h3>${escapeHTML(entry.institution)}</h3><p>${escapeHTML(entry.degree)} <span class="inline-date">· ${escapeHTML(entry.period)}</span></p>${entry.distinction ? `<p class="detail"><strong class="academic-highlight">${escapeHTML(entry.distinction)}</strong></p>` : ''}${scores ? `<p class="detail">${scores}</p>` : ''}${highlights ? `<p class="detail">${highlights}</p>` : ''}</article>`;
  }

  function renderContent(data) {
    const {site, profile} = data;
    document.title = site.title;
    for (const [selector, value] of [
      ['meta[name="description"]', site.description], ['meta[property="og:title"]', site.title],
      ['meta[property="og:description"]', site.description], ['meta[property="og:url"]', site.url]
    ]) document.querySelector(selector).setAttribute('content', value);
    for (const [id, value] of [['profile-name',profile.name],['profile-role',profile.role],['profile-affiliation',profile.affiliation],['profile-lab',profile.lab || ''],['footer-name',profile.name]]) byId(id).textContent = value;
    byId('profile-name-variants').innerHTML = [
      profile.pronunciation ? `<span class="pronunciation" aria-label="Name pronunciation">[${escapeHTML(profile.pronunciation)}]</span>` : '',
      profile.nativeName ? `<span class="native-name"${profile.nativeNameLanguage ? ` lang="${escapeHTML(profile.nativeNameLanguage)}"` : ''}>${escapeHTML(profile.nativeName)}</span>` : ''
    ].filter(Boolean).join('');
    byId('profile-name-variants').hidden = !profile.pronunciation && !profile.nativeName;
    byId('profile-lab').hidden = !profile.lab;
    byId('profile-portrait').innerHTML = profile.portrait ? `<img src="${escapeHTML(profile.portrait.src)}" alt="${escapeHTML(profile.portrait.alt)}" width="900" height="1200" fetchpriority="high">` : '';
    byId('profile-portrait').hidden = !profile.portrait;
    byId('top').classList.toggle('no-portrait', !profile.portrait);
    byId('profile-links').innerHTML = profile.links.map(link => {
      const external = /^https?:/i.test(link.url);
      return `<a${link.download || link.url === 'cv.html' ? ' class="cv-link"' : ''}${link.download ? ' download' : ''} href="${escapeHTML(link.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(link.icon)}${escapeHTML(link.label)}</a>`;
    }).join('');
    for (const [id, key, symbol] of [['about-title','about','user'],['interests-title','researchInterests','research'],['education-title','education','scholar'],['publications-title','publications','paper'],['honors-title','honors','award']]) byId(id).innerHTML = icon(symbol) + escapeHTML(site.sectionTitles[key]);
    byId('about-content').innerHTML = data.about.map(text => `<p>${richText(text)}</p>`).join('');
    byId('interest-list').innerHTML = data.researchInterests.map(text => `<li>${escapeHTML(text)}</li>`).join('');
    byId('education-list').innerHTML = data.education.map(renderEducation).join('');
    const papers = data.publications.filter(p => p.type !== 'preprint').sort((a, b) => b.year - a.year);
    const remaining = papers.reduce((counts, paper) => {
      counts[paper.type] = (counts[paper.type] || 0) + 1;
      return counts;
    }, {});
    byId('publication-list').innerHTML = papers.map(p => renderPaper(p, profile.publicationAuthorName, remaining[p.type]--)).join('');
    byId('publication-summary').textContent = `${papers.length} ${site.publicationLabel}`;
    byId('publication-note').textContent = site.publicationNote;
    byId('honors-list').innerHTML = data.honors.map(entry => `<li><strong class="honor-title">${escapeHTML(entry.title)}</strong>${entry.period ? ` · ${escapeHTML(entry.period)}` : ''}${entry.description ? `<p class="honor-description">${richText(entry.description)}</p>` : ''}</li>`).join('');
    byId('footer-email').href = `mailto:${profile.email}`;
    byId('footer-email').innerHTML = icon('mail') + escapeHTML(profile.email);
    byId('copyright-year').textContent = new Date().getFullYear();
  }

  async function loadContent() {
    byId('content-error').hidden = true;
    byId('content-loading').hidden = false;
    try {
      const response = await fetch('content.json', {cache: 'no-store'});
      if (!response.ok) throw new Error(`Content request failed (${response.status})`);
      const data = await response.json();
      validateContent(data);
      renderContent(data);
      byId('profile-page').hidden = false;
    } catch (error) {
      byId('profile-page').hidden = true;
      byId('content-error').hidden = false;
      console.error('Unable to load academic profile:', error);
    } finally {
      byId('content-loading').hidden = true;
    }
  }
  byId('content-retry').addEventListener('click', loadContent);
  loadContent();
})();
