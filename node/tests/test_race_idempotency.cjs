const { request } = require('playwright');

(async () => {
  console.log('\n⚡ TESTING CONCURRENT RACE CONDITION & IDEMPOTENCY GUARD...');
  const api = await request.newContext({ baseURL: 'http://localhost:5000' });

  // 1. Login superadmin
  const loginRes = await api.post('/api/v1/auth/admin/login', {
    data: { email: 'admin@velsagro.com', password: 'SuperAdmin@123' }
  });
  const token = (await loginRes.json()).data.token;
  const headers = { Authorization: `Bearer ${token}` };

  const testEmail = `race_user_${Date.now()}@velsagro.com`;
  const payload = {
    email: testEmail,
    password: 'Password@123',
    first_name: 'RaceTest',
    role_id: 1
  };

  console.log(`Firing 2 IDENTICAL create requests at the exact same millisecond for ${testEmail}...`);

  // Fire 2 create requests simultaneously (simulating double click or race condition)
  const [res1, res2] = await Promise.all([
    api.post('/api/v1/admin/dashboard-users', { headers, data: payload }),
    api.post('/api/v1/admin/dashboard-users', { headers, data: payload })
  ]);

  const status1 = res1.status();
  const status2 = res2.status();
  const body1 = await res1.json();
  const body2 = await res2.json();

  console.log(`Request 1 Status: ${status1}`, body1.message);
  console.log(`Request 2 Status: ${status2}`, body2.message);

  // One must succeed (201) and the duplicate must be intercepted with 409 Conflict
  if ((status1 === 201 && status2 === 409) || (status1 === 409 && status2 === 201)) {
    console.log('✅ PASSED: Idempotency & Race Condition defense successfully stopped duplicate record creation!');
    process.exit(0);
  } else {
    console.error('❌ FAILED: Unexpected statuses:', status1, status2);
    process.exit(1);
  }
})();
