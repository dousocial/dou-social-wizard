import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const mdxComponents: MDXRemoteProps["components"] = {
  h1: (props) => (
    <h1
      className="mt-12 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-12 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 font-display text-2xl leading-tight tracking-tight text-ink"
      {...props}
    />
  ),
  p: (props) => <p className="mt-6 text-lg text-mute-700" {...props} />,
  ul: (props) => (
    <ul className="mt-6 space-y-2 pl-6 text-lg text-mute-700 [&>li]:list-disc" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-6 space-y-2 pl-6 text-lg text-mute-700 [&>li]:list-decimal" {...props} />
  ),
  li: (props) => <li {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-8 border-l-2 border-accent pl-6 text-xl italic text-mute-700"
      {...props}
    />
  ),
  hr: () => <hr className="mt-12 border-mute-200" />,
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
      <Link href={href} className="text-accent underline-offset-4 hover:underline">
        {children}
      </Link>
    );
  },
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  code: (props) => (
    <code
      className="rounded bg-mute-100 px-1.5 py-0.5 font-mono text-sm text-ink"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className={cn(
        "mt-6 overflow-x-auto rounded-lg bg-ink p-6 text-sm text-paper",
        "[&_code]:bg-transparent [&_code]:text-paper [&_code]:p-0"
      )}
      {...props}
    />
  ),
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img className="mt-8 w-full rounded-lg" {...props} />
  ),
};
