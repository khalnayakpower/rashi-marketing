const main = document.getElementById('main');

if (!PDF_LIBRARY || PDF_LIBRARY.length === 0) {
    main.innerHTML = `
    <div class="empty">
      <div class="empty-icon">📂</div>
      <h2>No Documents Yet</h2>
      <p>Open <strong>pdfs.js</strong> and add your PDF files to get started.</p>
    </div>`;
} else {
    PDF_LIBRARY.forEach((pdf, i) => {
        const encodedFile = pdf.file.split('/').map(encodeURIComponent).join('/');

        const section = document.createElement('div');
        section.innerHTML = `
      <div class="pdf-section">
        <div class="pdf-label">
          <div class="pdf-label-title">
            <span class="pdf-num">${i + 1} of ${PDF_LIBRARY.length}</span>
            <h2 class="pdf-title">${esc(pdf.title)}</h2>
          </div>
          <div class="pdf-actions">
            <a class="pdf-btn" href="${encodedFile}" download="${esc(pdf.file.split('/').pop())}">⬇ Download</a>
            <a class="pdf-btn" href="${encodedFile}" target="_blank">↗ Open</a>
          </div>
        </div>
        <div class="pdf-embed-wrap">
          <iframe src="${encodedFile}" title="${esc(pdf.title)}"></iframe>
        </div>
      </div>
      ${i < PDF_LIBRARY.length - 1 ? '<div class="pdf-divider"></div>' : ''}
    `;
        main.appendChild(section);
    });
}

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
