"""Split the fixed source photographs into depth layers (RGBA PNGs) for the renderer.

Run from the iol-sim folder:  python tools/prepare_scenes.py
Requires Pillow. Masks are hand-traced polygons in source-pixel coordinates (1280 px wide sources),
feathered by 1.5 px. Output is written to assets/layers/. Deterministic: same input -> same output.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'assets' / 'source', ROOT / 'assets' / 'layers'
OUT.mkdir(parents=True, exist_ok=True)
WORK_W = 960  # working width used by the renderer
FEATHER = 1.5


def mask(size, polys=(), ellipses=(), strokes=()):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon(p, fill=255)
    for e in ellipses:
        d.ellipse(e, fill=255)
    for pts, width in strokes:
        d.line(pts, fill=255, width=width, joint='curve')
    return m


def save_layer(img, m, name):
    w = WORK_W
    h = round(img.height * w / img.width)
    rgba = img.convert('RGB').resize((w, h), Image.LANCZOS)
    a = m.filter(ImageFilter.GaussianBlur(FEATHER)).resize((w, h), Image.LANCZOS)
    rgba.putalpha(a)
    rgba.save(OUT / name)
    print('wrote', name, w, h)


# --- Day: CC BY 2.0 Chicago taxi, view from behind the front seats (1024 x 683 source) -----------
day = Image.open(SRC / 'day_chicago_taxi_ccby2.jpg').convert('RGB')
size = day.size
# Privacy: blur the only legible-sized number plate (car ahead, left of the meter).
for box in [(333, 334, 362, 349)]:
    day.paste(day.crop(box).filter(ImageFilter.GaussianBlur(3)), box[:2])
# Street seen through the windshield (vehicles ~5-15 m, buildings beyond): far layer.
# Lower-left edge follows the top of the steering-wheel rim (inside the rim is the instrument hood).
glass = mask(size, polys=[[(0, 150), (100, 145), (300, 138), (600, 135), (800, 145), (962, 160),
                            (893, 412), (600, 398), (360, 388), (250, 390), (240, 380), (220, 362), (190, 349),
                            (150, 340), (100, 344), (80, 351), (50, 366), (30, 345), (0, 338)]])
# Interior objects that sit in front of the windshield (they belong to the interior layer).
in_front = mask(size,
    polys=[[(323, 215), (330, 205), (520, 212), (528, 240), (518, 262), (330, 248)],  # rear-view mirror
           [(395, 188), (418, 188), (418, 206), (395, 206)],  # mirror mount
           [(358, 382), (400, 380), (402, 350), (445, 350), (447, 368), (490, 366), (500, 380), (505, 420), (358, 420)],  # fare meter
           [(828, 295), (845, 283), (920, 300), (905, 325), (838, 318)],  # cards on the dash
           [(830, 330), (900, 332), (895, 360), (832, 358)], [(815, 360), (885, 365), (875, 390), (815, 388)],
           [(805, 384), (860, 386), (858, 402), (805, 400)]],
    strokes=[([(420, 258), (428, 290), (440, 316)], 8)])  # mirror strap
outside = ImageChops.subtract(glass, in_front)
interior = ImageChops.subtract(Image.new('L', size, 255), outside)
save_layer(day, Image.new('L', size, 255), 'day_street.png')  # opaque base; visible only through the glass
save_layer(day, interior, 'day_interior.png')

# --- Night: CC BY-SA 4.0 street in Crete ---------------------------------------------------
night = Image.open(SRC / 'night_crete_street_ccbysa4.jpg').convert('RGB')
# Privacy: blur readable number plates in the source before any use.
for box in [(922, 688, 975, 708), (458, 642, 490, 656), (700, 630, 724, 642), (40, 700, 70, 712)]:
    night.paste(night.crop(box).filter(ImageFilter.GaussianBlur(4)), box[:2])
# Whole frame is one layer: all content is >= ~6 m (<= 0.17 D), i.e. optical distance.
save_layer(night, Image.new('L', night.size, 255), 'night_street.png')
# Emissive layer: light sources are clipped in the photo. Pixels whose brightest channel is >= 245
# are treated as light sources; the renderer adds them again x HDR gain (same for every lens).
lum = night.split()
mx = ImageChops.lighter(ImageChops.lighter(lum[0], lum[1]), lum[2])
lights = mx.point(lambda v: 255 if v >= 245 else 0)
save_layer(night, lights, 'night_lights.png')
# Coverage report for documentation.
w, h = night.size
print('light-source pixels:', sum(1 for v in lights.getdata() if v), 'of', w * h)
