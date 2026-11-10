import Tracking from './tracking';
import Calculator from './calculator';
import TechStack from './stack';
import { card, cardTitle } from '../ui';

export default function Home() {
  return (
    <>
      <div className={card}>
        <section className="text-center">
          <h2 className={cardTitle}>Про застосунок</h2>
          <p className="mt-5 mb-[25px] text-[1.2rem]">
            PostProject — кросплатформений застосунок у сфері поштової достави/логістики, який працює у браузері на системах ПК: Windows, Linux, MacOS. На системах мобільних пристроїв: Android, iOS, iPadOS.
          </p>
        </section>
      </div>
      <div className={card}>
        <section aria-labelledby="features-title">
          <h2 id="features-title" className="mb-5 border-b-2 border-ink pb-2.5 text-2xl font-bold">Основні функції застосунку</h2>
          <ul className="my-4 space-y-[15px] text-[1.1rem]">
            <li className="pl-7.5"><strong>Відстеження посилки:</strong> дізнавайтесь статус та історію переміщення посилки за номером накладної.</li>
            <li className="pl-7.5"><strong>Створення електронної накладної:</strong> оформлюйте відправлення вдома без черг.</li>
            <li className="pl-7.5"><strong>Калькулятор вартості доставки:</strong> легко та просто розраховуйте вартість доставки до дверей.</li>
            <li className="pl-7.5"><strong>Орієнтовані дні доставки:</strong> разом з калькулятором прораховуйте коли буде у вас посилка.</li>
            <li className="pl-7.5"><strong>Особистий кабінет:</strong> переглядайте історію своїх відправлень.</li>
          </ul>
        </section>
      </div>
      <div className={card}>
        <section>
          <h2 className={cardTitle}>Відстеження посилки</h2>
          <Tracking />
        </section>
      </div>
      <div className={card}>
        <section>
          <h2 className={cardTitle}>Калькулятор вартості доставки</h2>
          <Calculator />
        </section>
      </div>
      <div className={card}>
        <TechStack />
      </div>
    </>
  );
}
