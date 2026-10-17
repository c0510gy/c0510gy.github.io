(() => {
  const byId = (id) => document.getElementById(id);

  function validateContent(data) {
    const requiredString = (value, name) => {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`${name} must be a nonempty string.`);
      }
    };
    if (!data || typeof data !== 'object' || !data.cv || !data.profile) {
      throw new Error('The content must contain cv and profile settings.');
    }
    requiredString(data.profile.name, 'profile.name');
    requiredString(data.cv.title, 'cv.title');
    requiredString(data.cv.googleDriveFileId, 'cv.googleDriveFileId');
    if (!/^[A-Za-z0-9_-]+$/.test(data.cv.googleDriveFileId)) {
      throw new Error('cv.googleDriveFileId must be a Google Drive file ID.');
    }
    if (data.cv.description != null) requiredString(data.cv.description, 'cv.description');
  }

  async function loadCV() {
    byId('cv-loading').hidden = false;
    byId('cv-error').hidden = true;
    byId('cv-page').hidden = true;
    try {
      const response = await fetch('content.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Content request failed (${response.status}).`);
      const data = await response.json();
      validateContent(data);
      const fileURL = `https://drive.google.com/file/d/${data.cv.googleDriveFileId}`;
      document.title = `${data.cv.title} · ${data.profile.name}`;
      document.querySelector('meta[name="description"]').setAttribute('content', data.cv.description || `${data.profile.name} — ${data.cv.title}`);
      byId('cv-profile-name').textContent = data.profile.name;
      byId('cv-title').textContent = data.cv.title;
      byId('cv-description').textContent = data.cv.description || '';
      byId('cv-description').hidden = !data.cv.description;
      byId('cv-source').href = `${fileURL}/view`;
      byId('cv-fallback').href = `${fileURL}/view`;
      byId('cv-frame').title = `${data.profile.name} — ${data.cv.title} PDF`;
      byId('cv-frame').src = `${fileURL}/preview`;
      byId('cv-page').hidden = false;
    } catch (error) {
      byId('cv-error').hidden = false;
      console.error('Unable to load CV content:', error);
    } finally {
      byId('cv-loading').hidden = true;
    }
  }

  byId('cv-retry').addEventListener('click', loadCV);
  loadCV();
})();
