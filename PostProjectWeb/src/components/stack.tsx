export default function TechStack() {
  return (
    <section>
      <h2 className="mb-[15px] text-2xl font-bold text-heading">Обраний стек технологій</h2>
      <p className="mb-5 leading-relaxed text-muted">
        Для розробки застосунку використано сучасні вебтехнології, що забезпечують високу швидкість роботи, типізацію та зручну підтримку коду. Застосунок працює у будь-якому сучасному браузері.
      </p>
<table className="w-full border-collapse overflow-hidden rounded border border-grid text-[0.95rem] [&_td]:border [&_td]:border-grid [&_td]:p-4 [&_td]:text-left [&_td]:text-ink [&_th]:border [&_th]:border-grid [&_th]:bg-thead [&_th]:p-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-thead-ink">
        <thead>
          <tr>
            <th>Компонент</th>
            <th>Технологія</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Фреймворк</td>
            <td>React</td>
          </tr>
          <tr>
            <td>Мова програмування</td>
            <td>TypeScript</td>
          </tr>
          <tr>
            <td>Оформлення</td>
            <td>Tailwind CSS</td>
          </tr>
          <tr>
            <td>Інструмент збірки</td>
            <td>Vite</td>
          </tr>
          <tr>
            <td>Платформа запуску</td>
            <td>Браузер / WebView</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
