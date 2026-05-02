// Mock backend-like data for notes/case studies
// Structure mirrors what a real database might return

export const notesIndex = [
  {
    slug: "building-scalable-apis",
    title: "Building Scalable APIs",
    date: "2025-08-09",
    thumbnail: "/background.png",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    sections: [
      { id: "intro", type: "heading", level: 1, text: "Introduction" },
      {
        id: "context",
        type: "text",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer bibendum lorem ut risus feugiat, a hendrerit mi gravida.",
      },
      {
        id: "thumb-photo",
        type: "photoHeader",
        image: "/foreground.png",
        overlayText: "Phase 1 — Research",
      },
      {
        id: "analysis",
        type: "heading",
        level: 2,
        text: "Architecture Analysis",
      },
      {
        id: "code-sample",
        type: "code",
        language: "javascript",
        code: "export async function handler(req, res) {\n  // Lorem ipsum code example\n  return res.json({ ok: true, message: 'Hello from scalable API' });\n}",
      },
      {
        id: "cta-demo",
        type: "button",
        label: "Watch Demo",
        url: "#",
      },
      {
        id: "image-1",
        type: "image",
        alt: "Lorem image",
        src: "/aaryan.png",
        caption: "Lorem ipsum dolor sit amet caption.",
      },
      {
        id: "video-1",
        type: "video",
        title: "Demo Video",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      { id: "conclusion", type: "heading", level: 1, text: "Conclusion" },
      {
        id: "closing",
        type: "text",
        content:
          "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
      },
    ],
  },
];

export function getNoteBySlug(slug) {
  // Simulate async fetch; in real app this would hit an API
  return new Promise((resolve) => {
    const note = notesIndex.find((n) => n.slug === slug);
    setTimeout(() => resolve(note || null), 200);
  });
}
