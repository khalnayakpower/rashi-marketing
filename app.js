const main = document.getElementById('main');

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function getPdfContent(file, title) {
  // Use PDF.js for all devices - renders PDFs in a canvas
  return `<div class="pdf-viewer" data-pdf="${esc(file)}" data-title="${esc(title)}"></div>`;
}

if (!PDF_LIBRARY || PDF_LIBRARY.length === 0) {
  main.innerHTML = `
    <div class="empty">
      <div class="empty-icon">📂</div>
      <h2>No Documents Yet</h2>
      <p>Open <strong>pdfs.js</strong> and add your PDF files to get started.</p>
    </div>`;
} else {
  PDF_LIBRARY.forEach((pdf, i) => {
    // Handle heading sections
    if (pdf.type === 'heading') {
      const section = document.createElement('div');
      section.innerHTML = `
        <div class="section-heading">
          <h1>${esc(pdf.title)}</h1>
        </div>
      `;
      main.appendChild(section);
      return;
    }

    // Handle external links (Google Drive, etc)
    if (pdf.isExternalLink) {
      const section = document.createElement('div');
      
      // For folder links, don't try to embed
      if (pdf.isFolder) {
        section.innerHTML = `
          <div class="pdf-section">
            <div class="pdf-label">
              <div class="pdf-label-title">
                <span class="pdf-num">${i + 1} of ${PDF_LIBRARY.length}</span>
                <h2 class="pdf-title">${esc(pdf.title)}</h2>
              </div>
              <div class="pdf-actions">
                <a class="pdf-btn" href="${pdf.file}" target="_blank">📁 Open Folder</a>
              </div>
            </div>
            <div class="pdf-embed-wrap folder-message">
              <p>📂 This is a Google Drive folder containing multiple documents. Click the button above to access all files.</p>
            </div>
          </div>
        `;
        main.appendChild(section);
        return;
      }
      
      // For document files, embed them
      let embedUrl = pdf.file;
      let downloadUrl = pdf.file;
      if (pdf.file.includes('drive.google.com/file/d/')) {
        const fileId = pdf.file.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
      
      section.innerHTML = `
        <div class="pdf-section">
          <div class="pdf-label">
            <div class="pdf-label-title">
              <span class="pdf-num">${i + 1} of ${PDF_LIBRARY.length}</span>
              <h2 class="pdf-title">${esc(pdf.title)}</h2>
            </div>
            <div class="pdf-actions">
              <a class="pdf-btn" href="${downloadUrl}" download>⬇ Download</a>
              <a class="pdf-btn" href="${pdf.file}" target="_blank">↗ Open</a>
            </div>
          </div>
          <div class="pdf-embed-wrap">
            <iframe src="${embedUrl}" class="google-drive-embed" allowfullscreen="" loading="lazy"></iframe>
          </div>
        </div>
      `;
      main.appendChild(section);
      return;
    }

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
          ${getPdfContent(pdf.file, pdf.title)}
        </div>
      </div>
      ${i < PDF_LIBRARY.length - 1 ? '<div class="pdf-divider"></div>' : ''}
    `;
    main.appendChild(section);
  });

  // Render all PDF viewers
  initPdfViewers();
}

// Initialize PDF viewers using PDF.js
async function initPdfViewers() {
  const viewers = document.querySelectorAll('.pdf-viewer');
  
  for (const viewer of viewers) {
    const pdfFile = viewer.getAttribute('data-pdf');
    const pdfTitle = viewer.getAttribute('data-title');
    
    try {
      const pdf = await pdfjsLib.getDocument(pdfFile).promise;
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page';
      viewer.appendChild(canvas);
      
      // Render first page
      await renderPage(pdf, canvas, 1);
      
      // Show page info
      if (pdf.numPages > 1) {
        const info = document.createElement('div');
        info.className = 'pdf-page-info';
        info.textContent = `Page 1 of ${pdf.numPages}`;
        viewer.appendChild(info);
      }
    } catch (error) {
      console.error(`Error loading PDF ${pdfFile}:`, error);
      viewer.innerHTML = `<div class="pdf-error">Error loading PDF</div>`;
    }
  }
}

async function renderPage(pdf, canvas, pageNum) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2 });
  const context = canvas.getContext('2d');
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');b
}
