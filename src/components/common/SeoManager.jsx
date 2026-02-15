import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { notesIndex } from "../../data/notes";

const SITE_ORIGIN = "https://aaryanj.tech";
const DEFAULT_TITLE =
  "Aaryan Joharapurkar | Software Engineering & Business @ Ivey";
const DEFAULT_DESCRIPTION =
  "Aaryan Joharapurkar — Software Engineering & Business student at Ivey Business School. I build practical tools across web, data, and product.";

const ROUTE_META = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    indexable: true,
  },
  "/projects": {
    title: "Projects | Aaryan Joharapurkar",
    description:
      "Projects built by Aaryan Joharapurkar across software engineering, data, and product.",
    indexable: false,
  },
  "/about": {
    title: "About | Aaryan Joharapurkar",
    description:
      "About Aaryan Joharapurkar, a Software Engineering & Business student at Ivey Business School.",
    indexable: false,
  },
};

function normalizePathname(pathname = "/") {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function toCanonicalUrl(pathname) {
  const normalized = normalizePathname(pathname);
  return normalized === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${normalized}`;
}

function setOrCreateMeta(attribute, key, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(href) {
  let tag = document.head.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function getMetaForPath(pathname) {
  const normalized = normalizePathname(pathname);

  if (ROUTE_META[normalized]) {
    return ROUTE_META[normalized];
  }

  if (normalized.startsWith("/notes/")) {
    const slug = decodeURIComponent(normalized.replace("/notes/", ""));
    const note = notesIndex.find((item) => item.slug === slug);

    if (note) {
      return {
        title: `${note.title} | Aaryan Joharapurkar`,
        description: note.summary || DEFAULT_DESCRIPTION,
        indexable: false,
      };
    }
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    indexable: false,
  };
}

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const { title, description, indexable } = getMetaForPath(location.pathname);
    const canonical = toCanonicalUrl(location.pathname);

    document.title = title;
    setCanonical(canonical);
    setOrCreateMeta("name", "description", description);
    setOrCreateMeta(
      "name",
      "robots",
      indexable ? "index,follow" : "noindex,follow",
    );
    setOrCreateMeta("property", "og:title", title);
    setOrCreateMeta("property", "og:description", description);
    setOrCreateMeta("property", "og:url", canonical);
  }, [location.pathname]);

  return null;
}
