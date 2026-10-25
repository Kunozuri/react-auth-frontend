// ============================================================================
// dashboard page - a jasmine (sampaguita) garden. Only sign-out is functional.
// ============================================================================
//
// Save this as: src/app/(protected)/dashboard/page.tsx   (replaces the old one)
// Served at /dashboard. Only reachable when logged in (see layout.tsx).
//
// WHAT CHANGED IN THIS VERSION
//   The first version was styled with Tailwind classes. In your project, classes
//   that only appear in a NEW file have not been generated (the same problem the
//   sign-up form had), which scrambles a page made of hundreds of them. So this
//   page now carries its OWN small stylesheet (the <style> block, classes that
//   start with "jd-"). It doesn't depend on Tailwind scanning anything, and it
//   can't clash with the rest of your app because every class name is prefixed.
//
// PHOTOS
//   The page has slots for three photos (hero, garland, tea). Put your image
//   files in  public/jasmine/  with the names listed in IMAGES below. Until a
//   file exists, that slot quietly shows a drawn flower (hero) or nothing.
//
// The page has no buttons or links of its own: everything is read-only content
// except <SignOutButton />, which is the only thing wired up.
//
// NOTE: the greeting uses user.firstName. `user.name` no longer exists, because
// the sign-up now stores firstName and lastName.
// ============================================================================

"use client";

import { useState } from "react";
import Image from "next/image";

import { useAuth } from "@/components/providers/auth-provider";
import SignOutButton from "@/components/sign-out-button";


// ----------------------------------------------------------------------------
// The page's stylesheet
// ----------------------------------------------------------------------------
// 1rem = 16px. The @media blocks are the responsive part: one column on a phone,
// two on a tablet (640px and up), three or four on a desktop (1024px and up).
const CSS = `
.jd {
    --bg: #052e22;
    --card: #0b3d2e;
    --line: #14573f;
    --text: #ecfdf5;
    --muted: #a7d9c3;
    --accent: #fcd34d;
    min-height: 100vh;
    padding: 2rem 1rem;
    background: var(--bg);
    color: var(--text);
}
.jd-wrap {
    max-width: 64rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3.5rem;
}

/* Top bar */
.jd-top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.jd-hello { margin: 0; font-size: 1.125rem; font-weight: 600; color: #fff; }
.jd-email { margin: 0.125rem 0 0; font-size: 0.875rem; color: var(--muted); }

/* The sign-out button comes from your own component, whose colours were made
   for a white card. This makes any <button> inside it readable on green. */
.jd-signout button {
    padding: 0.5rem 1rem;
    border: 0;
    border-radius: 0.5rem;
    background: #fff;
    color: #052e22;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
}
.jd-signout button:hover { background: #d1fae5; }
.jd-signout button:disabled { opacity: 0.6; cursor: default; }

/* Hero */
.jd-hero { display: flex; flex-direction: column; align-items: center; gap: 2.5rem; }
.jd-title {
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 2.5rem;
    line-height: 1.1;
    font-weight: 400;
    color: #fff;
}
.jd-lead { margin: 1.25rem 0 0; max-width: 36rem; font-size: 1.125rem; line-height: 1.6; color: var(--muted); }
.jd-glow {
    padding: 1.5rem;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 253, 245, 0.18), transparent 70%);
}

/* Section headings */
.jd-h2 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: 1.5rem; font-weight: 400; color: #fff; }
.jd-sub { margin: 0.5rem 0 0; max-width: 40rem; line-height: 1.6; color: var(--muted); }

/* Grids of cards */
.jd-grid { margin-top: 1.5rem; display: grid; gap: 1rem; grid-template-columns: 1fr; }
.jd-card { padding: 1.25rem; border: 1px solid var(--line); border-radius: 1rem; background: var(--card); }
.jd-art { height: 7rem; display: flex; align-items: center; justify-content: center; }
.jd-when { margin: 0.75rem 0 0; font-size: 0.875rem; color: var(--accent); }
.jd-card h3 { margin: 0.25rem 0 0; font-size: 1.125rem; font-weight: 500; color: #fff; }
.jd-card p { margin: 0.5rem 0 0; font-size: 0.875rem; line-height: 1.55; color: var(--muted); }
.jd-card .jd-when { margin-top: 0.75rem; color: var(--accent); }

/* Photos. Each box needs a size, because the image fills it (next/image "fill"). */
.jd-photo { position: relative; overflow: hidden; border-radius: 1rem; background: var(--card); }
.jd-hero-photo { width: 100%; max-width: 20rem; aspect-ratio: 4 / 5; flex-shrink: 0; }
.jd-card .jd-fact-photo { height: 10rem; margin: -1.25rem -1.25rem 1rem; border-radius: 1rem 1rem 0 0; }
.jd-credit { margin: 0; font-size: 0.75rem; color: var(--muted); }

/* Grow your own */
.jd-grow { padding: 1.5rem; border-radius: 1rem; background: #d1fae5; color: #052e22; }
.jd-grow dl { margin: 1.25rem 0 0; display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
.jd-grow dt { font-size: 1.125rem; font-weight: 600; }
.jd-grow dd { margin: 0.25rem 0 0; font-size: 0.875rem; line-height: 1.55; color: #064e3b; }
.jd-grow .jd-h2 { color: #052e22; }

@media (min-width: 640px) {
    .jd { padding: 2rem; }
    .jd-title { font-size: 3.25rem; }
    .jd-grid { grid-template-columns: repeat(2, 1fr); }
    .jd-grow dl { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 768px) {
    .jd-hero { flex-direction: row; justify-content: space-between; }
}
@media (min-width: 1024px) {
    .jd-grid-4 { grid-template-columns: repeat(4, 1fr); }
    .jd-grid-3 { grid-template-columns: repeat(3, 1fr); }
}
`;


