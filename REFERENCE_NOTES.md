# Reference notes: WithYou "WhatsUp?!"

Source inspected: `https://www.withyou.id/preview/whatsup` and the public
WithYou product page, 2026-09-27. These notes describe the public HTML/CSS
served for the preview. The live browser-control surface was unavailable, so
click outcomes below are verified from rendered markup and real URLs, not from
an interactive click-through. Do not copy WithYou's photos, personal data, or
long-form copy. Reuse the interaction and layout patterns with original assets
and copy.

## Design thesis

The theme is not a conventional floral invitation. It is a single WhatsApp
group conversation where the couple, represented by coloured avatars, send the
invitation content as chat bubbles. The guest is the third group participant.
Cards, system messages, typing indicators, chat tails, reaction pills, a
message-list notification, and a WhatsApp-style wallpaper make every ordinary
wedding module feel native to that metaphor.

## Page frame and responsive behaviour

- Mobile-first shell: one centred column, `width: 100%`, `max-width: 430px`,
  `min-height: 100lvh`, `overflow-x: clip`. On a wide display, the area around
  that phone-width column is a plain mat, rather than a desktop-specific
  layout.
- The page declares `maximum-scale=1`, `user-scalable=no`, and
  `viewport-fit=cover`. Sections use `scroll-mt: 128px`, `padding-inline:
  12px`, and normally `min-height: 70vh`; this is designed for a tall phone
  feed, not a desktop grid.
- The conversation wall uses a repeating 160 x 160px line-art doodle SVG
  (heart, bell, envelope, sparkle, flower-like dots) over the wall colour.
- Light and dark variants follow `prefers-color-scheme`; there is no visible
  manual theme switch in the served preview.

## Exact visual tokens

### Light mode

| Purpose | Value |
| --- | --- |
| Page mat outside phone | `#E9E4DC` |
| Chat wallpaper / body fallback | `#F5F1EB` (theme data also gives `#EFEAE2`) |
| Incoming bubble / header pill / chip | `#FFFFFF` |
| Outgoing bubble | `#D9FDD3` |
| Main ink | `#111B21` |
| Secondary text | `#54656F` |
| Muted metadata | `#5E6E78` |
| Main green accent | `#008069` (theme accent data: `#0B7A66`) |
| Link blue | `#027AAD` |
| Header glass | `#F7F4EFDB` |
| Divider | `#E9EDEF` |
| System-message yellow | `#FFEECD` |
| Read tick | `#1E9BD7` |
| Bride name/avatar colour | `#C4336D` |
| Groom name/avatar colour | `#1B7F52` |
| Share/status ring gradient | `#21C063`, `#25D366`, `#0B7A66` |

The paper doodle stroke is `#54656F` at 9% opacity. Small card elevation is
consistently `0 1px 0.5px rgba(11,20,26,0.13)`, not a broad floating shadow.

### Dark mode

`#0B141A` wall, `#1F2C34` incoming/pill, `#144D37` outgoing, `#E9EDEF` ink,
`#AEBAC1` muted text, `#21C063` accent, `#53BDEB` link/ticks, and
`#070D11` outer mat. Bride/groom brighten to `#FF7CA8` / `#3DD68C`.

## Typography

- UI/body: `Inter, ui-sans-serif, system-ui, sans-serif` via `--font-inter`.
  Most message body text is 16px with 1.4 line height; sender labels are 14px
  semibold; small UI labels are 12 to 14px.
- Editorial quote: `Instrument Serif, ui-serif, Georgia, serif`, 19px italic,
  line height 1.4, separated with a 3px green left border.
- The application also ships many typefaces for other themes, but WhatsUp?!
  specifically uses the Inter + Instrument Serif pairing. Do not substitute
  the other globally loaded fonts merely because they appear in the CSS.

## Fixed conversation chrome

1. At top, a sticky translucent header (`z-index: 30`) with saturation + 18px
   blur. It wraps on narrow widths.
2. Left: a white 44px-high rounded back/count pill containing an outline
   chevron and `10`.
3. Next: a 44 x 44px circular status photo surrounded by the green conic
   gradient ring.
