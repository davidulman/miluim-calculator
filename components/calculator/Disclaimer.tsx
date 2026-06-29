'use client';

export default function Disclaimer() {
  return (
    <section className="rounded-xl border-2 border-slate-200 bg-white p-6">
      <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
        <span aria-hidden>⚖️</span>
        הבהרה משפטית
      </h3>
      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <strong className="text-slate-800">
            המידע מוצג למטרות כלליות בלבד ואינו מהווה ייעוץ משפטי או התחייבות.
          </strong>
        </p>
        <p>
          יש לבחון את הזכאות בפועל על פי המסמכים הרשמיים. בכל מקרה של סתירה בין
          המחשבון לבין המסמכים הרשמיים — <strong className="text-slate-800">המסמכים
          הרשמיים גוברים</strong>.
        </p>
        <p>
          המחשבון מבוסס על המסמכים הבאים:
        </p>
        <ul className="mr-4 list-disc space-y-1 marker:text-slate-400">
          <li>
            מתווה לאומי ור&quot;ה / מל&quot;ג — תשפ&quot;ו, אוניברסיטת חיפה
            (עדכון 26.11.2025).
          </li>
          <li>
            הנחיות המל&quot;ג לזכויות סטודנטים בשירות מילואים.
          </li>
          <li>
            מדיניות התגמולים וההטבות של צה&quot;ל / מל&quot;ג לשנת 2026 (לעניין
            הסיוע בשכר לימוד).
          </li>
        </ul>
        <p>
          הזכאות בפועל עשויה להשתנות בהתאם לנסיבות האישיות ולמדיניות המעודכנת של
          המוסד. לקבלת מידע מחייב יש לפנות לרכז/ת המילואים בחוג או לדקאנט
          הסטודנטים.
        </p>
      </div>
    </section>
  );
}