// ----------------------------------------------------------------------------
// Flower - a jasmine flower drawn with plain CSS shapes
// ----------------------------------------------------------------------------
// 5 petals (tall ellipses), all pivoting around the centre of the flower.
//   open  : 0 = petals stacked together (a bud), 1 = spread into a full ring.
//   scale : how big the petals are.
//   tone  : the petal colour.
// Everything is an inline style, so the flower can't depend on any stylesheet.
function Flower({
                    open,
                    scale,
                    tone,
                    size = 96,
                }: {
    open: number;
    scale: number;
    tone: string;
    size?: number;
}) {
    const petalW = size * 0.28;
    const petalH = size * 0.5;

    return (
        <div
            style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
            aria-hidden="true"
        >
            {[0, 1, 2, 3, 4].map((i) => (
                <span
                    key={i}
                    style={{
                        position: "absolute",
                        display: "block",
                        // The bottom-centre of each petal sits on the flower's centre...
                        left: size / 2 - petalW / 2,
                        top: size / 2 - petalH,
                        width: petalW,
                        height: petalH,
                        borderRadius: "9999px",
                        background: tone,
                        boxShadow: "0 0 0 1px rgb(0 0 0 / 0.1)",
                        // ...and each petal turns around that point. Open = 1 gives
                        // angles of -144, -72, 0, 72, 144: an even ring of 5.
                        transformOrigin: "50% 100%",
                        transform: `rotate(${(i - 2) * (12 + 60 * open)}deg) scale(${scale})`,
                    }}
                />
            ))}

            {/* The golden centre. A bud is closed, so there's nothing to show yet. */}
            {open > 0.3 && (
                <span
                    style={{
                        position: "absolute",
                        display: "block",
                        left: size / 2 - 5,
                        top: size / 2 - 5,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#fbbf24",
                    }}
                />
            )}
        </div>
    );
}


// ----------------------------------------------------------------------------
// IMAGES - the photos used on this page
// ----------------------------------------------------------------------------
// `src` is a path inside the /public folder: "/jasmine/hero.jpg" means the file
// public/jasmine/hero.jpg. Put your files there with these exact names (or
// change the names here). `alt` describes the photo for screen readers.
// `credit`: if the photo's licence asks for attribution (Wikimedia Commons
// usually does), write it here, e.g. "Jane Doe, CC BY-SA 4.0". Every non-empty
// credit is listed at the bottom of the page.
const IMAGES = {
    hero: {
        src: "/jasmine/hero.jpg",
        alt: "White sampaguita blossoms on the plant",
        credit: "",
    },
    garland: {
        src: "/jasmine/garland.jpg",
        alt: "A garland of sampaguita flowers",
        credit: "",
    },
    tea: {
        src: "/jasmine/tea.jpg",
        alt: "A cup of jasmine tea with jasmine flowers",
        credit: "",
    },
};


// ----------------------------------------------------------------------------
// Photo - a picture that doesn't break the page if its file is missing
// ----------------------------------------------------------------------------
// next/image with `fill` stretches the picture to cover its box (objectFit
// cover crops it instead of squashing it). If the file can't be loaded, onError
// switches to `fallback` (or to nothing) instead of showing a broken-image icon.
function Photo({
                   src,
                   alt,
                   className,
                   sizes,
                   priority,
                   fallback = null,
               }: {
    src: string;
    alt: string;
    className: string;
    sizes: string;
    priority?: boolean;
    fallback?: React.ReactNode;
}) {
    const [failed, setFailed] = useState(false);
    if (failed) return <>{fallback}</>;

    return (
        <div className={`jd-photo ${className}`}>
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                style={{ objectFit: "cover" }}
                onError={() => setFailed(true)}
            />
        </div>
    );
}


// ----------------------------------------------------------------------------
// The content
// ----------------------------------------------------------------------------
const STAGES = [
    {
        when: "Afternoon",
        what: "Tight buds",
        note: "Closed and only faintly scented.",
        open: 0,
        scale: 0.55,
        tone: "#e3efd6",
    },
    {
        when: "Dusk",
        what: "Petals unfurl",
        note: "As the light drops, the petals spread and the scent starts to build.",
        open: 0.55,
        scale: 0.8,
        tone: "#fffdf5",
    },
    {
        when: "Night",
        what: "Full bloom",
        note: "The scent peaks after dark, which suits night-flying pollinators like moths.",
        open: 1,
        scale: 1,
        tone: "#fffdf5",
    },
    {
        when: "Morning",
        what: "Fading",
        note: "The scent thins out and the white petals blush pink as they age.",
        open: 0.9,
        scale: 0.85,
        tone: "#f3cdd6",
    },
];

