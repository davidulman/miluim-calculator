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
          המחשבון מבוסס על מתווה אוניברסיטת חיפה לשנת תשפ&quot;ו והנחיות המל&quot;ג, ומתמקד
          בתואר ראשון.
        </p>
        <p>
          הזכאות בפועל עשויה להשתנות בהתאם לנסיבות האישיות ולמדיניות המעודכנת של
          המוסד. לקבלת מידע מחייב יש לפנות לרכז/ת המילואים בחוג או לדקאנט
          הסטודנטים.
        </p>
        <p className="pt-2 text-xs text-slate-400">
          פותח במסגרת הקליניקה לסייבר · הפקולטה למשפטים · אוניברסיטת חיפה.
        </p>
      </div>
    </section>
  );
}