4. Centre: tappable group information, title `Yuan & Vito 💍` at 17px
   semibold and participant line `Yuan, Vito, Nama Tamu` at 13px.
5. Right: 44 x 44px live-video button and 52 x 44px music button, both white
   pills with thin outline SVGs.
6. Immediately below are four centred system chips: a locked-to-guest message,
   group-created, guest-added, and a rounded `Hari ini` date chip. They max at
   86% width, have 10px radius (date is full pill), and use 12.5 to 13px text.

Messages are left-aligned incoming bubbles. Avatars are 30px circles. A normal
bubble is at most 80% of the row, `border-radius: 18px` with the lower-left
corner squared, horizontal padding 12px, top padding 6px, bottom 6px, and a
small SVG tail. Each section is introduced as chat activity: a three-dot
typing bubble, then a growing message/card. Some items use a visible sender
name in bride pink or groom green.

## Section order and concrete content pattern

The page has these IDs in source order. `wishes` is a wrapper after the RSVP
area, not a named `section` element; the story appears within the livestream
section.

1. `#home`: incoming messages introduce the named guest, the couple, and the
   wedding date. A visual/voice-note-like card includes a large hero photo,
   the couple names, date, a short invitation paragraph, and a compact music
   row linking to the selected track. There are heart and crying-face reaction
   pills plus a share button.
2. `#verse`: forwarded-message treatment. It carries sender `Vito`, label
   `Diteruskan`, the Bible quote in Instrument Serif, and `Mark 10:6-9`.
3. `#profiles`: two separate incoming person cards, first the bride then the
   groom. Each shows a portrait, full name, role, parents, and an Instagram
   profile link. The lead-ins are conversational: "Kenalan dulu..." and
   "Dan ini aku...".
4. `#countdown`: a pinned-message card (`Disematkan`) titled `The Countdown`.
   Its numbers are a 4-column grid, gap 8px; each white, 12px-radius tile has
   a 26px semibold numeral and the labels Hari, Jam, Menit, Detik. A real
   Google Calendar link appears below.
5. `#events`: `The Celebrations` followed by three event cards in the chat
   feed: Holy Matrimony, Reception, and Family Reception. Each has date/time,
   venue, full address, a 116px map-preview panel with a red pin, `Buka peta`,
   and `Tambah ke kalender`. The preview uses real Maps and Google Calendar
   URLs, so the pattern supports a per-event destination, not just one general
   map button.
6. `#livestream`: a conversational lead-in, then one compact card per event.
   Each has a red `● Live` label, event title, date/time, and `Tonton live`.
   The preview links these to Meet. The three-card run is followed by the story
   rather than a distinct `#story` ID.
7. Story inside livestream: heading `Our Story`; three forwarded `Kenangan`
   episodes (2019, 2026, 2026), each with an episode title, photo, and prose.
   The important pattern is a vertical sequence of photo-message cards, not a
   conventional horizontal timeline/carousel.
8. `#dresscode`: short chat lead-in (`Dress code-nya, biar kompak`) then a
   colour-swatch presentation. The configured swatches are `#A9765C`,
   `#D6B8A8`, `#FAF9F9`, and `#020202`.
9. `#gallery`: chat lead-in `Beberapa foto kami`, then a photo mosaic. The
   server data contains eight gallery images; the visible collage has three
   immediate photo buttons and a `+ 4` overlay/button that opens more. Treat
   it as a lightbox gallery, not a carousel.
10. `#gift`: `Tanda kasih` message followed by a short optional-gift note.
    Bank cards include bank name, account number, holder, and individual
    `Salin` actions. A separate shipping-address card also has `Salin`.
11. `#wishlist`: a `📊 Polling Wishlist` card states selection progress and
    lists claimable physical gifts. Claimed items show a check and claimant;
    available items retain a `Lihat barang` external-shop link. The next card
    is the RSVP block, titled `Attendance`, with deadline copy and two large
    choices: `Hadir 🙌` and `Berhalangan`. Source data also configures guest
    count with a maximum of 2. A compact `💬 Ucapan & doa` chip introduces ten
    guest-message rows.
