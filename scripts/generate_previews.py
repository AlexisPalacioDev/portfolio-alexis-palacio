#!/usr/bin/env python3
"""Generate dark, app-like preview images for portfolio projects.

Renders at 2x and downsamples with LANCZOS so every vector shape ends up
antialiased. Each preview shares the same layout system (background gradient,
hexagon lattice, glow, icon, title block, tech chips) and only swaps palette
and icon, so the set reads as one coherent family.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT_DIR = Path(__file__).resolve().parent.parent / "src" / "assets"

WIDTH, HEIGHT = 800, 600
SCALE = 2
W, H = WIDTH * SCALE, HEIGHT * SCALE

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

RGB = tuple[int, int, int]


@dataclass
class Preview:
    filename: str
    title: str
    subtitle: str
    chips: list[str]
    icon: str
    top: RGB
    bottom: RGB
    accent: RGB
    glow: RGB = field(default=(255, 255, 255))


PREVIEWS = [
    Preview(
        filename="preview-poisonflix.png",
        title="PoisonFlix",
        subtitle="Netflix-like Streaming PWA",
        chips=["PWA", "Jellyfin", "TypeScript"],
        icon="play",
        top=(139, 0, 0),
        bottom=(26, 0, 0),
        accent=(229, 62, 62),
        glow=(255, 90, 70),
    ),
    Preview(
        filename="preview-poisonos.png",
        title="PoisonOS",
        subtitle="Custom Android Launcher",
        chips=["Kotlin", "Jetpack Compose", "Android"],
        icon="android",
        top=(0, 137, 123),
        bottom=(0, 30, 26),
        accent=(38, 198, 178),
        glow=(64, 224, 200),
    ),
    Preview(
        filename="preview-hermes.png",
        title="Hermes",
        subtitle="Self-hosted AI Inference Server",
        chips=["Python", "FastAPI", "LLM"],
        icon="brain",
        top=(124, 77, 255),
        bottom=(26, 0, 51),
        accent=(157, 122, 255),
        glow=(150, 110, 255),
    ),
]


# --- background -------------------------------------------------------------


def vertical_gradient(top: RGB, bottom: RGB) -> Image.Image:
    """Ease-out vertical gradient: keeps the dark half dominant."""
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        t = t ** 0.55  # bias toward the darker bottom color
        color = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
        draw.line([(0, y), (W, y)], fill=color)
    return img


def radial_glow(center: tuple[int, int], radius: int, color: RGB, strength: int) -> Image.Image:
    """Soft radial light source, returned as an RGBA layer."""
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    steps = 48
    for i in range(steps, 0, -1):
        r = radius * i / steps
        value = round(strength * (1 - i / steps) ** 2)
        draw.ellipse(
            [center[0] - r, center[1] - r, center[0] + r, center[1] + r],
            fill=value,
        )
    mask = mask.filter(ImageFilter.GaussianBlur(radius * 0.12))
    layer = Image.new("RGBA", (W, H), color + (0,))
    layer.putalpha(mask)
    return layer


def hexagon_lattice(alpha: int) -> Image.Image:
    """Pointy-top hexagon outlines on a staggered grid."""
    layer = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(layer)
    r = 64 * SCALE
    hex_w = math.sqrt(3) * r
    hex_h = 1.5 * r
    row = 0
    y = -r
    while y < H + r:
        offset = hex_w / 2 if row % 2 else 0
        x = -hex_w + offset
        while x < W + hex_w:
            points = [
                (x + r * math.sin(math.radians(60 * k)), y + r * math.cos(math.radians(60 * k)))
                for k in range(6)
            ]
            draw.polygon(points, outline=(255, 255, 255, alpha), width=SCALE)
            x += hex_w
        y += hex_h
        row += 1
    return layer


def grid_overlay(alpha: int) -> Image.Image:
    layer = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(layer)
    step = 40 * SCALE
    for x in range(0, W + step, step):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, alpha), width=1)
    for y in range(0, H + step, step):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, alpha), width=1)
    return layer


def vignette(strength: int = 150) -> Image.Image:
    """Darken the frame edges so the center reads as the focal point."""
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    steps = 40
    for i in range(steps):
        t = i / steps
        inset = -int(W * 0.35 * (1 - t))
        draw.ellipse(
            [inset, inset - H * 0.1, W - inset, H - inset + H * 0.1],
            outline=round(strength * t / steps * 3),
            width=int(W * 0.35 / steps) + 2,
        )
    mask = mask.filter(ImageFilter.GaussianBlur(60))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.putalpha(mask)
    return layer


# --- icons ------------------------------------------------------------------


def draw_play(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, accent: RGB) -> None:
    r = size // 2
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent + (235,), width=5 * SCALE)
    draw.ellipse(
        [cx - r - 11 * SCALE, cy - r - 11 * SCALE, cx + r + 11 * SCALE, cy + r + 11 * SCALE],
        outline=accent + (70,),
        width=2 * SCALE,
    )
    t = r * 0.62
    draw.polygon(
        [
            (cx - t * 0.55, cy - t),
            (cx - t * 0.55, cy + t),
            (cx + t * 0.95, cy),
        ],
        fill=(255, 255, 255, 245),
    )


def draw_android(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, accent: RGB) -> None:
    fill = accent + (240,)
    body_w = size * 0.86
    head_h = body_w / 2

    # antennae
    for sign in (-1, 1):
        draw.line(
            [
                (cx + sign * body_w * 0.30, cy - head_h * 0.92),
                (cx + sign * body_w * 0.46, cy - head_h * 1.52),
            ],
            fill=fill,
            width=5 * SCALE,
        )

    # head dome
    head_box = [cx - body_w / 2, cy - head_h, cx + body_w / 2, cy + head_h]
    draw.pieslice(head_box, 180, 360, fill=fill)

    # eyes
    eye_r = size * 0.045
    for sign in (-1, 1):
        ex = cx + sign * body_w * 0.20
        ey = cy - head_h * 0.42
        draw.ellipse([ex - eye_r, ey - eye_r, ex + eye_r, ey + eye_r], fill=(12, 30, 28, 255))

    # torso
    gap = size * 0.06
    torso_top = cy + gap
    torso_h = size * 0.46
    draw.rounded_rectangle(
        [cx - body_w / 2, torso_top, cx + body_w / 2, torso_top + torso_h],
        radius=size * 0.07,
        fill=fill,
    )

    # arms
    arm_w = size * 0.115
    for sign in (-1, 1):
        ax = cx + sign * (body_w / 2 + size * 0.075)
        draw.rounded_rectangle(
            [ax - arm_w / 2, torso_top, ax + arm_w / 2, torso_top + torso_h * 0.82],
            radius=arm_w / 2,
            fill=fill,
        )

    # legs
    leg_w = size * 0.135
    for sign in (-1, 1):
        lx = cx + sign * body_w * 0.24
        draw.rounded_rectangle(
            [lx - leg_w / 2, torso_top + torso_h - leg_w / 2, lx + leg_w / 2, torso_top + torso_h + size * 0.16],
            radius=leg_w / 2,
            fill=fill,
        )


def draw_brain(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, accent: RGB) -> None:
    """Neural lattice: hexagonal node ring wired to a bright core."""
    r = size * 0.44
    nodes = [
        (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
        for a in range(-90, 270, 60)
    ]
    inner_r = r * 0.5
    inner = [
        (cx + inner_r * math.cos(math.radians(a)), cy + inner_r * math.sin(math.radians(a)))
        for a in range(-60, 300, 120)
    ]

    # outer ring outline
    draw.polygon(nodes, outline=accent + (110,), width=2 * SCALE)

    # synapses
    for p in nodes:
        draw.line([p, (cx, cy)], fill=accent + (95,), width=2 * SCALE)
    for p in inner:
        draw.line([p, (cx, cy)], fill=accent + (170,), width=3 * SCALE)
    for i, p in enumerate(inner):
        draw.line([p, nodes[(i * 2 + 1) % len(nodes)]], fill=accent + (130,), width=2 * SCALE)

    # node dots
    for p in nodes:
        nr = size * 0.045
        draw.ellipse([p[0] - nr, p[1] - nr, p[0] + nr, p[1] + nr], fill=accent + (235,))
    for p in inner:
        nr = size * 0.032
        draw.ellipse([p[0] - nr, p[1] - nr, p[0] + nr, p[1] + nr], fill=(255, 255, 255, 220))

    # core
    core = size * 0.10
    draw.ellipse([cx - core, cy - core, cx + core, cy + core], fill=(255, 255, 255, 250))
    halo = core * 1.75
    draw.ellipse([cx - halo, cy - halo, cx + halo, cy + halo], outline=accent + (150,), width=2 * SCALE)


ICONS = {"play": draw_play, "android": draw_android, "brain": draw_brain}


# --- composition ------------------------------------------------------------


def draw_window_dots(draw: ImageDraw.ImageDraw) -> None:
    """Faint traffic-light dots so the frame reads as an app window."""
    r = 5 * SCALE
    for i in range(3):
        x = 26 * SCALE + i * 18 * SCALE
        y = 24 * SCALE
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 46))


def draw_chips(
    draw: ImageDraw.ImageDraw, labels: list[str], cy: int, font: ImageFont.FreeTypeFont, accent: RGB
) -> None:
    pad_x, gap = 17 * SCALE, 11 * SCALE
    chip_h = 34 * SCALE

    widths = []
    for label in labels:
        box = draw.textbbox((0, 0), label, font=font)
        widths.append(box[2] - box[0] + pad_x * 2)

    x = (W - (sum(widths) + gap * (len(labels) - 1))) / 2
    for label, width in zip(labels, widths):
        draw.rounded_rectangle(
            [x, cy - chip_h / 2, x + width, cy + chip_h / 2],
            radius=chip_h / 2,
            fill=(255, 255, 255, 20),
            outline=accent + (120,),
            width=SCALE,
        )
        draw.text((x + width / 2, cy), label, font=font, fill=(255, 255, 255, 225), anchor="mm")
        x += width + gap


def render(preview: Preview) -> Image.Image:
    base = vertical_gradient(preview.top, preview.bottom).convert("RGBA")

    base.alpha_composite(hexagon_lattice(alpha=13))
    base.alpha_composite(grid_overlay(alpha=7))

    icon_cx, icon_cy = W // 2, int(H * 0.33)
    base.alpha_composite(radial_glow((icon_cx, icon_cy), int(W * 0.42), preview.glow, 110))
    base.alpha_composite(vignette())

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    draw_window_dots(draw)
    ICONS[preview.icon](draw, icon_cx, icon_cy, int(W * 0.16), preview.accent)

    title_font = ImageFont.truetype(FONT_BOLD, 62 * SCALE)
    subtitle_font = ImageFont.truetype(FONT_REGULAR, 24 * SCALE)
    chip_font = ImageFont.truetype(FONT_BOLD, 16 * SCALE)

    title_y = int(H * 0.60)
    draw.text((W / 2, title_y), preview.title, font=title_font, fill=(255, 255, 255, 252), anchor="mm")

    bar_w, bar_h = 72 * SCALE, 4 * SCALE
    bar_y = title_y + 48 * SCALE
    draw.rounded_rectangle(
        [W / 2 - bar_w / 2, bar_y, W / 2 + bar_w / 2, bar_y + bar_h],
        radius=bar_h / 2,
        fill=preview.accent + (235,),
    )

    draw.text(
        (W / 2, bar_y + 40 * SCALE),
        preview.subtitle,
        font=subtitle_font,
        fill=(255, 255, 255, 190),
        anchor="mm",
    )

    draw_chips(draw, preview.chips, bar_y + 96 * SCALE, chip_font, preview.accent)

    # bottom edge accent
    draw.rectangle([0, H - 5 * SCALE, W, H], fill=preview.accent + (215,))

    base.alpha_composite(layer)
    return base.convert("RGB").resize((WIDTH, HEIGHT), Image.LANCZOS)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for preview in PREVIEWS:
        path = OUT_DIR / preview.filename
        render(preview).save(path, optimize=True)
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
