CloudBase Voting Backend - Setup & Diagnostics

This file contains step-by-step commands and diagnostics to help you start the backend and resolve common "Access denied", "ECONNREFUSED" and MongoDB issues on Windows.

Prerequisites
- Node.js (>=16 recommended)
- npm
- MongoDB (either local `mongod` service or Atlas URI)

1) Quick start (local MongoDB)
Open a PowerShell terminal and run:

```powershell
cd "C:\Users\azeez\Desktop\CloudBased Voting System\backend"
npm install
# Start MongoDB as a Windows service if installed
# If MongoDB is a service:
# Start-Service MongoDB
# Or run mongod directly (keep terminal open):
# New-Item -ItemType Directory -Path 'C:\data\db' -Force
# mongod --dbpath "C:\data\db"

# Start the backend
npm start
```

2) Run diagnostic helper
If `npm start` fails or you see "Access denied", run the diagnostic script which checks Node/npm, file permissions, port availability, and MongoDB connectivity:

```powershell
cd "C:\Users\azeez\Desktop\CloudBased Voting System\backend"
npm run diagnose
```

The script prints helpful guidance and recommended commands.

3) Common fixes
- Access denied when running `npm start`:
  - Try running PowerShell as Administrator. Right-click PowerShell -> Run as Administrator.
  - Fix file ACL for the backend folder:
    ```powershell
    icacls "C:\Users\azeez\Desktop\CloudBased Voting System\backend" /grant %USERNAME%:RX /T
    ```
  - Unblock downloaded scripts if Windows blocked them:
    ```powershell
    Unblock-File .\server.js
    Unblock-File .\scripts\*.js
    ```

- MongoDB connection refused or not reachable:
  - If you use local MongoDB, ensure the `mongod` process is running.
  - To start `mongod` on Windows (simple dev setup):
    ```powershell
    New-Item -ItemType Directory -Path 'C:\data\db' -Force
    mongod --dbpath "C:\data\db"
    ```
  - If you use Atlas, set `MONGO_URI` in `backend/.env` to the Atlas connection string.

- Port 5000 in use:
  - Find the PID using the port:
    ```powershell
    netstat -ano | findstr :5000
    Get-Process -Id <PID>
    ```
  - Stop the conflicting process, or change `PORT` in `backend/.env`.

4) Logs & troubleshooting
- Capture server start logs to a file and paste them here if you need help:

```powershell
cd "C:\Users\azeez\Desktop\CloudBased Voting System\backend"
npm start 2>&1 | Tee-Object server-start.log
Get-Content .\server-start.log -Tail 200
```

5) Next steps after backend is up
- Run seeds (optional):

```powershell
npm run seed:admin
npm run seed:data
```

- Run the dashboard check script:

```powershell
npm run check:dashboards
```

If any of the above commands fail, copy the diagnostics output or the last 200 lines of `server-start.log` and paste them here; I'll continue troubleshooting with exact fixes.
