import { breadcrumbJsonLd, type Crumb } from "@/lib/jsonld"

interface Props {
  crumbs: Crumb[]
}

// Renders BreadcrumbList JSON-LD. React 19 hoists <script> tags into <head>
// automatically, so this component can be dropped anywhere in a page tree.
export function BreadcrumbScript({ crumbs }: Props) {
  const data = breadcrumbJsonLd(crumbs)
  if (!data) return null
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
