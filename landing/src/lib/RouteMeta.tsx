import { useLocation } from "react-router-dom"
import { metaFor, type RouteMeta as RouteMetaType } from "@/config/routesMeta"

interface Props {
  override?: Partial<RouteMetaType>
}

/**
 * React 19 native metadata hoisting — <title>/<meta>/<link> rendered
 * inside a component are automatically moved to document <head>.
 *
 * Usage: place <RouteMeta /> inside each Page component.
 * For client-side navigation (SPA), React updates head automatically.
 * For initial page load / social crawlers, see scripts/prerender.mjs.
 */
export function RouteMeta({ override }: Props = {}) {
  const { pathname } = useLocation()
  const base = metaFor(pathname)
  const meta = { ...base, ...override }

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={meta.canonical} />
      <meta property="og:type" content="website" />
      {meta.ogImage && <meta property="og:image" content={meta.ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {meta.ogImage && <meta name="twitter:image" content={meta.ogImage} />}

      {meta.noindex && <meta name="robots" content="noindex, nofollow" />}

      {meta.jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(meta.jsonLd) }}
        />
      )}
    </>
  )
}
