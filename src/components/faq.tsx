import { AccordionIcon } from "./accordion-icon";

export function Faq({ items, name = "faq" }: { items: { q: string; a: string }[]; name?: string }) {
  return (
    <div className="rule-t">
      {items.map((it, i) => (
        <details key={it.q} name={name} className="group rule-b" data-reveal style={{ "--d": `${i * 50}ms` } as React.CSSProperties}>
          <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 lg:py-6">
            <span className="t-h3 group-open:text-steel">{it.q}</span>
            <AccordionIcon />
          </summary>
          <div className="acc-body">
            <div>
              <p className="max-w-2xl pb-6 text-stone">{it.a}</p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
