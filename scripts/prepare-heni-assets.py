from pathlib import Path
from PIL import Image, ImageOps, ImageEnhance

src = Path('/home/ubuntu/upload/file_000000004440820ea87fa6ea8db255d6.png')
out = Path('/home/ubuntu/work/heni-tech/clean-source/assets/images')
out.mkdir(parents=True, exist_ok=True)
img = Image.open(src).convert('RGBA')
# Preserve the supplied design while fitting it cleanly into square Android assets.
img = ImageOps.fit(img, (2048, 2048), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
img = ImageEnhance.Sharpness(img).enhance(1.18)
img.save(out / 'icon.png', optimize=True)
img.resize((1024, 1024), Image.Resampling.LANCZOS).save(out / 'android-icon-foreground.png', optimize=True)
img.resize((1024, 1024), Image.Resampling.LANCZOS).save(out / 'splash-icon.png', optimize=True)
# Monochrome source keeps transparency and converts visible artwork to white.
mono = Image.new('RGBA', img.size, (0, 0, 0, 0))
a = img.getchannel('A')
mono.putalpha(a)
white = Image.new('RGBA', img.size, (255, 255, 255, 0))
white.putalpha(a)
white.resize((1024, 1024), Image.Resampling.LANCZOS).save(out / 'android-icon-monochrome.png', optimize=True)
# Adaptive background is navy, matching the app brand.
Image.new('RGBA', (1024, 1024), (11, 27, 43, 255)).save(out / 'android-icon-background.png', optimize=True)
print(out)
