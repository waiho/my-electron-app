// const information = document.getElementById('info')
// information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

const func = async () => {
  const response = await window.versions.ping()
  console.log(response) // prints out 'pong'
}

// func()

// const func2 = () => {
//   document.getElementById('loadUrlButton').addEventListener('click', () => {
//     const url = document.getElementById('urlInput').value;
//     if (url) {
//       window.electronAPI.loadURL(url);
//     }
//   });
//   global.onElectronChildTabUnload = window.electronAPI.onElectronChildTabUnload;
// };
// func2();

// document.getElementById('loadUrlButton').addEventListener('click', () => {
//   const url = document.getElementById('urlInput').value;
//   if (url) {
//     window.electronAPI.createTab(url, 'tab1');
//   }
// });

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    window.electronAPI.switchTab(tab.id);
  });
});

function initializeTabs() {
  window.electronAPI.createTab('https://mail.cwp.pnp-hcl.com/verse', 'tab1');
  window.electronAPI.createTab('https://electronjs.org', 'tab2');
  window.electronAPI.createTab('https://github.com/electron/electron', 'tab3');
  window.electronAPI.createTab('https://mail.cwp.pnp-hcl.com/verse#/calendar', 'tab4');
  window.electronAPI.switchTab('tab1');
}

// Initialize tabs on load
initializeTabs();