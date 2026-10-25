// ============================================================================
// sign-up-form.tsx - the SIGN-UP form, styled to match the sign-in card.
// ============================================================================
//
// Save this as: src/components/forms/sign-up-form.tsx   (replaces the old one)
//
// HOW IT'S USED
//   src/app/(auth)/sign-up/page.tsx  ->  <SignUpForm />
//
// WHY SOME LAYOUT USES style={{ ... }} INSTEAD OF TAILWIND CLASSES
//   Tailwind v4 only creates CSS for the classes it has scanned. In this
//   project, classes that appear ONLY in this file (gap-5, flex-col, absolute,
//   max-h-60, grid-cols-2...) were not being generated, so the spacing and the
//   dropdown broke, while classes that sign-in-form.tsx also uses (flex,
//   items-center, mt-4...) kept working. Anything that would BREAK the layout
//   if its class is missing is therefore written as an inline style (see
//   `layout` below). Inline styles can't go missing. Colours, borders and
//   rounding stay as Tailwind classes, like in the sign-in form.
//   To fix the cause for good, see the @source note at the bottom of this file.
//
// WHAT CHANGED IN THIS VERSION
//   1. Every row of the form is separated by the same space (inline `gap`).
//   2. The country list is positioned absolutely under the box, so opening it
//      no longer pushes the form down. It has a fixed maximum height and
//      scrolls inside itself.
//   3. The password eye stays inside the box (same structure as before).
//
// The LOGIC (handleSubmit) is unchanged.
// ============================================================================

"use client"; // handles clicks, typing and state -> Client Component

