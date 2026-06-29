'use client';

const LINKS = [
  {
    title: 'אוניברסיטת חיפה — דקאנט הסטודנטים',
    url: 'https://student.haifa.ac.il/',
    description: 'מידע רשמי ופנייה לרכז/ת המילואים בחוג',
  },
  {
    title: 'המל"ג — זכויות סטודנטים במילואים',
    url: 'https://che.org.il/',
    description: 'מתווה המל"ג הרשמי לשנת תשפ"ו',
  },
  {
    title: 'כל-זכות — סטודנטים במילואים',
    url: 'https://www.kolzchut.org.il/he/סטודנטים_במילואים',
    description: 'מדריך זכויות נגיש',
  },
  {
    title: 'אגף משאבי אנוש בצה"ל — שמ"פ',
    url: 'https://www.miluim.idf.il/',
    description:
      'אישורי שירות וסיוע שכר לימוד — שירות מזכה 23.10.2025–30.9.2026, לפחות 50 ימי שמ"פ',
  },
];

export default function LinksSection() {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <span aria-hidden>🔗</span>
        קישורים שימושיים
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-slate-200 border-r-4 border-r-primary-light bg-white p-4 transition hover:shadow-md"
          >
            <p className="font-semibold text-primary">{link.title} ↗</p>
            <p className="mt-0.5 text-sm text-slate-500">{link.description}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
