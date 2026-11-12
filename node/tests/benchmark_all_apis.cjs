const { request } = require('playwright');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:5000';

const calculateStats = (durations) => {
  if (durations.length === 0) return { min: '0', max: '0', avg: '0', p50: '0', p95: '0' };
  durations.sort((a, b) => a - b);
  const min = durations[0].toFixed(2);
  const max = durations[durations.length - 1].toFixed(2);
  const avg = (durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(2);
  const p50 = durations[Math.floor(durations.length * 0.5)].toFixed(2);
  const p95 = durations[Math.floor(durations.length * 0.95)].toFixed(2);
  return { min, max, avg, p50, p95 };
};

(async () => {
  console.log('\n========================================================================');
  console.log('⚡ FULL SPECTRUM BENCHMARK: MEASURING ALL 19 API ENDPOINTS (PLAYWRIGHT)');
  console.log('========================================================================\n');

  const api = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { 'Accept-Encoding': 'gzip, deflate, br' }
  });

  const allBenchmarkResults = [];
  const ITERATIONS = 30; // 30 samples per endpoint for statistically solid metrics

  // Helper to run benchmark on an endpoint
  const bench = async (name, method, fn) => {
    process.stdout.write(`⏳ Benchmarking: ${method.padEnd(6)} ${name} (${ITERATIONS} requests)... `);
    const durations = [];
    let lastStatus = 200;

    for (let i = 0; i < ITERATIONS; i++) {
      const t0 = performance.now();
      const status = await fn(i);
      const t1 = performance.now();
      lastStatus = status;
      if (status === 200 || status === 201) {
        durations.push(t1 - t0);
      }
    }

    const stats = calculateStats(durations);
    console.log(`Avg: ${stats.avg} ms (p50: ${stats.p50} ms) [Status: ${lastStatus}]`);
    allBenchmarkResults.push({
      Method: method,
      Endpoint: name,
      ...stats,
      Samples: `${durations.length}/${ITERATIONS}`
    });
  };

  // 1. Initial Login to acquire Superadmin token
  let adminToken = '';
  const loginRes = await api.post('/api/v1/auth/admin/login', {
    data: { email: 'admin@velsagro.com', password: 'SuperAdmin@123' }
  });
  const loginData = await loginRes.json();
  adminToken = loginData.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Setup sample test user & test role for repeatable benchmarks
  let benchRoleId = 1;
  let benchUserId = 1;

  // Find or create a bench role
  const rolesListRes = await api.get('/api/v1/admin/roles', { headers: adminHeaders });
  const rolesListData = await rolesListRes.json();
  if (rolesListData.data && rolesListData.data.length > 0) {
    benchRoleId = rolesListData.data[0].id;
  }

  // Find or create a bench user
  const usersListRes = await api.get('/api/v1/admin/dashboard-users', { headers: adminHeaders });
  const usersListData = await usersListRes.json();
  if (usersListData.data && usersListData.data.length > 0) {
    benchUserId = usersListData.data[0].id;
  }

  // -------------------------------------------------------------
  // MODULE 1: Health & Base
  // -------------------------------------------------------------
  await bench('/api/health', 'GET', async () => {
    const res = await api.get('/api/health');
    return res.status();
  });

  // -------------------------------------------------------------
  // MODULE 2: Authentication & Sessions
  // -------------------------------------------------------------
  await bench('/api/v1/auth/admin/login', 'POST', async () => {
    const res = await api.post('/api/v1/auth/admin/login', {
      data: { email: 'admin@velsagro.com', password: 'SuperAdmin@123' }
    });
    return res.status();
  });

  await bench('/api/v1/auth/me', 'GET', async () => {
    const res = await api.get('/api/v1/auth/me', { headers: adminHeaders });
    return res.status();
  });

  // Setup staff user token for dashboard login benchmark
  const testStaffEmail = `bench_staff_${Date.now()}@velsagro.com`;
  const staffPass = 'StaffSecret@123';
  await api.post('/api/v1/admin/dashboard-users', {
    headers: adminHeaders,
    data: {
      email: testStaffEmail,
      password: staffPass,
      first_name: 'Bench',
      last_name: 'Staff',
      role_id: benchRoleId
    }
  });

  await bench('/api/v1/auth/dashboard/login', 'POST', async () => {
    const res = await api.post('/api/v1/auth/dashboard/login', {
      data: { email: testStaffEmail, password: staffPass }
    });
    return res.status();
  });

  // -------------------------------------------------------------
  // MODULE 3: Dashboard Users Management
  // -------------------------------------------------------------
  await bench('/api/v1/admin/dashboard-users', 'GET', async () => {
    const res = await api.get('/api/v1/admin/dashboard-users?page=1&limit=20', { headers: adminHeaders });
    return res.status();
  });

  await bench('/api/v1/admin/dashboard-users/:id', 'GET', async () => {
    const res = await api.get(`/api/v1/admin/dashboard-users/${benchUserId}`, { headers: adminHeaders });
    return res.status();
  });

  await bench('/api/v1/admin/dashboard-users', 'POST', async (i) => {
    const res = await api.post('/api/v1/admin/dashboard-users', {
      headers: adminHeaders,
      data: {
        email: `bench_user_${Date.now()}_${i}@velsagro.com`,
        password: 'Password@123',
        first_name: `User${i}`,
        role_id: benchRoleId
      }
    });
    return res.status();
  });

  await bench('/api/v1/admin/dashboard-users/:id', 'PUT', async (i) => {
    const res = await api.put(`/api/v1/admin/dashboard-users/${benchUserId}`, {
      headers: adminHeaders,
      data: {
        first_name: `UpdatedName_${i % 10}`,
        phone: '+91 9999900000'
      }
    });
    return res.status();
  });

  await bench('/api/v1/admin/dashboard-users/:id/reset-password', 'PATCH', async (i) => {
    const res = await api.patch(`/api/v1/admin/dashboard-users/${benchUserId}/reset-password`, {
      headers: adminHeaders,
      data: { new_password: `NewPassword_${i}@123` }
    });
    return res.status();
  });

  await bench('/api/v1/admin/dashboard-users/:id/status', 'PATCH', async (i) => {
    const res = await api.patch(`/api/v1/admin/dashboard-users/${benchUserId}/status`, {
      headers: adminHeaders,
      data: { is_active: i % 2 === 0 }
    });
    return res.status();
  });

  // -------------------------------------------------------------
  // MODULE 4: Roles & RBAC
  // -------------------------------------------------------------
  await bench('/api/v1/admin/roles', 'GET', async () => {
    const res = await api.get('/api/v1/admin/roles', { headers: adminHeaders });
    return res.status();
  });

  await bench('/api/v1/admin/roles/permissions', 'GET', async () => {
    const res = await api.get('/api/v1/admin/roles/permissions', { headers: adminHeaders });
    return res.status();
  });

  await bench('/api/v1/admin/roles/:id', 'GET', async () => {
    const res = await api.get(`/api/v1/admin/roles/${benchRoleId}`, { headers: adminHeaders });
    return res.status();
  });

  let createdRoleIdForBench = null;
  await bench('/api/v1/admin/roles', 'POST', async (i) => {
    const res = await api.post('/api/v1/admin/roles', {
      headers: adminHeaders,
      data: {
        name: `Bench Role ${Date.now()}_${i}`,
        description: 'Benchmark role created',
        permission_ids: [1, 2, 3]
      }
    });
    const d = await res.json();
    if (d.data?.id) createdRoleIdForBench = d.data.id;
    return res.status();
  });

  await bench('/api/v1/admin/roles/:id', 'PUT', async (i) => {
    const targetId = createdRoleIdForBench || benchRoleId;
    const res = await api.put(`/api/v1/admin/roles/${targetId}`, {
      headers: adminHeaders,
      data: {
        description: `Updated description ${i}`,
        permission_ids: [1, 2, 4]
      }
    });
    return res.status();
  });

  await bench('/api/v1/admin/roles/:id', 'DELETE', async (i) => {
    // Create a temporary role and delete it to test delete performance cleanly
    const tempRes = await api.post('/api/v1/admin/roles', {
      headers: adminHeaders,
      data: { name: `Temp Delete Role ${Date.now()}_${i}` }
    });
    const tempJson = await tempRes.json();
    const tempId = tempJson.data?.id;

    const res = await api.delete(`/api/v1/admin/roles/${tempId}`, { headers: adminHeaders });
    return res.status();
  });

  // -------------------------------------------------------------
  // MODULE 5: Audit Logs & Security Monitoring
  // -------------------------------------------------------------
  await bench('/api/v1/admin/audit-logs', 'GET', async () => {
    const res = await api.get('/api/v1/admin/audit-logs?page=1&limit=25', { headers: adminHeaders });
    return res.status();
  });

  await bench('/api/v1/admin/login-attempts', 'GET', async () => {
    const res = await api.get('/api/v1/admin/login-attempts?page=1&limit=25', { headers: adminHeaders });
    return res.status();
  });

  // -------------------------------------------------------------
  // MODULE 6: Session Invalidation / Logout
  // -------------------------------------------------------------
  await bench('/api/v1/auth/logout', 'POST', async () => {
    // Generate fresh session token and revoke it
    const tempLogin = await api.post('/api/v1/auth/admin/login', {
      data: { email: 'admin@velsagro.com', password: 'SuperAdmin@123' }
    });
    const tempTok = (await tempLogin.json()).data.token;
    const res = await api.post('/api/v1/auth/logout', {
      headers: { Authorization: `Bearer ${tempTok}` }
    });
    return res.status();
  });

  console.log('\n========================================================================');
  console.log('📊 COMPREHENSIVE BENCHMARK SCORECARD ACROSS ALL 19 ENDPOINTS');
  console.log('========================================================================\n');
  console.table(allBenchmarkResults);

  // Compute grand average
  const grandAvg = (
    allBenchmarkResults.reduce((acc, r) => acc + parseFloat(r.avg), 0) / allBenchmarkResults.length
  ).toFixed(2);
  const readAvg = (
    allBenchmarkResults.filter((r) => r.Method === 'GET').reduce((acc, r) => acc + parseFloat(r.avg), 0) /
    allBenchmarkResults.filter((r) => r.Method === 'GET').length
  ).toFixed(2);
  const writeAvg = (
    allBenchmarkResults.filter((r) => r.Method !== 'GET').reduce((acc, r) => acc + parseFloat(r.avg), 0) /
    allBenchmarkResults.filter((r) => r.Method !== 'GET').length
  ).toFixed(2);

  console.log(`🏆 OVERALL SYSTEM PERFORMANCE REPORT:`);
  console.log(`   - Total Endpoints Benchmarked: ${allBenchmarkResults.length}`);
  console.log(`   - Read Operations Average Latency (GET): ${readAvg} ms`);
  console.log(`   - Write Operations Average Latency (POST/PUT/PATCH/DELETE with Bcrypt/Audit): ${writeAvg} ms`);
  console.log(`   - Grand Average Latency Across Entire Suite: ${grandAvg} ms`);
  console.log('\n========================================================================\n');

  await api.dispose();
  process.exit(0);
})();
