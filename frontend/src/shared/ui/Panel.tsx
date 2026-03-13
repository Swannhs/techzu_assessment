import { PropsWithChildren } from "react";

interface PanelProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  className?: string;
}

export function Panel({ title, subtitle, className, children }: PanelProps) {
  return (
    <section className={`panel ${className ?? ""}`}>
      <div className="mb-4">
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-moss/75">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