12. `#lovenote`: a short, highly personal quote card, visually treated as a
    message from the groom, then a heart reaction.
13. `#closing`: formal closing paragraph, couple names, a thank-you message,
    music credit/link, and a compact `Dibuat dengan WithYou` attribution with
    WhatsApp and site links. The fixed WhatsApp-style message-list overlay
    also exposes two invitation notifications; its buttons are labelled
    `Buka pesan dari Yuan & Vito 💍`.

## Interaction inventory

- Header controls: open group/status information, live-stream information,
  and toggle/play the music. The initial music glyph is muted.
- Progressive reveal: sections use `ch-reveal`; typing indicators and cards
  animate in with delays. Core values: normal reveal duration 0.42s,
  pop/grow 0.38s, typing 0.9s. `prefers-reduced-motion` disables those
  animations and hides the typing treatment.
- Cards with photos expose `aria-label="Lihat foto"`; gallery supports a
  lightbox/expanded-image flow. The `+ 4` tile is explicitly an interactive
  photo button.
- Share, music-track play, heart/emoji reactions, copy bank/address controls,
  RSVP choice controls, event map, event calendar, livestream, Instagram, and
  shop links all exist in the supplied markup. The real external anchors are
  Maps, Google Calendar, Meet, Instagram, Shopee, YouTube, WhatsApp, and
  withyou.id.
- No `Buka Undangan` text appears in this preview HTML. The invite source sets
  `skipGate` as undefined, but the initial rendered conversation is scaled to
  0.93 and 40% opacity, which indicates an opening/message-list layer is
  expected to sit above it before it is opened.
- All inspected interactive controls have accessible labels; focus-visible
  outlines use the accent colour. A faithful implementation should preserve
  keyboard access and not make the decoration-only parts clickable.

## Visual implementation details worth reusing

- Keep the central feed deliberately narrow. The emotional effect comes from
  reading a private group chat vertically, not from a large desktop hero.
- Use light glass only for the sticky header; content cards are opaque chat
  bubbles. The wallpaper and muted mat carry the atmosphere without heavy
  gradients.
- Event map previews are deliberately fake-map illustrations: pale green
  `#DCE8DA` base, white street lines, and a red `#D93F3F` marker. They link to
  real maps rather than embedding an interactive map.
- The theme's visual data includes a black ambient-video overlay at 55%
  opacity and a hero ambient video URL. Use original media in any remake.
- The active page data enables backdrop, countdown, story, gallery, RSVP,
  gift, wishlist, dress code, verse, livestream, love note, and wishes.
  These are independent toggles in WithYou's data model, so an implementation
  need not hard-code every section as mandatory.

## Product/dashboard findings from WithYou's public marketing page

These are vendor claims from the public product page, not features verified in
an authenticated dashboard:

- A host dashboard lists guests by state such as opened, present, and not yet
  answered; the product mockup shows guest name and grouping.
- Guest lists can be imported from Excel once, then personal WhatsApp links
  can be sent to each guest. The host can see who opened the invitation.
- RSVP records attendance, party/guest count, and optional meal choice. Their
  example dashboard aggregates catering choices.
- Per-guest protection: a unique invitation link can be locked to the first
  device and protected by the last three digits of the guest's phone number.
- Content editing is presented as live preview: names, events, location,
  story, gallery, colours, and fonts can be changed without waiting for a
  revision. A theme may be switched while the profile/data stays in place.
- The invitation remains editable and active for one year after publication;
  wishes remain stored and can be archived after the event.
- Personal package is described as one invitation; Business as up to ten
  client invitations, additional blocks of ten, and management from one
  dashboard. Those commercial limits/prices are time-sensitive and should not
  be copied into this project.

## Boundaries for this repository

Use the conversation framing, narrow feed, functional feature set, and colour
relationships as reference. Do not use the sample couple's images, names,
social profiles, account numbers, locations, song, messages, or WithYou
branding. This repository already uses placeholder couple data and a static
site, so implement only the requested presentation/features with its own
assets and local data model.
