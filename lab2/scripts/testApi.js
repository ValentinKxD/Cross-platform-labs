import { readFile, writeFile } from 'node:fs/promises';

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api/waybills`;
const LAST_FILE = new URL('../.last-waybill.json', import.meta.url);

async function request(method, url, body) {
  const options = { method, headers: {} };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  console.log(`\n### ${method} ${url}`);
  if (body) console.log('Request body:', JSON.stringify(body, null, 2));
  console.log(`\nResponse: HTTP ${res.status} ${res.statusText}`);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function lastId() {
  const { _id } = JSON.parse(await readFile(LAST_FILE, 'utf8'));
  return _id;
}

const newWaybill = {
  lastName: 'Качинський',
  firstName: 'Валентин',
  phone: '+380671234567',
  cityFrom: 'Київ',
  cityTo: 'Львів',
  weightKg: 2.5,
  distanceKm: 540,
  deliveryType: 'standard',
};

const updatedWaybill = {
  ...newWaybill,
  cityTo: 'Одеса',
  weightKg: 3,
  distanceKm: 475,
  deliveryType: 'express',
  status: 'in_transit',
};

const invalidWaybill = {
  lastName: '',
  firstName: 'Валентин',
  phone: '0671234567',
  cityFrom: 'Київ',
  cityTo: 'Київ',
  weightKg: -1,
};

const steps = {
  get: () => request('GET', BASE_URL),
  post: async () => {
    const created = await request('POST', BASE_URL, newWaybill);
    if (created?._id) await writeFile(LAST_FILE, JSON.stringify({ _id: created._id, trackingNumber: created.trackingNumber }));
    return created;
  },
  getById: async () => request('GET', `${BASE_URL}/${await lastId()}`),
  track: async () => {
    const { trackingNumber } = JSON.parse(await readFile(LAST_FILE, 'utf8'));
    return request('GET', `${BASE_URL}/track/${trackingNumber}`);
  },
  put: async () => request('PUT', `${BASE_URL}/${await lastId()}`, updatedWaybill),
  delete: async () => request('DELETE', `${BASE_URL}/${await lastId()}`),
  invalid: () => request('POST', BASE_URL, invalidWaybill),
  seed: async () => {
    const samples = [
      { lastName: 'Качинський', firstName: 'Валентин', phone: '+380671234567', cityFrom: 'Київ', cityTo: 'Львів', weightKg: 2.5, distanceKm: 540, deliveryType: 'standard' },
      { lastName: 'Шевченко', firstName: 'Тарас', phone: '+380501112233', cityFrom: 'Харків', cityTo: 'Одеса', weightKg: 1.2, distanceKm: 730, deliveryType: 'express' },
      { lastName: 'Коваль', firstName: 'Андрій', phone: '+380931234455', cityFrom: 'Дніпро', cityTo: 'Київ', weightKg: 7, distanceKm: 480, deliveryType: 'standard' },
    ];
    for (const sample of samples) await request('POST', BASE_URL, sample);
    return request('GET', BASE_URL);
  },
};

const step = process.argv[2] ?? 'all';

try {
  if (step === 'all') {
    for (const name of ['get', 'post', 'getById', 'track', 'put', 'delete', 'getById', 'invalid']) {
      await steps[name]();
    }
  } else if (steps[step]) {
    await steps[step]();
  } else {
    console.error(`Невідомий крок "${step}". Доступні: ${Object.keys(steps).join(', ')}, all`);
    process.exitCode = 1;
  }
} catch (error) {
  console.error('Не вдалося виконати запит. Чи запущено сервер (npm run dev)?', error.message);
  process.exitCode = 1;
}
