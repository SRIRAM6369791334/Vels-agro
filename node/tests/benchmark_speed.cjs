const { request } = require('playwright');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:5000';

const calculateStats = (durations) => {
  durations.sort((a, b) => a - b);
  const min = durations[0].toFixed(2);
  const max = durations[durations.length - 1].toFixed(2);
  const avg = (durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(2);
  const p50 = durations[Math.floor(durations.length * 0.5)].toFixed(2);
  const p95 = durations[Math.floor(durations.length * 0.95)].toFixed(2);
  const p99 = durations[Math.floor(durations.length * 0.99)].toFixed(2);
  return { min, max, avg, p50, p95, p99 };
};

(async () => {
  console.log('\n===============================================================');
  console.log('⚡ API SPEED, LATENCY & THROUGHPUT BENCHMARK TEST (PLAYWRIGHT)');
  console.log('===============================================================\n');

  const api = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { 'Accept-Encoding': 'gzip, deflate, br' }
  });

  // 1. Get Auth Token
  const loginRes = await api.post('/api/v1/auth/admin/login', {
    data: { email: 'admin@velsagro.com', password: 'SuperAdmin@123' }
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  const results = [];

  // BENCHMARK 1: /api/health (Baseline HTTP Server Overhead)
  console.log('⏳ Running Benchmark 1: Health Check (100 sequential requests)...');
  const healthDurations = [];
  for (let i = 0; i < 100; i++) {
    const t0 = performance.now();
    const res = await api.get('/api/health');
    const t1 = performance.now();
    if (res.status() === 200) healthDurations.push(t1 - t0);
  }
  results.push({ name: 'GET /api/health', ...calculateStats(healthDurations) });

  // BENCHMARK 2: /api/v1/auth/me (Auth Middleware + Covering Index Lookup)
  console.log('⏳ Running Benchmark 2: Auth Verification via Covering Index (100 requests)...');
  const authDurations = [];
  for (let i = 0; i < 100; i++) {
    const t0 = performance.now();
    const res = await api.get('/api/v1/auth/me', { headers: authHeaders });
    const t1 = performance.now();
    if (res.status() === 200) authDurations.push(t1 - t0);
  }
  results.push({ name: 'GET /api/v1/auth/me (Covering Index)', ...calculateStats(authDurations) });

  // BENCHMARK 3: /api/v1/admin/roles (Complex Relational Join + Brotli Compression)
  console.log('⏳ Running Benchmark 3: Relational Query + Brotli Compression (100 requests)...');
  const rolesDurations = [];
  let compressedBytes = 0;
  for (let i = 0; i < 100; i++) {
    const t0 = performance.now();
    const res = await api.get('/api/v1/admin/roles', { headers: authHeaders });
    const t1 = performance.now();
    if (res.status() === 200) {
      rolesDurations.push(t1 - t0);
      if (i === 0) {
        const body = await res.body();
        compressedBytes = body.length;
      }
    }
  }
  results.push({ name: 'GET /api/v1/admin/roles (JOIN + Brotli)', ...calculateStats(rolesDurations) });

  // BENCHMARK 4: /api/v1/admin/dashboard-users (Paginated Query + Filter)
  console.log('⏳ Running Benchmark 4: Paginated Users Query (100 requests)...');
  const usersDurations = [];
  for (let i = 0; i < 100; i++) {
    const t0 = performance.now();
    const res = await api.get('/api/v1/admin/dashboard-users?limit=10', { headers: authHeaders });
    const t1 = performance.now();
    if (res.status() === 200) usersDurations.push(t1 - t0);
  }
  results.push({ name: 'GET /api/v1/admin/dashboard-users', ...calculateStats(usersDurations) });

  // BENCHMARK 5: Concurrency Burst Test (50 Parallel Requests all hitting at once)
  console.log('⏳ Running Benchmark 5: Concurrency Burst (50 Parallel Requests)...');
  const tBurst0 = performance.now();
  const burstPromises = Array.from({ length: 50 }).map(() =>
    api.get('/api/v1/auth/me', { headers: authHeaders })
  );
  const burstResponses = await Promise.all(burstPromises);
  const tBurst1 = performance.now();
  const burstSuccess = burstResponses.filter((r) => r.status() === 200).length;
  const burstTotalTime = (tBurst1 - tBurst0).toFixed(2);
  const throughputRps = ((50 / (tBurst1 - tBurst0)) * 1000).toFixed(0);

  console.log('\n===============================================================');
  console.log('📊 BENCHMARK RESULTS SUMMARY (Latency in Milliseconds)');
  console.log('===============================================================\n');
  console.table(results);

  console.log(`🚀 Concurrency Burst Results:`);
  console.log(`   - Parallel Requests: 50 concurrent calls`);
  console.log(`   - Successful (200 OK): ${burstSuccess} / 50`);
  console.log(`   - Total Batch Time: ${burstTotalTime} ms`);
  console.log(`   - Estimated Throughput: ~${throughputRps} requests/sec`);
  console.log(`   - Brotli Payload Size for /roles: ${compressedBytes} bytes (Compressed!)`);
  console.log('\n===============================================================\n');

  await api.dispose();
  process.exit(0);
})();
