import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function groupBy<T, K extends string | number>(
  array: T[],
  property: (item: T) => K,
): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const key = property(item).toString();

      if (!acc[key]) {
        acc[key] = [];
      }

      // eslint-disable-next-line
      (acc[key] as T[]).push(item);

      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export function formatPercentage(num: number) {
  const formatted = Math.round(num * 100);
  return isNaN(formatted) ? 0 : formatted;
}

export function colorizeChart<T extends object>(arr: T[]) {
  return arr.map((el, i) => ({
    ...el,
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
  }));
}
