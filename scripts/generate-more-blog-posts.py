import os
import json

ADDITIONAL_POSTS = [
    {
        "slug": "denizli-dijital-pazarlama-ajansi-neden-dou-social",
        "title": "Denizli Dijital Pazarlama Ajansı: Neden DOU Social ile Çalışmalısınız?",
        "seoTitle": "Denizli Dijital Pazarlama Ajansı: DOU Social ile Büyüyün (2026)",
        "description": "Denizli'de işletmenizi dijital dünyada liderliğe taşıyacak stratejik dijital pazarlama, Meta Ads, SEO ve video prodüksiyon çözümleri.",
        "date": "2026-08-15",
        "author": "DOU Social",
        "tags": ["Denizli Reklam Ajansı", "Dijital Pazarlama", "Denizli"],
        "cover": "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop",
        "content": """Denizli; güçlü sanayisi, tekstil ihracatı, doğal taş ocakları ve hareketli yerel perakende sektörüyle Ege Bölgesi'nin en dinamik ticaret merkezlerinden biridir. Ancak bugün geleneksel yöntemlerle müşteri bulmak her zamankinden daha pahalı ve zor.

DOU Social, Denizli'deki markaların sadece yerel pazarda değil, tüm Türkiye'de ve küresel pazarlarda en yüksek karlılıkla büyümesini sağlayan yeni nesil bir dijital büyüme ajansıdır.

## Neden DOU Social?

- **Veri Odaklı ve Şeffaf Reklam Yönetimi:** Harcanan her 1 TL'nin getirisini (ROAS) şeffaf olarak raporluyoruz.
- **Kendi Stüdyomuz ve Ekipmanlarımız:** Fotoğraf ve dikey video çekimlerini Denizli'deki işletmenizde bizzat profesyonel ekibimizle gerçekleştiriyoruz.
- **360 Derece Entegre Çözümler:** Web tasarım, SEO, Meta Ads, Google Ads ve Influencer pazarlamasını tek elden koordine ediyoruz."""
    },
    {
        "slug": "denizli-e-ticaret-ve-shopify-danismanligi",
        "title": "Denizli E-Ticaret ve Shopify Danışmanlığı: Sıfırdan Milyonluk Cirolara",
        "seoTitle": "Denizli E-Ticaret Danışmanlığı & Shopify Kurulumu 2026",
        "description": "Denizli'deki üretici ve mağazalar için Shopify kurulumu, e-ticaret altyapısı, kargo-ödeme entegrasyonu ve dijital satış optimizasyonu.",
        "date": "2026-08-14",
        "author": "DOU Social",
        "tags": ["E-Ticaret", "Shopify", "Denizli"],
        "cover": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
        "content": """Fiziksel mağazanız veya fabrikanız ne kadar büyük olursa olsun, dijitalde 7/24 satış yapan modern bir e-ticaret siteniz yoksa pazar payınız her geçen gün daralır.

## E-Ticarette Başarılı Olmanın 4 Temel Adımı

1. **Hızlı ve Güvenilir Altyapı:** Shopify veya Next.js tabanlı, mobil cihazlarda 1 saniyenin altında açılan modern e-ticaret mağazası.
2. **Kusursuz Ürün Fotoğrafları ve Videoları:** Müşterinin ürünü elinde tutuyormuş gibi hissetmesini sağlayan detaylı görseller.
3. **Katalog ve Dinamik Meta Reklamları:** Sepete ürün ekleyip almayan kullanıcılara özel dinamik hatırlatma kampanyaları.
4. **Sorunsuz Ödeme ve Kargo:** İyzico, PayTR ve otomatik kargo barkodu entegrasyonları ile sıfır operasyonel hata."""
    },
    {
        "slug": "denizli-kurumsal-kimlik-ve-logo-tasarimi-ajansi",
        "title": "Denizli Kurumsal Kimlik ve Logo Tasarımı: Markanıza Prestij Katın",
        "seoTitle": "Denizli Kurumsal Kimlik & Logo Tasarımı Ajansı 2026",
        "description": "Denizli'deki şirketler için akılda kalıcı logo tasarımı, kurumsal kimlik kılavuzu, katalog ve ambalaj tasarımı hizmetleri.",
        "date": "2026-08-12",
        "author": "DOU Social",
        "tags": ["Kurumsal Kimlik", "Logo Tasarım", "Denizli", "Marka"],
        "cover": "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop",
        "content": """Müşterilerinizin şirketiniz hakkında edindiği ilk izlenim logonuz ve görsel kimliğinizdir. Amatör bir logo, ürünleriniz ne kadar kaliteli olursa olsun markanızı ucuz gösterir.

DOU Social tasarım ekibi; marka konumlandırmanıza uygun, modern, tipografik dengesi kusursuz kurumsal kimlik sistemleri tasarlar."""
    },
    {
        "slug": "denizli-organize-sanayi-dosb-ihracat-dijital-pazarlama",
        "title": "Denizli Organize Sanayi (DOSB) Firmaları İçin B2B İhracat Pazarlaması",
        "seoTitle": "Denizli OSB İhracat Pazarlaması ve B2B Dijital Stratejiler 2026",
        "description": "Denizli OSB ve sanayi firmaları için Avrupa, Amerika ve Orta Doğu pazarlarına yönelik çok dilli B2B ihracat reklamları ve web siteleri.",
        "date": "2026-08-11",
        "author": "DOU Social",
        "tags": ["Sanayi", "DOSB", "İhracat", "Denizli", "B2B"],
        "cover": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop",
        "content": """Geleneksel yurt dışı fuarları yılda 1-2 kez yapılır ve yüzbinlerce liralık bütçe gerektirir. Oysa dijital B2B pazarlama ile 365 gün boyunca hedef ülkelerdeki satın alma müdürlerine ve distribütörlere doğrudan ulaşabilirsiniz.

DOU Social, Denizli Organize Sanayi Bölgesi'ndeki üreticilere çok dilli SEO, Google Ads ve LinkedIn lead generation kampanyaları kurar."""
    },
    {
        "slug": "denizli-video-produksiyon-ve-drone-cekim-hizmetleri",
        "title": "Denizli Video Prodüksiyon, Tanıtım Filmi ve 4K Drone Çekimi",
        "seoTitle": "Denizli Tanıtım Filmi & Profesyonel Drone Video Çekimi (2026)",
        "description": "Fabrika tanıtım filmleri, kurumsal videolar, mekan ve sosyal medya Reels çekimleri için Denizli'de profesyonel prodüksiyon ekibi.",
        "date": "2026-08-09",
        "author": "DOU Social",
        "tags": ["Video Prodüksiyon", "Tanıtım Filmi", "Drone", "Denizli"],
        "cover": "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=1200&auto=format&fit=crop",
        "content": """Görsel anlatımın en güçlü biçimi sinematik video prodüksiyonudur. Bir fabrikanın üretim kapasitesini, bir kliniğin hijyen standartlarını veya bir restoranın lezzetini en net video gösterir.

DOU Social prodüksiyon ekibi; 4K sinema kameraları, lisanslı drone operatörleri ve profesyonel ışık/ses donanımıyla Denizli'deki markalara değer katar."""
    },
    {
        "slug": "denizli-avukat-ve-hukuk-burolari-icin-web-tasarim-ve-seo",
        "title": "Denizli Avukat ve Hukuk Büroları İçin Web Tasarım ve SEO Rehberi",
        "seoTitle": "Denizli Hukuk Büroları & Avukatlar İçin SEO & Web Tasarım",
        "description": "Baro reklam yasağına ve meslek etiğine tam uyumlu, kurumsal avukat web siteleri ve bilgilendirici hukuk makaleleri SEO stratejisi.",
        "date": "2026-08-07",
        "author": "DOU Social",
        "tags": ["Hukuk", "Avukat", "SEO", "Denizli"],
        "cover": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop",
        "content": """Avukatlık Kanunu ve Baro reklam kurallarına tam uyumlu olarak, müvekkil adaylarına hukuki bilgilendirme sunan kurumsal web siteleri ve Google organik SEO çalışmaları hazırlıyoruz."""
    },
    {
        "slug": "denizli-mimarlik-ve-ic-mimarlik-ofisleri-icin-dijital-pazarlama",
        "title": "Denizli Mimarlık ve İç Mimarlık Ofisleri İçin Portfolyo ve Dijital Büyüme",
        "seoTitle": "Denizli İç Mimarlık & Mimarlık Ofisleri Dijital Pazarlama 2026",
        "description": "İç mimarlar ve mimarlık ofisleri için lüks proje portfolyosu, estetik Instagram yönetimi ve yüksek bütçeli villa/konut müşterisi kazanımı.",
        "date": "2026-08-05",
        "author": "DOU Social",
        "tags": ["Mimarlık", "İç Mimarlık", "Denizli", "Lüks"],
        "cover": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
        "content": """Mimarlık ve iç mimarlık sektöründe müşteri doğrudan estetiği, detay özenini ve uygulama kalitesini satın alır.

Proje öncesi/sonrası videoları, 3D render sunumları ve mimari şantiyeleri anlatan editoryal içeriklerle Denizli ve çevre illerdeki villa, konut ve ticari proje sahiplerine ulaşıyoruz."""
    },
    {
        "slug": "denizli-mobilya-ve-dekorasyon-markalari-icin-sosyal-medya-reklamlari",
        "title": "Denizli Mobilya ve Dekorasyon Markaları İçin Sosyal Medya ve Satış Stratejileri",
        "seoTitle": "Denizli Mobilya & Dekorasyon Dijital Pazarlama Rehberi 2026",
        "description": "Mobilya üreticileri ve showroomları için mağaza trafiğini artıran yerel reklamlar, katalog çekimleri ve WhatsApp sipariş hunileri.",
        "date": "2026-08-03",
        "author": "DOU Social",
        "tags": ["Mobilya", "Dekorasyon", "Denizli", "Sosyal Medya"],
        "cover": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
        "content": """Evlenecek çiftler, evini yenileyenler ve yeni konut alanlar mobilya tercihlerini ilk olarak Instagram ve web siteleri üzerinden araştırır.

Etkileyici showroom çekimleri, kumaş/doku yakın planları ve 'Showroom'a Özel İndirim' Meta Ads kampanyalarıyla mağaza ziyaretlerinizi katlayın."""
    }
]

output_dir = "/Users/efekan/Downloads/dou-social-wizard-main/content/blog/tr"

for p in ADDITIONAL_POSTS:
    filepath = os.path.join(output_dir, f"{p['slug']}.mdx")
    tags_str = json.dumps(p["tags"], ensure_ascii=False)
    mdx_content = f"""---
title: "{p['title']}"
seoTitle: "{p['seoTitle']}"
description: "{p['description']}"
date: "{p['date']}"
author: "{p['author']}"
tags: {tags_str}
cover: "{p['cover']}"
---

{p['content'].strip()}
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(mdx_content)

print(f"Successfully generated {len(ADDITIONAL_POSTS)} additional SEO & Geo blog posts.")
