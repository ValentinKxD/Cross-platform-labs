const cardBase = 'w-full rounded-xl bg-card p-7.5 shadow-card max-sm:px-4 max-sm:py-5';

export const card = `${cardBase} max-w-[700px]`;

export const wideCard = `${cardBase} max-w-[800px]`;

export const cardTitle = 'mb-5 pb-2.5 text-2xl font-bold text-heading';

export const field = 'mb-5 flex flex-col gap-2';

export const input =
  'w-full rounded-md border border-line bg-surface px-[15px] py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-3 focus:ring-accent-soft aria-invalid:border-danger';

export const select =
  `${input} appearance-none bg-[linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)] bg-[position:calc(100%-20px)_50%,calc(100%-15px)_50%] bg-[size:5px_5px] bg-no-repeat pr-10`;

export const buttonRow = 'w-full text-center';

export const mainButton =
  'mb-5 w-3/4 cursor-pointer rounded-[5px] border-2 border-line bg-surface p-2.5 text-xl text-ink enabled:hover:border-accent disabled:cursor-not-allowed disabled:opacity-55 max-sm:w-full';

export const smallButton =
  'cursor-pointer whitespace-nowrap rounded-[5px] border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:border-accent';

export const linkButton = 'cursor-pointer text-[0.95rem] text-accent underline';

export const fieldError = 'text-sm text-danger';

export const errorList = 'mb-[15px] list-disc pl-5 text-sm text-danger';

export const hint = 'text-sm text-muted';

export const checkboxLabel = 'mb-5 flex cursor-pointer items-center gap-2';

export const checkbox = 'h-4 w-4 accent-accent';

export const resultBox = 'rounded-md border border-dashed border-accent bg-surface-soft';

export function statusBadge(status: string) {
  return status === 'received'
    ? 'inline-block whitespace-nowrap rounded-full border border-muted px-3 py-0.5 text-sm text-muted'
    : 'inline-block whitespace-nowrap rounded-full border border-accent px-3 py-0.5 text-sm text-accent';
}
