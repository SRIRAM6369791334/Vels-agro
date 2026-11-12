const { request } = require('playwright');

const BASE_URL = 'http://localhost:5000';

const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    throw new Error(msg);
  }
  console.log(`✅ PASSED: ${msg}`);
};

(async () => {
  console.log('\n=============================================================');
  console.log('🎭 RUNNING PLAYWRIGHT NEGATIVE & CHAOS API TEST SUITE');
  console.log('=============================================================\n');

  const api = await request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      'Accept-Encoding': 'gzip, deflate, br'
    }
  });

  try {
    // 1. Obtain Valid Superadmin Token
    console.log('--- Step 0: Logging in as Superadmin for Auth Token ---');
    const loginRes = await api.post('/api/v1/auth/admin/login', {
      data: { email: 'admin@velsagro.com', password: 'SuperAdmin@123' }
    });
    const loginData = await loginRes.json();
    assert(loginRes.status() === 200, 'Superadmin Login succeeds');
    const token = loginData.data.token;
    assert(!!token, 'Valid JWT Bearer token acquired');

    console.log('\n--- NEGATIVE TEST SUITE: VALIDATION & CHAOS ATTACKS ---');

    // TEST 1: Malformed JSON Payload (e.g. { "is_active": new })
    const resMalformed = await api.patch('/api/v1/admin/dashboard-users/4/status', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: '{"is_active": new}'
    });
    const jsonMalformed = await resMalformed.json();
    assert(resMalformed.status() === 400, 'Malformed JSON returns 400 Bad Request');
    assert(jsonMalformed.message.includes('Invalid JSON format'), 'Malformed JSON has clean message without stack traces');

    // TEST 2: Type Mismatch (String instead of Boolean in status)
    const resTypeMismatch = await api.patch('/api/v1/admin/dashboard-users/4/status', {
      headers: { Authorization: `Bearer ${token}` },
      data: { is_active: 'activate_now' }
    });
    const jsonTypeMismatch = await resTypeMismatch.json();
    assert(resTypeMismatch.status() === 400, 'String for boolean returns 400 Bad Request');
    assert(jsonTypeMismatch.errors && jsonTypeMismatch.errors[0].field === 'is_active', 'Zod specifies is_active field error');

    // TEST 3: Boundary Condition - Password too short (< 6 chars)
    const resShortPass = await api.post('/api/v1/admin/dashboard-users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        email: `short_pass_${Date.now()}@velsagro.com`,
        password: '123',
        first_name: 'Short',
        role_id: 1
      }
    });
    const jsonShortPass = await resShortPass.json();
    assert(resShortPass.status() === 400, 'Short password (< 6 chars) returns 400');
    assert(jsonShortPass.message.includes('6 characters'), 'Message states minimum 6 characters required');

    // TEST 4: Invalid Email Format
    const resBadEmail = await api.post('/api/v1/admin/dashboard-users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        email: 'invalid-email-address',
        password: 'SecurePassword@123',
        first_name: 'Bad',
        role_id: 1
      }
    });
    const jsonBadEmail = await resBadEmail.json();
    assert(resBadEmail.status() === 400, 'Malformed email string returns 400');
    assert(jsonBadEmail.message.includes('valid email address'), 'Message states valid email address required');

    // TEST 5: Mass Assignment / Parameter Pollution (.strict() block)
    const resMassAssign = await api.post('/api/v1/admin/dashboard-users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        email: `pollution_${Date.now()}@velsagro.com`,
        password: 'SecurePassword@123',
        first_name: 'Polluter',
        role_id: 1,
        is_super_admin: true, // Attack vector
        account_balance: 999999 // Attack vector
      }
    });
    const jsonMassAssign = await resMassAssign.json();
    assert(resMassAssign.status() === 400, 'Mass assignment attempt returns 400 Bad Request');
    assert(jsonMassAssign.message.includes('Unrecognized key'), 'Strict schema rejects unauthorized keys');

    // TEST 6: Non-Numeric ID in URL parameter (/dashboard-users/notanid/status)
    const resBadId = await api.patch('/api/v1/admin/dashboard-users/notanid/status', {
      headers: { Authorization: `Bearer ${token}` },
      data: { is_active: true }
    });
    const jsonBadId = await resBadId.json();
    assert(resBadId.status() === 400, 'String ID in URL parameter returns 400 Bad Request');
    assert(jsonBadId.message.includes('valid numeric integer'), 'URL param validator rejects non-numeric ID');

    // TEST 7: Tampered JWT Token (1 character modified in signature)
    const tamperedToken = token.slice(0, -4) + 'abcd';
    const resTampered = await api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${tamperedToken}` }
    });
    const jsonTampered = await resTampered.json();
    assert(resTampered.status() === 401, 'Tampered token returns 401 Unauthorized');
    assert(jsonTampered.message.includes('Invalid authentication token'), 'Tampered token rejected with security message');

    // TEST 8: Missing Bearer Prefix
    const resNoBearer = await api.get('/api/v1/auth/me', {
      headers: { Authorization: token }
    });
    assert(resNoBearer.status() === 401, 'Missing Bearer prefix returns 401 Unauthorized');

    // TEST 9: Empty JSON Request Body to Login
    const resEmptyLogin = await api.post('/api/v1/auth/admin/login', {
      data: {}
    });
    const jsonEmptyLogin = await resEmptyLogin.json();
    assert(resEmptyLogin.status() === 400, 'Empty login payload returns 400');
    assert(jsonEmptyLogin.errors.length >= 2, 'Catches both missing email and password');

    // TEST 10: Invalid Role ID Type (Passing array or string for integer role_id)
    const resBadRole = await api.post('/api/v1/admin/dashboard-users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        email: `badrole_${Date.now()}@velsagro.com`,
        password: 'ValidPassword@123',
        first_name: 'Tester',
        role_id: 'two'
      }
    });
    const jsonBadRole = await resBadRole.json();
    assert(resBadRole.status() === 400, 'String for role_id returns 400 Bad Request');
    assert(
      jsonBadRole.message.includes('expected number') || jsonBadRole.message.includes('number'),
      'Explains role_id must be a number'
    );

    // TEST 11: Compression Check (Gzip verification)
    const resCompression = await api.get('/api/v1/admin/roles', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const encoding = resCompression.headers()['content-encoding'];
    assert(encoding === 'gzip' || encoding === 'br', `Response compression active: [${encoding}]`);

    console.log('\n=============================================================');
    console.log('🎉 PLAYWRIGHT NEGATIVE & CHAOS SUITE PASSED ALL 11 TESTS (100%)');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('\n❌ Playwright Test Suite Encountered Failure:', err.message);
    process.exit(1);
  } finally {
    await api.dispose();
  }
})();
