import type { ReactNode } from 'react';
import { Info, Lightbulb, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

const kinds = {
  note: { icon: Info, bar: 'border-fd-primary/60', tint: 'text-fd-primary' },
  tip: { icon: Lightbulb, bar: 'border-fd-primary', tint: 'text-fd-primary' },
  warning: { icon: TriangleAlert, bar: 'border-warn', tint: 'text-warn' },
};

/** A side remark: a note, a tip, or a warning about a gotcha. */
export function Aside({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof kinds;
  title?: ReactNode;
  children: ReactNode;
}) {
  const kind = kinds[type];
  const Icon = kind.icon;
  return (
    <aside className={cn('my-7 border-l-2 py-1 pl-5', kind.bar)}>
      {title && (
        <p className="not-prose mb-1.5 flex items-center gap-2 font-semibold text-fd-foreground">
          <Icon aria-hidden className={cn('size-4 shrink-0', kind.tint)} />
          {title}
        </p>
      )}
      <div className="prose-no-margin text-[0.96875rem] text-fd-muted-foreground [&_strong]:text-fd-foreground">
        {children}
      </div>
    </aside>
  );
}
