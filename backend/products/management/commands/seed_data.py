import io
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from PIL import Image, ImageDraw, ImageFont
from products.models import Category, Product
from orders.models import Coupon

User = get_user_model()

# A distinct background color per category, used as a fallback if the photo download fails
CATEGORY_COLORS = {
    'Electronics': '#1F4B3F',
    'Fashion': '#B3432B',
    'Home & Kitchen': '#E3A008',
    'Books': '#2C548C',
    'Sports': '#6B4F9E',
}


def fetch_real_photo(keyword):
    """Downloads a real, royalty-free stock photo matching `keyword` from LoremFlickr
    (a free keyword-based photo service, no API key needed). `keyword` can be comma-separated
    tags (e.g. 'headphones,audio') for a more specific match. Returns a ContentFile,
    or None if the download fails (e.g. no internet access)."""
    try:
        url = f'https://loremflickr.com/600/600/{keyword}'
        response = requests.get(url, timeout=8)
        response.raise_for_status()
        safe_name = keyword.replace(',', '-')
        return ContentFile(response.content, name=f'{safe_name}.jpg')
    except Exception:
        return None


def generate_placeholder_image(product_name, category_name):
    """Fallback: a simple 600x600 colored square with the product name on it,
    used only if the real photo download fails (e.g. no internet access)."""
    color = CATEGORY_COLORS.get(category_name, '#7A7568')
    img = Image.new('RGB', (600, 600), color=color)
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype('DejaVuSans-Bold.ttf', 42)
    except Exception:
        font = ImageFont.load_default()

    words = product_name.split()
    lines, current = [], ''
    for word in words:
        test = f'{current} {word}'.strip()
        if draw.textlength(test, font=font) > 480:
            lines.append(current)
            current = word
        else:
            current = test
    lines.append(current)

    total_height = len(lines) * 52
    y = (600 - total_height) // 2
    for line in lines:
        w = draw.textlength(line, font=font)
        draw.text(((600 - w) / 2, y), line, fill='white', font=font)
        y += 52

    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=85)
    buffer.seek(0)
    return ContentFile(buffer.read(), name=f"{product_name.lower().replace(' ', '-')}.jpg")


class Command(BaseCommand):
    help = 'Seeds the database with sample categories, products (with real stock photos), a coupon, and an admin user.'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin12345')
            self.stdout.write(self.style.SUCCESS('Created superuser: admin / admin12345'))

        categories_data = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports']
        categories = {}
        for name in categories_data:
            cat, _ = Category.objects.get_or_create(name=name, slug=name.lower().replace(' & ', '-').replace(' ', '-'))
            categories[name] = cat

        # (name, category, price, discount_price, stock, search keyword for the photo)
        products_data = [
            ('Wireless Headphones', 'Electronics', 2499, 1999, 25, 'headphones,audio'),
            ('Smartphone Stand', 'Electronics', 499, None, 100, 'phone,stand'),
            ('Cotton T-Shirt', 'Fashion', 599, 449, 60, 'tshirt,cotton'),
            ('Denim Jacket', 'Fashion', 2999, None, 15, 'denim,jacket'),
            ('Non-stick Pan Set', 'Home & Kitchen', 1799, 1499, 30, 'fryingpan,kitchen'),
            ('LED Desk Lamp', 'Home & Kitchen', 899, None, 40, 'desklamp,lamp'),
            ('Python Programming Guide', 'Books', 799, 599, 50, 'book,programming'),
            ('Mystery Novel', 'Books', 349, None, 70, 'book,novel'),
            ('Yoga Mat', 'Sports', 999, 799, 45, 'yoga,mat'),
            ('Football', 'Sports', 1299, None, 20, 'football,soccerball'),
        ]

        self.stdout.write('Downloading product photos (falls back to a generated placeholder per item if offline)…')

        for name, cat_name, price, discount, stock, keyword in products_data:
            slug = name.lower().replace(' ', '-')
            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults=dict(
                    name=name, category=categories[cat_name], description=f'High quality {name.lower()}.',
                    price=price, discount_price=discount, stock=stock,
                )
            )
            if not product.image:
                photo = fetch_real_photo(keyword)
                if photo:
                    product.image.save(f'{slug}.jpg', photo, save=True)
                    self.stdout.write(f'  ✓ {name}: real photo downloaded')
                else:
                    product.image.save(f'{slug}.jpg', generate_placeholder_image(name, cat_name), save=True)
                    self.stdout.write(f'  ⚠ {name}: download failed, used a placeholder instead')

        Coupon.objects.get_or_create(code='WELCOME10', defaults={'discount_percent': 10, 'active': True})

        self.stdout.write(self.style.SUCCESS('Sample data seeded successfully.'))
