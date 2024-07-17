// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, BrowserView, ipcMain, session, BaseWindow, webContents, WebContentsView } = require('electron')
const path = require('node:path')
let mainWindow;
let tabs = {};
let currentTab = null;
let urls = {};

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      // contextIsolation: true,
      // nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  // Share the session among all views
  // const ses = session.fromPartition('persist:my-session');

  // const mainWindow = new BaseWindow({ width: 800, height: 400 })
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  // mainWindow.loadURL('https://mail.cwp.pnp-hcl.com/verse');

  // const view1 = new WebContentsView()
  // mainWindow.contentView.addChildView(view1)
  // view1.webContents.loadURL('https://electronjs.org')
  // view1.setBounds({ x: 0, y: 0, width: 400, height: 400 })

  // const view2 = new WebContentsView()
  // mainWindow.contentView.addChildView(view2)
  // view2.webContents.loadURL('https://github.com/electron/electron')
  // view2.setBounds({ x: 400, y: 0, width: 400, height: 400 })
  
  // const contents = mainWindow.webContents
  // console.log(contents)
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Handle window creation from window.open
  // mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  //   // Create a new window for the URL
  //   const newWindow = new BrowserWindow({
  //     webPreferences: {
  //       preload: path.join(__dirname, 'preload.js'),
  //     },
  //   });
  //   console.log(`setWindowOpenHandler called, url: ${url}`);
  //   newWindow.loadURL(url);
  //   return { action: 'deny' }; // Prevent default behavior (default browser window)
  // });

  ipcMain.handle('create-tab', (event, url, tabId) => {
    if (!tabs[tabId]) {
      // const view = new BrowserView({
      //   webPreferences: {
      //     preload: path.join(__dirname, 'preload.js'),
      //     contextIsolation: true,
      //     nodeIntegration: false,
      //   }
      // });
      const view = new WebContentsView({
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
        },
        // webContents: new BrowserWindow({ show: false }).webContents,
      });
      view.webContents.setWindowOpenHandler(({ url }) => {
        // Create a new window for the URL
        const newWindow = new BrowserWindow({
          webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
          },
        });
        console.log(`setWindowOpenHandler called, url: ${url}`);
        newWindow.loadURL(url);
        return { action: 'deny' }; // Prevent default behavior (default browser window)
      });
      view.webContents.loadURL(url);
      tabs[tabId] = view;
      urls[tabId] = url;

      // Add the WebContentsViews to the main window
      // mainWindow.contentView.addChildView(view);

      if (!currentTab) {
        currentTab = tabId;
        // mainWindow.setBrowserView(view);
        const bounds = mainWindow.getContentBounds();
        view.setBounds({ x: 0, y: 110, width: bounds.width, height: bounds.height - 110 });
        // view.webContents.show();
        // mainWindow.contentView = view;
        mainWindow.contentView.addChildView(view);
      }
    }
  });

  ipcMain.handle('switch-tab', (event, tabId) => {
    if (tabs[tabId]) {
      // mainWindow.setBrowserView(tabs[tabId]);
      const bounds = mainWindow.getContentBounds();
      tabs[tabId].setBounds({ x: 0, y: 110, width: bounds.width, height: bounds.height - 110 });
      mainWindow.contentView.addChildView(tabs[tabId]);
      if (currentTab && currentTab !== tabId) {
        // mainWindow.removeBrowserView(tabs[currentTab]);
        mainWindow.contentView.removeChildView(tabs[currentTab]);
      }
      currentTab = tabId;
      if (tabs[tabId].webContents.getURL() !== urls[tabId]) {
        tabs[tabId].webContents.loadURL(urls[tabId]);
      }
      tabs[tabId].webContents.openDevTools();
    } else {
      console.error(`Tab with id ${tabId} does not exist`);
    }
  });

  mainWindow.on('resize', () => {
    if (currentTab && tabs[currentTab]) {
      // Adjust the view's bounds to match the window size
      const bounds = mainWindow.getContentBounds();
      tabs[currentTab].setBounds({ x: 0, y: 110, width: bounds.width, height: bounds.height - 110 });
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  
  ipcMain.on('load-url', (event, url) => {
    mainWindow.loadURL(url);
  });
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.