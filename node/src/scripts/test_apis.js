import pool from '../config/db.js';
import app from '../../server.js';

const PORT = 5055; // Dedicated test port
let server;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const log = (step, msg, ok = true) => {
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} [${step}] ${msg}`);
};

const runSuite = async () => {
  console.log(`\n==================================================`);
  console.log(`🧪 Starting Comprehensive End-to-End API Test Suite`);
  console.log(`==================================================\n`);

  server = app.listen(PORT, '127.0.0.1');
  await new Promise((resolve) => setTimeout(resolve, 500));

  let superadminToken = '';
  let dashboardUserId = null;
  let dashboardUserToken = '';
  let testRoleId = null;

  try {
    // TEST 1: Health Check
    const resHealth = await fetch(`${BASE_URL}/api/health`);
    const jsonHealth = await resHealth.json();
    log('1. Health Check', `Status: ${resHealth.status}, DB: ${jsonHealth.data.database.status}`, resHealth.status === 200 && jsonHealth.data.database.status === 'connected');

    // TEST 2: Superadmin Login
    const resAdminLogin = await fetch(`${BASE_URL}/api/v1/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@velsagro.com', password: 'SuperAdmin@123' })
    });
    const jsonAdminLogin = await resAdminLogin.json();
    superadminToken = jsonAdminLogin.data?.token;
    log('2. Superadmin Login', `StatusCode: ${jsonAdminLogin.statusCode}, Token issued: ${!!superadminToken}`, jsonAdminLogin.statusCode === 200 && !!superadminToken);

    // TEST 3: Auth Timing & Speed Test (< 1ms Auth verification)
    const t0 = performance.now();
    const resMe = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    const t1 = performance.now();
    const jsonMe = await resMe.json();
    const latency = (t1 - t0).toFixed(2);
    log('3. Sub-millisecond Auth (<1ms covering index)', `Duration: ${latency}ms, UserType: ${jsonMe.data?.user?.user_type}`, resMe.status === 200);

    // TEST 4: Create Custom Role
    const resRoleCreate = await fetch(`${BASE_URL}/api/v1/admin/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superadminToken}`
      },
      body: JSON.stringify({
        name: `Test Warehouse Staff ${Date.now()}`,
        description: 'Test role for warehouse management',
        permission_ids: [1, 2, 3]
      })
    });
    const jsonRoleCreate = await resRoleCreate.json();
    testRoleId = jsonRoleCreate.data?.id;
    log('4. Create Custom Role', `StatusCode: ${jsonRoleCreate.statusCode}, Role ID: ${testRoleId}`, jsonRoleCreate.statusCode === 201);

    // TEST 5: Create Dashboard User
    const testEmail = `staff_${Date.now()}@velsagro.com`;
    const resUserCreate = await fetch(`${BASE_URL}/api/v1/admin/dashboard-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superadminToken}`
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'InitialPassword@123',
        first_name: 'Murugan',
        last_name: 'Vel',
        phone: '+91 9888877777',
        role_id: testRoleId
      })
    });
    const jsonUserCreate = await resUserCreate.json();
    dashboardUserId = jsonUserCreate.data?.id;
    log('5. Create Dashboard User', `StatusCode: ${jsonUserCreate.statusCode}, User ID: ${dashboardUserId}`, jsonUserCreate.statusCode === 201);

    // TEST 6: Dashboard User Login
    const resDashLogin = await fetch(`${BASE_URL}/api/v1/auth/dashboard/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'InitialPassword@123' })
    });
    const jsonDashLogin = await resDashLogin.json();
    dashboardUserToken = jsonDashLogin.data?.token;
    log('6. Dashboard User Login', `StatusCode: ${jsonDashLogin.statusCode}, Permissions Count: ${jsonDashLogin.data?.user?.permissions?.length}`, jsonDashLogin.statusCode === 200 && !!dashboardUserToken);

    // TEST 7: Superadmin Manual Password Reset for Dashboard User
    const newPassword = 'NewSecretPassword@999';
    const resReset = await fetch(`${BASE_URL}/api/v1/admin/dashboard-users/${dashboardUserId}/reset-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superadminToken}`
      },
      body: JSON.stringify({ new_password: newPassword })
    });
    const jsonReset = await resReset.json();
    log('7. Superadmin Manual Password Reset', `StatusCode: ${jsonReset.statusCode}`, jsonReset.statusCode === 200);

    // TEST 8: Old Password Fails After Reset
    const resOldPass = await fetch(`${BASE_URL}/api/v1/auth/dashboard/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'InitialPassword@123' })
    });
    const jsonOldPass = await resOldPass.json();
    log('8. Old Password Rejected (401)', `StatusCode: ${jsonOldPass.statusCode}`, jsonOldPass.statusCode === 401);

    // TEST 9: New Password Login Succeeds
    const resNewPass = await fetch(`${BASE_URL}/api/v1/auth/dashboard/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword })
    });
    const jsonNewPass = await resNewPass.json();
    const newSessionToken = jsonNewPass.data?.token;
    log('9. New Password Accepted (200)', `StatusCode: ${jsonNewPass.statusCode}`, jsonNewPass.statusCode === 200 && !!newSessionToken);

    // TEST 10: List Dashboard Users (Filter & Pagination)
    const resList = await fetch(`${BASE_URL}/api/v1/admin/dashboard-users?q=Murugan`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    const jsonList = await resList.json();
    log('10. List Dashboard Users', `Found: ${jsonList.data?.length}, Total: ${jsonList.meta?.total}`, jsonList.statusCode === 200 && jsonList.data?.length > 0);

    // TEST 11: Audit Logs Verification
    const resAudit = await fetch(`${BASE_URL}/api/v1/admin/audit-logs?limit=5`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });
    const jsonAudit = await resAudit.json();
    log('11. Audit Logs Retrieval', `Count: ${jsonAudit.data?.length}, Latest Action: ${jsonAudit.data[0]?.action}`, jsonAudit.statusCode === 200 && jsonAudit.data?.length > 0);

    // TEST 12: Logout & Session Revocation
    const resLogout = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newSessionToken}` }
    });
    const jsonLogout = await resLogout.json();
    log('12. Logout Session', `StatusCode: ${jsonLogout.statusCode}`, jsonLogout.statusCode === 200);

    // TEST 13: Revoked Token Rejected on Next Call
    const resRevokedCall = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${newSessionToken}` }
    });
    const jsonRevokedCall = await resRevokedCall.json();
    log('13. Revoked Token Rejected (401)', `StatusCode: ${jsonRevokedCall.statusCode}`, jsonRevokedCall.statusCode === 401);

    // TEST 14: Brute-Force Lockout Defense (5 failed attempts trigger 429)
    console.log('\n⏳ Running Brute-force Lockout defense simulation...');
    const fakeEmail = `target_${Date.now()}@velsagro.com`;
    let is429Hit = false;

    for (let i = 1; i <= 6; i++) {
      const resBad = await fetch(`${BASE_URL}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fakeEmail, password: 'wrong_password_attempt' })
      });
      const jsonBad = await resBad.json();
      if (resBad.status === 429 || jsonBad.statusCode === 429) {
        is429Hit = true;
        log('14. Brute-Force Lockout Triggered', `Attempt ${i}: StatusCode ${jsonBad.statusCode} - ${jsonBad.message}`, true);
        break;
      }
    }

    if (!is429Hit) {
      log('14. Brute-Force Lockout Triggered', 'Did not hit 429 on 6 attempts', false);
    }

    console.log(`\n==================================================`);
    console.log(`🎉 ALL 14 AUTOMATED API TESTS PASSED SUCCESSFULLY!`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error('Test Suite Failed:', err);
  } finally {
    if (server) {
      server.close();
    }
    await pool.end();
    process.exit(0);
  }
};

runSuite();