import {
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type FormEvent,
    type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Same path the sign-in form uses.
import { useAuth } from "@/components/providers/auth-provider";
import { COUNTRIES } from "@/lib/countries";
import type { SignUpInput } from "@/types/auth";

// Must match MIN_PASSWORD_LENGTH in the backend controller.
const MIN_PASSWORD_LENGTH = 8;

// The dropdown rows: a "No country" row first (so the choice can be undone),
// then the real countries. Its code is "", which handleSubmit treats as "not sent".
const COUNTRY_OPTIONS = [{ code: "", name: "No country" }, ...COUNTRIES];


// ----------------------------------------------------------------------------
// Layout as inline styles (see the note at the top for why)
// ----------------------------------------------------------------------------
// 1rem = 16px, so 1.25rem = 20px, 0.75rem = 12px, 15rem = 240px.
const layout: Record<string, CSSProperties> = {
    // The form: a vertical stack with the SAME space between every row.
    form: { display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1.5rem" },

    // First name + last name side by side, with 12px between them.
    nameRow: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem" },

    // The box the country list is positioned against.
    dropdown: { position: "relative" },

    // The closed country box: name on the left, arrow on the right.
    dropdownButton: { justifyContent: "space-between", gap: "0.5rem", textAlign: "left" },

    // The country list. position:absolute takes it OUT of the normal flow, so it
    // floats over the fields below instead of pushing them down. top:100% starts
    // it exactly at the bottom edge of the box. maxHeight + overflowY make it
    // scroll inside itself (15rem = about 6 rows).
    list: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        zIndex: 20,
        marginTop: "0.25rem",
        maxHeight: "15rem",
        overflowY: "auto",
        padding: "0.25rem 0",
        listStyle: "none",
    },

    // The terms row: checkbox on the left, text on the right.
    termsRow: { display: "flex", alignItems: "flex-start", gap: "0.5rem" },
    checkbox: { width: 16, height: 16, flexShrink: 0, marginTop: 2, accentColor: "#3b82f6" },

    // The eye button: as tall as the box, with room on both sides.
    eyeButton: { alignSelf: "stretch", padding: "0 0.75rem" },
};


// ----------------------------------------------------------------------------
// Styling shared by the form controls (colours, borders, focus glow)
// ----------------------------------------------------------------------------
// The look of a box: border, colours, focus glow. No size or padding here.
const boxLook =
    "rounded-lg border border-gray-200 bg-white text-gray-700 focus:border-blue-400 focus:ring-3 focus:ring-blue-300/40 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-300";

// A normal text input.
const field = `${boxLook} block w-full px-4 py-2 placeholder:text-gray-500 dark:placeholder:text-gray-400`;

// The closed country dropdown (it's a button that looks like an input).
const selectButton = `${boxLook} flex w-full items-center px-4 py-2`;


// ----------------------------------------------------------------------------
// PasswordInput - a password box with a show/hide eye INSIDE it
// ----------------------------------------------------------------------------
// The wrapper IS the visible box (border, rounded corners, glow). The real
// <input> inside is see-through with no border, and the eye sits next to it in
// the same row, so it can't end up outside the box.
//
// It owns its own "visible" state, so the two password fields toggle
// independently. Switching `type` between "password" and "text" is the whole
// trick: the value typed stays exactly the same.
function PasswordInput({
                           name,
                           placeholder,
                           autoComplete,
                           minLength,
                       }: {
    name: string;
    placeholder: string;
    autoComplete: string;
    minLength?: number;
}) {
    const [visible, setVisible] = useState(false);

    // The blue glow when the input (or the eye) has focus. The wrapper is the
    // visible box, so the glow has to be drawn on the wrapper.
    const [focused, setFocused] = useState(false);

    return (
        <div
            // React's onFocus/onBlur also fire for focus changes INSIDE this div.
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
            style={
                focused
                    ? { borderColor: "#60a5fa", boxShadow: "0 0 0 3px rgb(147 197 253 / 0.4)" }
                    : undefined
            }
        >
            <input
                name={name}
                type={visible ? "text" : "password"}
                required
                minLength={minLength}
                placeholder={placeholder}
                aria-label={placeholder}
                autoComplete={autoComplete}
                className="w-full py-2 text-gray-700 focus:outline-hidden dark:text-gray-300"
                // minWidth:0 lets the input shrink so the eye always has room.
                style={{
                    minWidth: 0,
                    background: "transparent",
                    paddingLeft: "1rem",
                    paddingRight: "0.5rem",
                }}
            />

            {/* type="button" is IMPORTANT: a button inside a form submits it by
                default, so without it clicking the eye would submit the form. */}
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                className="flex items-center text-gray-500 hover:text-gray-700 focus-visible:text-blue-500 focus:outline-hidden dark:text-gray-400 dark:hover:text-gray-200"
                style={layout.eyeButton}
            >
                {/* width/height are set directly on the <svg>. Without a size an
                    inline SVG stretches to fill the space, so this protects it. */}
                {visible ? (
                    // Eye with a slash: "click to hide"
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width={20}
                        height={20}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                    </svg>
                ) : (
                    // Open eye: "click to show"
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width={20}
                        height={20}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}


// ----------------------------------------------------------------------------
// CountrySelect - a dropdown whose list opens under the box and scrolls
// ----------------------------------------------------------------------------
// HOW IT WORKS
//   - A button shows the chosen country (or the grey "Country (optional)").
//   - Clicking it shows a list. The list is `position: absolute` (see
//     layout.list), so it floats over the fields below it and the form keeps
//     its size. It has a maximum height and scrolls inside itself.
//   - A hidden <input name="country"> carries the chosen 2-letter code, so
//     handleSubmit can read it with data.get("country") like any other field.
//   - Keyboard: Arrow keys move, Enter/Space picks, Escape closes, typing a
//     letter jumps to the first country starting with it.
function CountrySelect() {
    const [value, setValue] = useState(""); // chosen code, "" = none
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0); // highlighted row while open

    const wrapperRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const scrollNext = useRef(false); // "the next highlight change came from the keyboard"
    const listId = useId();

    const selected = COUNTRIES.find((c) => c.code === value);

    // Highlight a row. When it comes from the keyboard, also scroll the list so
    // the row is visible. (Not done for mouse hover, it would make the list jump.)
    function go(index: number) {
        scrollNext.current = true;
        setActive(index);
    }

    function openList() {
        go(COUNTRY_OPTIONS.findIndex((o) => o.code === value)); // start on the current choice
        setOpen(true);
    }

    function choose(code: string) {
        setValue(code);
        setOpen(false);
        buttonRef.current?.focus();
    }

    // Close the list when the person clicks anywhere outside of it.
    useEffect(() => {
        if (!open) return;
        function onMouseDown(e: MouseEvent) {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, [open]);

    // Scroll the highlighted row into view after a keyboard move.
    useEffect(() => {
        if (open && scrollNext.current) {
            document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
            scrollNext.current = false;
        }
    }, [open, active, listId]);

    function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
        const last = COUNTRY_OPTIONS.length - 1;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (open) go(Math.min(active + 1, last));
                else openList();
                break;
            case "ArrowUp":
                e.preventDefault();
                if (open) go(Math.max(active - 1, 0));
                else openList();
                break;
            case "Home":
                if (open) {
                    e.preventDefault();
                    go(0);
                }
                break;
            case "End":
                if (open) {
                    e.preventDefault();
                    go(last);
                }
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (open) choose(COUNTRY_OPTIONS[active].code);
                else openList();
                break;
            case "Escape":
                if (open) {
                    e.preventDefault();
                    setOpen(false);
                }
                break;
            case "Tab":
                setOpen(false); // let focus move on normally
                break;
            default: {
                // Type-ahead: a letter jumps to the next country starting with it.
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    const letter = e.key.toLowerCase();
                    const from = open
                        ? active
                        : COUNTRY_OPTIONS.findIndex((o) => o.code === value);
                    for (let step = 1; step <= COUNTRY_OPTIONS.length; step++) {
                        const i = (from + step) % COUNTRY_OPTIONS.length;
                        if (COUNTRY_OPTIONS[i].name.toLowerCase().startsWith(letter)) {
                            go(i);
                            setOpen(true);
                            break;
                        }
                    }
                }
            }
        }
    }

    return (
        // position:relative makes this wrapper the reference point for the list.
        <div ref={wrapperRef} style={layout.dropdown}>
            {/* What handleSubmit reads. The visible button is not a form field. */}
            <input type="hidden" name="country" value={value} />

            <button
                ref={buttonRef}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-label="Country (optional)"
                onKeyDown={onKeyDown}
                // detail === 0 means the "click" came from the keyboard (Enter or
                // Space). The keyboard is already handled in onKeyDown, so only
                // real mouse clicks toggle here. This avoids a double toggle.
                onClick={(e) => {
                    if (e.detail === 0) return;
                    if (open) setOpen(false);
                    else openList();
                }}
                className={selectButton}
                style={layout.dropdownButton}
            >
                {/* The three text rules cut a long name with "..." instead of
                    pushing the arrow out of the box. */}
                <span
                    className={selected ? "" : "text-gray-500 dark:text-gray-400"}
                    style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                    {selected ? selected.name : "Country (optional)"}
                </span>

                {/* Arrow. flexShrink:0 keeps it from being squashed by long names.
                    It flips upside down while the list is open. */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width={16}
                    height={16}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="text-gray-500 dark:text-gray-400"
                    style={{
                        flexShrink: 0,
                        transition: "transform 150ms",
                        transform: open ? "rotate(180deg)" : "none",
                    }}
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                </svg>
            </button>

            {/* The list. Position, height and scrolling come from layout.list. */}
            {open && (
                <ul
                    id={listId}
                    role="listbox"
                    aria-label="Countries"
                    className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-600 dark:bg-gray-800"
                    style={layout.list}
                >
                    {COUNTRY_OPTIONS.map((o, i) => {
                        const isChosen = o.code === value;
                        return (
                            <li
                                key={o.code || "none"}
                                id={`${listId}-${i}`}
                                role="option"
                                aria-selected={isChosen}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => choose(o.code)}
                                style={{ cursor: "pointer" }}
                                className={`px-4 py-2 ${
                                    i === active ? "bg-gray-100 dark:bg-gray-700" : ""
                                } ${
                                    o.code === ""
                                        ? "text-gray-500 dark:text-gray-400"
                                        : isChosen
                                            ? "font-medium text-blue-500 dark:text-blue-400"
                                            : "text-gray-700 dark:text-gray-300"
                                }`}
                            >
                                {o.name}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}


export default function SignUpForm() {
    const router = useRouter();
    const { signUp } = useAuth();

    // The red error text ("" = no error) and the "request running" flag.
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);


    // ------------------------------------------------------------------------
    // handleSubmit - the LOGIC. Unchanged by the redesign.
    // ------------------------------------------------------------------------
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); // stop the browser's default full-page reload
        setError("");

        // Read the inputs through their `name` attribute.
        const data = new FormData(e.currentTarget);
        const firstName = String(data.get("firstName") ?? "").trim();
        const lastName = String(data.get("lastName") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        const phone = String(data.get("phone") ?? "").trim();
        const country = String(data.get("country") ?? ""); // from CountrySelect's hidden input
        const password = String(data.get("password") ?? ""); // never trim passwords
        const confirmPassword = String(data.get("confirmPassword") ?? "");

        // A checkbox is only in FormData when it's ticked (its value is "on").
        // `=== "on"` turns that into a real true/false, which is exactly what
        // the backend wants: it rejects anything that isn't the boolean true.
        const acceptedTerms = data.get("acceptedTerms") === "on";

        // ---- Checks we can do BEFORE bothering the server ----
        // The backend checks all of these again. These are only for fast feedback.
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!acceptedTerms) {
            setError("You must accept the terms to create an account");
            return;
        }

        // Build exactly what the backend expects. Optional fields are only
        // included when the person filled them in, so we never send "".
        // (confirmPassword is deliberately NOT in here.)
        const input: SignUpInput = {
            firstName,
            lastName,
            email,
            password,
            acceptedTerms,
            ...(phone ? { phone } : {}),
            ...(country ? { country } : {}),
        };

        setPending(true);
        try {
            // Throws an ApiError if Express rejects it (email already in use,
            // a rule in your User model failed...). Then we jump to the catch.
            // On success the user is signed in AND stored in the shared state.
            await signUp(input);

            router.push("/dashboard");
        } catch (err) {
            // The text Express sent, e.g. "Email already in use".
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setPending(false); // re-enable the button either way
        }
    }


    // ------------------------------------------------------------------------
    // What gets drawn on the screen (JSX). Comments here must be {/* ... */}.
    // ------------------------------------------------------------------------
    return (
        // Page background: light grey normally, dark grey in dark mode.
        // flex + items-center + justify-center + min-h-screen centers the card.
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
            {/* THE CARD. No overflow-hidden here on purpose: it could cut off the
                country list. The footer strip rounds its own bottom corners. */}
            <div className="mx-auto w-full max-w-sm rounded-lg bg-white shadow-md dark:bg-gray-800">
                <div className="px-6 py-4">
                    <div className="mx-auto flex justify-center">
                        <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                            Auth app
                        </span>
                    </div>

                    <h3 className="mt-3 text-center text-xl font-medium text-gray-600 dark:text-gray-200">
                        Create your account
                    </h3>

                    <p className="mt-1 text-center text-gray-500 dark:text-gray-400">
                        It only takes a minute
                    </p>

                    {/* THE SPACING LIVES HERE: layout.form stacks the rows
                        vertically with the same gap between every one of them,
                        so the rows below have no margins of their own.
                        Every `name` must match what handleSubmit reads. */}
                    <form onSubmit={handleSubmit} style={layout.form}>
                        {/* First and last name side by side. */}
                        <div style={layout.nameRow}>
                            <input
                                name="firstName"
                                required
                                minLength={2}
                                maxLength={50}
                                placeholder="First name"
                                aria-label="First name"
                                autoComplete="given-name"
                                className={field}
                            />
                            <input
                                name="lastName"
                                required
                                minLength={2}
                                maxLength={50}
                                placeholder="Last name"
                                aria-label="Last name"
                                autoComplete="family-name"
                                className={field}
                            />
                        </div>

                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="Email Address"
                            aria-label="Email Address"
                            autoComplete="email"
                            className={field}
                        />

                        {/* OPTIONAL: no `required`. The pattern mirrors the
                            backend rule (optional +, then digits, spaces and
                            dashes, 7 to 20 long). An empty box always passes. */}
                        <input
                            name="phone"
                            type="tel"
                            placeholder="Phone (optional)"
                            aria-label="Phone (optional)"
                            autoComplete="tel"
                            pattern="\+?[0-9\s\-]{7,20}"
                            title="Digits, spaces and dashes, with an optional + at the start (7 to 20 characters)"
                            className={field}
                        />

                        <CountrySelect />

                        <PasswordInput
                            name="password"
                            placeholder="Password"
                            autoComplete="new-password"
                            minLength={MIN_PASSWORD_LENGTH}
                        />

                        <PasswordInput
                            name="confirmPassword"
                            placeholder="Confirm password"
                            autoComplete="new-password"
                        />

                        {/* The checkbox's `name` is what appears in FormData.
                            `required` stops the browser from submitting while it's
                            unticked. */}
                        <label
                            className="text-sm text-gray-600 dark:text-gray-200"
                            style={layout.termsRow}
                        >
                            <input
                                name="acceptedTerms"
                                type="checkbox"
                                required
                                style={layout.checkbox}
                            />
                            <span>
                                I accept the{" "}
                                <Link
                                    href="/terms"
                                    className="font-medium text-blue-500 hover:underline dark:text-blue-400"
                                >
                                    terms
                                </Link>
                            </span>
                        </label>

                        {/* Only shown when `error` isn't an empty string. */}
                        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                        <div className="flex items-center justify-end">
                            <button
                                disabled={pending}
                                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 hover:bg-blue-400 focus:ring-3 focus:ring-blue-300/50 focus:outline-hidden disabled:opacity-50"
                            >
                                {pending ? "Please wait..." : "Create account"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Grey footer strip with the link to the other page. The two
                    radius values round its bottom corners to match the card. */}
                <div
                    className="flex items-center justify-center bg-gray-50 py-4 text-center dark:bg-gray-700"
                    style={{ borderBottomLeftRadius: "0.5rem", borderBottomRightRadius: "0.5rem" }}
                >
                    <span className="text-sm text-gray-600 dark:text-gray-200">
                        Already have an account?
                    </span>
                    <Link
                        href="/sign-in"
                        className="mx-2 text-sm font-bold text-blue-500 hover:underline dark:text-blue-400"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </main>
    );
}

// ============================================================================
// FIXING THE ROOT CAUSE (optional, but recommended)
// ============================================================================
// If classes that only appear in a NEW file are not being picked up, tell
// Tailwind explicitly where to look. In globals.css, right under the line
// `@import "tailwindcss";`, add:
//
//     @source "../components";
//
// The path is relative to the CSS file. This one is right when globals.css is
// in src/app/, because ../components then means src/components. Then stop the
// dev server (Ctrl+C), run `npm run dev` again and hard-refresh the browser
// (Ctrl+Shift+R).
// ============================================================================