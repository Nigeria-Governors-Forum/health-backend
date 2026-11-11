const http = require('http');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Helper to make HTTP GET request
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

// Helper to make multipart POST upload
function uploadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const fileName = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    const postDataHeader = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
      `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`
    );
    const postDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);

    const payload = Buffer.concat([postDataHeader, fileContent, postDataFooter]);

    const urlObj = new URL(url);
    const req = http.request(
      {
        host: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function test() {
  console.log('🧪 Testing Health Facilities GET endpoint...');
  try {
    const getRes = await httpGet('http://localhost:7200/api/v1/health-facilities/Abia/2022');
    console.log('📡 GET /api/v1/health-facilities/Abia/2022 status:', getRes.statusCode);
    if (getRes.body && getRes.body.data) {
      console.log('   ✅ Total Health Facilities:', getRes.body.data.health_facilities);
      console.log('   ✅ Service Provision records:', getRes.body.data.service_provision ? getRes.body.data.service_provision.length : 0);
    }
  } catch (err) {
    console.log('⚠️ Could not connect to GET endpoint:', err.message);
  }

  console.log('\n🧪 Testing Excel Upload POST endpoint...');
  // Create a minimal test workbook with Health_Fac_Service_Provision
  const testWb = XLSX.utils.book_new();
  const testData = [
    {
      Zone: 'South East',
      State: 'Abia',
      Year: 2022,
      Page: 'Health Facilities',
      Service_Provision: 'Health Facilities Providing Antenatal Care (ANC)',
      Number: 918,
      Percentage: 0.7568,
    },
  ];
  const ws = XLSX.utils.json_to_sheet(testData);
  XLSX.utils.book_append_sheet(testWb, ws, 'Health_Fac_Service_Provision');
  const testFilePath = path.join(__dirname, 'test_upload_service_prov.xlsx');
  XLSX.writeFile(testWb, testFilePath);

  try {
    const uploadRes = await uploadFile('http://localhost:7200/api/v1/user/data/2022', testFilePath);
    console.log('📡 POST /api/v1/user/data/2022 status:', uploadRes.statusCode);
    console.log('   Response:', uploadRes.body);
  } catch (err) {
    console.log('⚠️ Could not connect to upload endpoint:', err.message);
  } finally {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  }
}

test();
