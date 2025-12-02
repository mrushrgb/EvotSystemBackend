#!/usr/bin/env node
/* Quick check script: logs in as admin and voter, prints admin stats and voter elections
   Usage: node scripts/checkDashboards.js
   Requires axios (install with npm install)
*/
const axios = require('axios');
const { BASE_URL = 'http://localhost:5000' } = process.env;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const VOTER_EMAIL = process.env.VOTER_EMAIL || 'voter1@example.com';
const VOTER_PASSWORD = process.env.VOTER_PASSWORD || 'Voter@123';

const run = async () => {
  try {
    console.log('Logging in as admin...');
    const adminResp = await axios.post(`${BASE_URL}/api/auth/login`, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    const adminToken = adminResp.data.token;
    console.log('Admin token acquired (truncated):', adminToken?.slice(0, 20) + '...');

    console.log('\nCalling /api/admin/stats');
    const stats = await axios.get(`${BASE_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('Admin stats:', JSON.stringify(stats.data, null, 2));

    console.log('\nLogging in as voter...');
    const voterResp = await axios.post(`${BASE_URL}/api/auth/login`, { email: VOTER_EMAIL, password: VOTER_PASSWORD });
    const voterToken = voterResp.data.token;
    console.log('Voter token acquired (truncated):', voterToken?.slice(0, 20) + '...');

    console.log('\nCalling /api/user/elections?active=true');
    const elections = await axios.get(`${BASE_URL}/api/user/elections?active=true`, { headers: { Authorization: `Bearer ${voterToken}` } });
    console.log('Active elections for voter:', JSON.stringify(elections.data, null, 2));

    console.log('\nCheck complete');
    process.exit(0);
  } catch (err) {
    // Print as much diagnostic information as possible to troubleshoot failures
    console.error('checkDashboards error:');
    if (err.response) {
      console.error('  HTTP status:', err.response.status);
      console.error('  Response body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('  Error message:', err.message);
    }
    if (err.code) console.error('  Error code:', err.code);
    if (err.stack) console.error('  Stack:', err.stack.split('\n').slice(0,3).join('\n'));
    process.exit(1);
  }
};

run();
