// Послідовна перевірка GraphQL API (пункти 11.1-11.5) без браузера: npm run api:all
// Сервер має бути запущений (npm run dev).

const URL = `http://localhost:${process.env.PORT || 4001}/`;

async function gql(title, query, variables = {}, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(URL, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const body = await res.json();

  console.log(`\n### ${title}${token ? '  [Authorization: Bearer ...]' : ''}`);
  console.log(`HTTP ${res.status}`);
  console.log(JSON.stringify(body, null, 2));
  return body;
}

const email = `user${Date.now()}@example.com`;

const AUTH_FIELDS = 'token user { id name email }';

const waybillInput = {
  lastName: 'Качинський',
  firstName: 'Валентин',
  phone: '+380671234567',
  cityFrom: 'Київ',
  cityTo: 'Львів',
  weightKg: 2.5,
  distanceKm: 540,
  deliveryType: 'standard',
};

const CREATE = `mutation Create($input: WaybillInput!) {
  createWaybill(input: $input) { id trackingNumber cityFrom cityTo cost days status owner { name email } }
}`;

const registered = await gql(
  '11.1. register',
  `mutation($email: String!) { register(name: "Валентин Качинський", email: $email, password: "123456") { ${AUTH_FIELDS} } }`,
  { email }
);

await gql(
  'Повторна реєстрація з тим самим email',
  `mutation($email: String!) { register(name: "Інший", email: $email, password: "123456") { token } }`,
  { email }
);

const logged = await gql(
  '11.2. login',
  `mutation($email: String!) { login(email: $email, password: "123456") { ${AUTH_FIELDS} } }`,
  { email }
);
const token = logged.data?.login.token ?? registered.data?.register.token;

await gql('Вхід з неправильним паролем', `mutation($email: String!) { login(email: $email, password: "000000") { token } }`, { email });

await gql('11.3. me', '{ me { id name email } }', {}, token);

const created = await gql('11.4. createWaybill', CREATE, { input: waybillInput }, token);
const id = created.data?.createWaybill.id;
const trackingNumber = created.data?.createWaybill.trackingNumber;

await gql('waybills (публічний)', '{ waybills { id trackingNumber cityTo cost owner { name } } }');
await gql('trackWaybill (публічний)', 'query($n: String!) { trackWaybill(trackingNumber: $n) { trackingNumber status days } }', { n: trackingNumber });
await gql('myWaybills', '{ myWaybills { id trackingNumber cityTo status } }', {}, token);

await gql(
  'updateWaybill',
  'mutation($id: ID!, $input: WaybillInput!) { updateWaybill(id: $id, input: $input) { id cityTo cost days deliveryType status } }',
  { id, input: { ...waybillInput, cityTo: 'Одеса', weightKg: 3, distanceKm: 475, deliveryType: 'express', status: 'in_transit' } },
  token
);

await gql('11.5. me без токена', '{ me { id name } }');
await gql('11.5. createWaybill без токена', CREATE, { input: waybillInput });
await gql('11.5. createWaybill з неправильним токеном', CREATE, { input: waybillInput }, 'invalid.token.value');

await gql(
  'Валідація даних накладної',
  CREATE,
  { input: { ...waybillInput, lastName: '', phone: '0671234567', cityTo: 'Київ', weightKg: -1, distanceKm: 0 } },
  token
);

await gql('deleteWaybill', 'mutation($id: ID!) { deleteWaybill(id: $id) }', { id }, token);
await gql('deleteWaybill повторно (запис вже видалено)', 'mutation($id: ID!) { deleteWaybill(id: $id) }', { id }, token);
