let files = window.initialFiles;
let speed = 1.2;
let ogSpeed = speed;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  createColumns();
  loadFiles();
});

// Create columns for HTML, CSS, JS
function createColumns() {
  if (!files) return;
  const container = document.getElementById('container');
  container.innerHTML = '';

  ['html', 'css', 'js'].forEach(type => {
    const column = document.createElement('div');
    column.className = 'scroll-column';

    const banner = document.createElement('div');
    banner.className = 'banner';
    const filenameSpan = document.createElement('span');
    filenameSpan.className = 'filename';
    filenameSpan.textContent = files[type][0].name;
    const filetypeSpan = document.createElement('span');
    filetypeSpan.className = 'filetype';
    filetypeSpan.id = type;
    filetypeSpan.textContent = type.toUpperCase();

    banner.appendChild(filenameSpan);
    banner.appendChild(filetypeSpan);
    column.appendChild(banner);

    files[type].forEach(file => {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.id = file.id;
      code.className = `language-${type}`;
      pre.appendChild(code);
      column.appendChild(pre);
    });

    container.appendChild(column);
  });
}

// Load files and populate code blocks
function loadFiles() {
  const promises = [];
  ['html', 'css', 'js'].forEach(type => {
    files[type].forEach(file => {
      promises.push(
        fetch(file.path)
          .then(res => res.text())
          .then(code => ({ id: file.id, code }))
          .catch(error => ({
            id: file.id,
            code: `<!-- Error: ${error.message} -->`
          }))
      );
    });
  });

  Promise.all(promises).then(results => {
    results.forEach(result => {
      const el = document.getElementById(result.id);
      if (!el) return;
      el.textContent = result.code;
      hljs.highlightElement(el);
    });
    startAutoScrollForAllColumns();
  });
}

// Start auto-scroll for all columns
function startAutoScrollForAllColumns() {
  ['html', 'css', 'js'].forEach((type, colIndex) => {
    const column = document.querySelector(`.scroll-column:nth-child(${colIndex + 1})`);
    const fileIds = files[type].map(f => f.id);
    const filenames = files[type].map(f => f.name);
    const filetypes = files[type].map(() => type.toUpperCase());
    startAutoScroll(column, fileIds, filenames, filetypes);
  });
}

// Auto-scroll animation
function startAutoScroll(column, fileIds, filenames, filetypes) {
  const elements = fileIds.map(id => document.getElementById(id));
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

// Keyboard controls for scroll speed
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    speed = e.shiftKey ? 20 : 10;
  } else if (e.key === "Shift" && speed === 10) {
    speed = 20;
  } else if (e.key === "ArrowUp") {
    speed = 0;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Shift" && speed === 20) {
    speed = 10;
  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    speed = ogSpeed;
  }
});
