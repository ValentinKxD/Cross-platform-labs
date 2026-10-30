const REPO = 'https://github.com/ValentinKxD/Cross-platform-labs';

const LABS = [
  {
    number: 1,
    topic: 'Клієнтська частина PostProject: калькулятор вартості доставки та електронна накладна.',
    stack: 'React, TypeScript, Vite',
    files: [
      { name: 'Сайт застосунку', url: 'https://valentinkxd.github.io/PostProject/', note: 'Робоча версія на GitHub Pages' },
      { name: 'Репозиторій', url: 'https://github.com/ValentinKxD/PostProject', note: 'Вихідний код' },
    ],
    link: { text: 'PostProject', url: 'https://valentinkxd.github.io/PostProject/' },
  },
  {
    number: 2,
    topic: 'Серверна частина: REST API для електронних накладних.',
    stack: 'Node.js, Express, MongoDB (Mongoose)',
    folder: 'lab2',
    files: [
      { path: 'server.js', note: 'Точка входу, налаштування Express' },
      { path: 'routes/waybillRoutes.js', note: 'Маршрути /api/waybills' },
      { path: 'controllers/waybillController.js', note: 'Обробники CRUD-запитів' },
      { path: 'models/Waybill.js', note: 'Mongoose-модель накладної' },
      { path: 'middleware/validateWaybill.js', note: 'Валідація вхідних даних' },
      { path: 'services/pricing.js', note: 'Розрахунок вартості доставки' },
      { path: 'services/db.js', note: 'Підключення до MongoDB' },
      { path: 'requests.http', note: 'Приклади запитів' },
    ],
  },
  {
    number: 3,
    topic: 'GraphQL API засобами Apollo Server з JWT-автентифікацією.',
    stack: 'Node.js, Apollo Server, GraphQL, JWT',
    folder: 'lab3',
    files: [
      { path: 'index.js', note: 'Запуск Apollo Server' },
      { path: 'schema.js', note: 'GraphQL-схема (typeDefs)' },
      { path: 'resolvers.js', note: 'Резолвери запитів і мутацій' },
      { path: 'auth.js', note: 'JWT-автентифікація' },
      { path: 'validation.js', note: 'Валідація вхідних даних' },
      { path: 'pricing.js', note: 'Розрахунок вартості доставки' },
      { path: 'data.js', note: 'Дані в пам\'яті' },
      { path: 'requests.graphql', note: 'Приклади запитів' },
    ],
  },
];

function fileUrl(lab, file) {
  return file.url || `${REPO}/blob/main/${lab.folder}/${file.path}`;
}

function renderLab(lab) {
  const items = lab.files
    .map((f) => `<li><a href="${fileUrl(lab, f)}">${f.name || f.path}</a> – ${f.note}</li>`)
    .join('');
  const link = lab.link || { text: `До лабораторної роботи №${lab.number}`, url: `${REPO}/tree/main/${lab.folder}` };

  return `
    <section class="card-wrapper lab-card">
      <h2>Лабораторна робота №${lab.number}</h2>
      <p class="lab-topic">${lab.topic}<br><strong>Стек:</strong> ${lab.stack}</p>
      <ul class="features-list">${items}</ul>
      <div class="button-container">
        <a class="tracking-btn" href="${link.url}">${link.text}</a>
      </div>
    </section>`;
}

document.getElementById('labs').innerHTML = LABS.map(renderLab).join('');
