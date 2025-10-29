let files = window.initialFiles;
let speed = 1.2;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  createColumns();
  loadFiles();
});

// Créer les colonnes
function createColumns() {
  const container = document.getElementById('container');
  container.innerHTML = '';

  // Colonne HTML
  const htmlColumn = document.createElement('div');
  htmlColumn.className = 'scroll-column';
  htmlColumn.innerHTML = `
  <div class="banner">
    <span class="filename">${files.html[0].name}</span>
    <span class="filetype" id="html">HTML</span>
  </div>
  ${files.html
    .map(
      (file) =>
        `<pre><code id="${file.id}" class="language-html"></code></pre>`
    )
    .join('')}
  `;
  container.appendChild(htmlColumn);

  // Colonne CSS
  const cssColumn = document.createElement('div');
  cssColumn.className = 'scroll-column';
  cssColumn.innerHTML = `
  <div class="banner">
    <span class="filename">${files.css[0].name}</span>
    <span class="filetype" id="css">CSS</span>
  </div>
  ${files.css
    .map(
      (file) =>
        `<pre><code id="${file.id}" class="language-css"></code></pre>`
    )
    .join('')}
  `;
  container.appendChild(cssColumn);

  // Colonne JS
  const jsColumn = document.createElement('div');
  jsColumn.className = 'scroll-column';
  jsColumn.innerHTML = `
  <div class="banner">
    <span class="filename">${files.js[0].name}</span>
    <span class="filetype" id="js">JavaScript</span>
  </div>
  ${files.js
    .map(
      (file) =>
        `<pre><code id="${file.id}" class="language-javascript"></code></pre>`
    )
    .join('')}
  `;
  container.appendChild(jsColumn);
}

// Charger les fichiers
function loadFiles() {
  const htmlPromises = files.html.map((file) =>
    fetch(file.path)
      .then((res) => res.text())
      .then((code) => ({ id: file.id, code }))
      .catch((error) => ({
        id: file.id,
        code: `<!-- Erreur: ${error.message} -->`,
      }))
  );

  const cssPromises = files.css.map((file) =>
    fetch(file.path)
      .then((res) => res.text())
      .then((code) => ({ id: file.id, code }))
      .catch((error) => ({
        id: file.id,
        code: `/* Erreur: ${error.message} */`,
      }))
  );

  const jsPromises = files.js.map((file) =>
    fetch(file.path)
      .then((res) => res.text())
      .then((code) => ({ id: file.id, code }))
      .catch((error) => ({
        id: file.id,
        code: `// Erreur: ${error.message}`,
      }))
  );

  Promise.all([...htmlPromises, ...cssPromises, ...jsPromises]).then((results) => {
    results.forEach((result) => {
      const el = document.getElementById(result.id);
      if (!el) return;
      el.textContent = result.code;
      hljs.highlightElement(el);
    });

    startAutoScroll(
      document.querySelector('.scroll-column:nth-child(1)'),
      files.html.map((f) => f.id),
      files.html.map((f) => f.name),
      files.html.map(() => 'HTML')
    );

    startAutoScroll(
      document.querySelector('.scroll-column:nth-child(2)'),
      files.css.map((f) => f.id),
      files.css.map((f) => f.name),
      files.css.map(() => 'CSS')
    );

    startAutoScroll(
      document.querySelector('.scroll-column:nth-child(3)'),
      files.js.map((f) => f.id),
      files.js.map((f) => f.name),
      files.js.map(() => 'JavaScript')
    );
  });
}

// Recharger uniquement les fichiers JS
function reloadJsFiles() {
  const jsPromises = files.js.map((file) =>
    fetch(file.path)
      .then((res) => res.text())
      .then((code) => ({ id: file.id, code }))
      .catch((error) => ({
        id: file.id,
        code: `// Erreur: ${error.message}`,
      }))
  );

  Promise.all(jsPromises).then((results) => {
    results.forEach((result) => {
      document.getElementById(result.id).textContent = result.code;
      hljs.highlightElement(document.getElementById(result.id));
    });
  });
}

// Animation de défilement
function startAutoScroll(column, fileIds, filenames, filetypes) {
  const elements = fileIds.map((id) => document.getElementById(id));
  const bannerFilename = column.querySelector('.filename');
  const bannerFiletype = column.querySelector('.filetype');
  let currentIndex = 0;
  let pos = 0;

  elements.forEach((el, i) => {
    el.style.display = i === 0 ? 'block' : 'none';
    el.style.top = '30px';
  });

  if (bannerFilename && bannerFiletype) {
    bannerFilename.textContent = filenames[currentIndex];
    bannerFiletype.textContent = filetypes[currentIndex];
  }

  function scroll() {
    const currentElement = elements[currentIndex];
    const currentHeight = currentElement.scrollHeight;
    const containerHeight = column.clientHeight - 30;
    pos += speed;

    if (pos >= currentHeight - containerHeight) {
      pos = 0;
      currentElement.style.top = '30px';

      if (elements.length > 1) {
        currentElement.style.display = 'none';
        const nextIndex = (currentIndex + 1) % elements.length;
        elements[nextIndex].style.display = 'block';
        currentIndex = nextIndex;

        if (bannerFilename && bannerFiletype) {
          bannerFilename.textContent = filenames[currentIndex];
          bannerFiletype.textContent = filetypes[currentIndex];
        }
      }
    } else {
      currentElement.style.top = `-${pos}px`;
    }

    requestAnimationFrame(scroll);
  }

  scroll();
}

let ogSpeed = speed;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    speed = e.shiftKey ? 20 : 10;
  } else if (e.key === "Shift" && speed === 10) {
    speed = 20; // press Shift while holding ArrowDown
  } else if (e.key === "ArrowUp") {
    speed = 0;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Shift" && speed === 20) {
    speed = 10; // release Shift, still holding ArrowDown
  } else if (e.key === "ArrowDown") {
    speed = ogSpeed; // release ArrowDown
  } else if (e.key === "ArrowUp") {
    speed = ogSpeed;
  }
});
