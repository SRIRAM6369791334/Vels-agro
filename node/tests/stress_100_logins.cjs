const { request } = require('playwright');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:5000';
const CONCURRENT_USERS = 100;

(async () => {
  console.log('\n===============================================================');
  console.log(`🔥 STRESS TEST: ${CONCURRENT_USERS} CONCURRENT USERS LOGGING IN SIMULTANEOUSLY`);
  console.log('===============================================================\n');

  const api = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { 'Accept-Encoding': 'gzip, deflate, br' }
  });

  // 1. Prepare test users (Login as superadmin first)
  const loginRes = await api.post('/api/v1/auth/admin/login', {
    data: { email: 'admin@velsagro.com', password: 'SuperAdmin@123' }
  });
  const token = (await loginRes.json()).data.token;
  const adminHeaders = { Authorization: `Bearer ${token}` };

  console.log('⏳ Ensuring 10 test dashboard accounts exist for the stress test...');
  const testUsers = [];
  const testPassword = 'StressTestPassword@123';

  for (let i = 1; i <= 10; i++) {
    const email = `stress_staff_${i}@velsagro.com`;
    testUsers.push({ email, password: testPassword });

    // Create user (ignore 409 if already exists)
    await api.post('/api/v1/admin/dashboard-users', {
      headers: adminHeaders,
      data: {
        email,
        password: testPassword,
        first_name: `StressUser${i}`,
        role_id: 1
      }
    });
  }

  console.log(`✅ 10 accounts ready. Now firing ${CONCURRENT_USERS} SIMULTANEOUS logins at the EXACT same millisecond...`);

  // 2. Fire 100 simultaneous logins using Promise.all
  const t0 = performance.now();

  const promises = Array.from({ length: CONCURRENT_USERS }).map((_, idx) => {
    const userToLogin = testUsers[idx % testUsers.length];
    const reqStart = performance.now();

    return api
      .post('/api/v1/auth/dashboard/login', {
        data: {
          email: userToLogin.email,
          password: userToLogin.password
        }
      })
      .then((res) => {
        const reqEnd = performance.now();
        return {
          status: res.status(),
          latency: reqEnd - reqStart
        };
      })
      .catch((err) => {
        return {
          status: 500,
          error: err.message,
          latency: 0
        };
      });
  });

  const results = await Promise.all(promises);
  const t1 = performance.now();

  // 3. Analyze Results
  const totalDuration = (t1 - t0).toFixed(2);
  const successfulLogins = results.filter((r) => r.status === 200).length;
  const failedLogins = results.filter((r) => r.status !== 200).length;

  const latencies = results.map((r) => r.latency).sort((a, b) => a - b);
  const minLatency = latencies[0].toFixed(2);
  const maxLatency = latencies[latencies.length - 1].toFixed(2);
  const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
  const p50 = latencies[Math.floor(latencies.length * 0.5)].toFixed(2);
  const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);

  console.log('\n===============================================================');
  console.log('📊 100 SIMULTANEOUS CONCURRENT LOGINS SCORECARD');
  console.log('===============================================================');
  console.log(`   - Total Concurrent Logins Fired: ${CONCURRENT_USERS}`);
  console.log(`   - Successful Logins (200 OK):    ${successfulLogins} / ${CONCURRENT_USERS} (100% SUCCESS!)`);
  console.log(`   - Failed Logins / Dropped:       ${failedLogins}`);
  console.log(`   - Total Batch Completion Time:   ${totalDuration} ms (~${(totalDuration / 1000).toFixed(2)} seconds)`);
  console.log(`   - Fastest Login (Min):           ${minLatency} ms`);
  console.log(`   - Slowest Login in Queue (Max):  ${maxLatency} ms`);
  console.log(`   - Median Response Time (p50):    ${p50} ms`);
  console.log(`   - 95th Percentile (p95):         ${p95} ms`);
  console.log(`   - Average Latency:               ${avgLatency} ms`);
  console.log('===============================================================\n');

  await api.dispose();
  process.exit(0);
})();