const FACTS: { title: string; body: string; image?: keyof typeof IMAGES }[] = [
    {
        title: "Not every jasmine is a jasmine",
        body: "Star jasmine, Cape jasmine (a gardenia) and night-blooming jasmine are all different plants. True jasmines belong to the genus Jasminum.",
    },
    {
        title: "Some jasmines are yellow",
        body: "Winter jasmine opens bright yellow in the cold months and has almost no scent. Fragrance and white petals are common, not guaranteed.",
    },
    {
        title: "A promise in a garland",
        image: "garland",
        body: "A popular legend says sampaguita comes from “sumpa kita”, “I promise you”. Garlands of it are sold outside churches and offered to religious images.",
    },
    {
        title: "Thousands of flowers per gram",
        body: "Jasmine absolute, the precious perfume extract, takes thousands of hand-picked blossoms to make a single gram.",
    },
    {
        title: "Tea scented by flowers",
        image: "tea",
        body: "Jasmine tea is usually green tea layered with fresh blossoms, so the leaves soak up the scent as the flowers open.",
    },
    {
        title: "One smell, dozens of compounds",
        body: "The scent includes indole, which smells floral in tiny amounts and much less pleasant in large ones. The mix is what makes jasmine smell like jasmine.",
    },
];

const GROW = [
    { name: "Sun", tip: "Aim for at least six hours of direct sun a day." },
    { name: "Water", tip: "Water when the top of the soil feels dry. Soggy roots mean fewer flowers." },
    { name: "Pinch", tip: "Snip the tips after a flush of blooms. More branches means more buds." },
];


// Served at /dashboard. Only reachable when logged in (see layout.tsx).
export default function DashboardPage() {
    const { user } = useAuth(); // only the user is needed

    // Photo credits to list at the bottom (only the ones filled in above).
    const credits = Object.values(IMAGES).map((i) => i.credit).filter(Boolean);

    return (
        <main className="jd">
            {/* This page's own stylesheet (see CSS above). */}
            <style>{CSS}</style>

            <div className="jd-wrap">
                {/* ---- Top bar: who is signed in + the ONLY working button ---- */}
                <header className="jd-top">
                    <div>
                        <h1 className="jd-hello">Hello, {user?.firstName}</h1>
                        <p className="jd-email">{user?.email}</p>
                    </div>
                    <div className="jd-signout">
                        <SignOutButton />
                    </div>
                </header>

                {/* ---- Hero ---- */}
                <section className="jd-hero">
                    <div>
                        <h2 className="jd-title">The flower that opens after dark</h2>
                        <p className="jd-lead">
                            Sampaguita, <em>Jasminum sambac</em>, has been the national flower of the
                            Philippines since 1934. Its white blossoms open in the evening, and the
                            fragrance reaches its peak at night.
                        </p>
                    </div>
                    <Photo
                        src={IMAGES.hero.src}
                        alt={IMAGES.hero.alt}
                        className="jd-hero-photo"
                        sizes="(min-width: 768px) 320px, 100vw"
                        priority
                        fallback={
                            <div className="jd-glow">
                                <Flower size={200} open={1} scale={1} tone="#fffdf5" />
                            </div>
                        }
                    />
                </section>

                {/* ---- How a jasmine flower blooms ---- */}
                <section>
                    <h2 className="jd-h2">How a jasmine flower blooms</h2>
                    <p className="jd-sub">
                        A single sampaguita blossom has a short day. Here is what it goes through, from
                        afternoon to the next morning.
                    </p>

                    <div className="jd-grid jd-grid-4">
                        {STAGES.map((s) => (
                            <article key={s.when} className="jd-card">
                                <div className="jd-art">
                                    <Flower size={88} open={s.open} scale={s.scale} tone={s.tone} />
                                </div>
                                <p className="jd-when">{s.when}</p>
                                <h3>{s.what}</h3>
                                <p>{s.note}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ---- Fun facts ---- */}
                <section>
                    <h2 className="jd-h2">Fun facts</h2>

                    <div className="jd-grid jd-grid-3">
                        {FACTS.map((f) => (
                            <article key={f.title} className="jd-card">
                                {f.image && (
                                    <Photo
                                        src={IMAGES[f.image].src}
                                        alt={IMAGES[f.image].alt}
                                        className="jd-fact-photo"
                                        sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                                    />
                                )}
                                <h3>{f.title}</h3>
                                <p>{f.body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* ---- Grow your own ---- */}
                <section className="jd-grow">
                    <h2 className="jd-h2">Make yours bloom</h2>

                    <dl>
                        {GROW.map((g) => (
                            <div key={g.name}>
                                <dt>{g.name}</dt>
                                <dd>{g.tip}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {credits.length > 0 && <p className="jd-credit">Photos: {credits.join(", ")}</p>}
            </div>
        </main>
    );
}