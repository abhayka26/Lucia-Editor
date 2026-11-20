const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const isDevelopment = !app.isPackaged;
function createWindow() {
 const window = new BrowserWindow({width:1600,height:980,minWidth:1100,minHeight:700,backgroundColor:"#111318",title:"Premiere Studio",webPreferences:{preload:path.join(__dirname,"preload.cjs"),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
 window.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith("https://"))shell.openExternal(url);return{action:"deny"};});
 if(isDevelopment)window.loadURL("http://127.0.0.1:5173");else window.loadFile(path.join(__dirname,"../web/dist/index.html"));
}
app.whenReady().then(()=>{createWindow();app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});