#!/usr/bin/env node
/* Environment diagnostic script for backend
   Usage: node scripts/diagnoseEnv.js
   This script reports common issues: Node/npm versions, file permissions, port usage, MongoDB connectivity.
*/
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const net = require('net');

const serverFile = path.join(__dirname, '..', 'server.js');
console.log('\n--- CloudBase Voting Backend Diagnostic ---\n');

function checkNode() {
  console.log('Node version:', process.version);
  try {
    const npmv = execSync('npm -v', { encoding: 'utf8' }).trim();
    console.log('npm version:', npmv);
  } catch (err) {
    console.log('npm version: ERROR', err.message);
  }
}

function checkFilePermissions() {
  process.stdout.write('\nChecking backend files and permissions... ');
  try {
    fs.accessSync(serverFile, fs.constants.R_OK | fs.constants.X_OK);
    console.log('OK');
  } catch (err) {
    console.log('\nWARNING: Cannot access server.js or insufficient permissions.');
    console.log('Path:', serverFile);
    console.log('Error:', err.message);
    console.log('Try running PowerShell as administrator or run:');
    console.log('  icacls "' + path.dirname(serverFile) + '" /grant %USERNAME%:RX /T');
  }
}

function checkPort(port = 5000) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', function (err) {
        if (err.code === 'EADDRINUSE') {
          console.log(`\nPort ${port} is already in use (EADDRINUSE).`);
        } else if (err.code === 'EACCES') {
          console.log(`\nAccess denied when checking port ${port} (EACCES).`);
        } else {
          console.log('\nPort check error:', err.message);
        }
        resolve(false);
      })
      .once('listening', function () {
        tester.close();
        console.log(`\nPort ${port} is available.`);
        resolve(true);
      })
      .listen(port, '127.0.0.1');
  });
}

async function checkMongo() {
  console.log('\nChecking MongoDB connectivity...');
  const connectDB = require('../src/config/db');
  try {
    // connectDB logs and exits when failing; we call it and catch process.exit by monitoring mongoose state
    await connectDB();
    console.log('MongoDB: connected (diagnostic)');
    // disconnect mongoose
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  } catch (err) {
    console.log('MongoDB connection failed:', err.message || err);
    console.log('If Mongo is not running, start it (mongod) or verify MONGO_URI in backend/.env');
  }
}

async function run() {
  checkNode();
  checkFilePermissions();
  const portOk = await checkPort(process.env.PORT ? parseInt(process.env.PORT, 10) : 5000);
  if (!portOk) {
    console.log('If the backend should use this port, stop the conflicting process or change PORT in backend/.env');
  }

  await checkMongo();

  console.log('\nDiagnostic complete. Next steps:');
  console.log('- Ensure MongoDB is running (as a service or run mongod).');
  console.log('- Start backend from the backend folder: npm install && npm start');
  console.log('- If you see "Access denied" in PowerShell, try running an elevated PowerShell (Run as Administrator) or fix ACLs with icacls.');
  console.log('- If port is in use, find the PID (netstat -ano | findstr :5000) and stop it.');
  console.log('\n');
}

run();
