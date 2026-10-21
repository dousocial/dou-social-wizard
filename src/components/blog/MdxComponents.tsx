import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const mdxComponents: MDXRemoteProps["components"] = {
  h1: (props) => (
    <h1
      className="font-display text-ink mt-12 text-4xl leading-tight tracking-tight md:text-5xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="font-display text-ink mt-12 text-3xl leading-tight tracking-tight md:text-4xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="font-display text-ink mt-8 text-2xl leading-tight tracking-tight"
      {...props}
    />
  ),
  p: (props) => <p className="text-mute-700 mt-6 text-lg" {...props} />,
  ul: (props) => (
    <ul
      className="text-mute-700 mt-6 space-y-2 pl-6 text-lg [&>li]:list-disc"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="text-mute-700 mt-6 space-y-2 pl-6 text-lg [&>li]:list-decimal"
      {...props}
    />
  ),
  li: (props) => <li {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-accent text-mute-700 mt-8 border-l-2 pl-6 text-xl italic"
      {...props}
    />
  ),
  hr: () => <hr className="border-mute-200 mt-12" />,
  a: ({ href = "", children, ...rest }) => {
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline-offset-4 hover:underline"
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className="text-accent underline-offset-4 hover:underline"
      >
        {children}
      </Link>
    );
  },
  table: (props) => (
    <div
      className="border-mute-200 mt-8 max-w-full overflow-x-auto rounded-xl border"
      role="region"
      aria-label="Karşılaştırma tablosu"
      tabIndex={0}
    >
      <table
        className="w-full min-w-[32rem] border-collapse text-left text-sm"
        {...props}
      />
    </div>
  ),
  th: (props) => (
    <th
      className="border-mute-200 bg-mute-50 text-ink border-b p-4 font-semibold"
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="border-mute-100 text-mute-700 border-b p-4 align-top"
      {...props}
    />
  ),
  strong: (props) => <strong className="text-ink font-semibold" {...props} />,
  code: (props) => (
    <code
      className="bg-mute-100 text-ink rounded px-1.5 py-0.5 font-mono text-sm"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className={cn(
        "bg-ink text-paper mt-6 overflow-x-auto rounded-lg p-6 text-sm",
        "[&_code]:text-paper [&_code]:bg-transparent [&_code]:p-0"
      )}
      {...props}
    />
  ),
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      loading="lazy"
      decoding="async"
      className="mt-10 w-full rounded-xl"
      {...props}
    />
  ),
};
