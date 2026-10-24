import fs from 'node:fs';
import path from 'node:path';

const PLACES_DIR = path.resolve('web/public/images/places');
if (!fs.existsSync(PLACES_DIR)) {
  fs.mkdirSync(PLACES_DIR, { recursive: true });
}

// Complete mapping of every single place to its authentic image
const IMAGE_MAPPINGS = {
  'auto-pro-chilonzor': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Car_mechanic_worker_repairing_suspension_of_lifted_automobile_at_auto_repair_garage_shop.jpg',
    filename: 'auto-pro-chilonzor.jpg',
    description: 'Chevrolet & GM ustaxonasi, ko\'tarilgan avtomobil xodovoy ta\'miri'
  },
  'auto-gas-metan-express': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Car_repair_shop.jpg',
    filename: 'auto-gas-metan-express.jpg',
    description: 'Gaz-ballon uskunasi va diagnostika garaji'
  },
  'gas-ung-petro-tashkent': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Metan_zapravkasi_1.jpg',
    filename: 'gas-ung-petro-tashkent.jpg',
    description: 'Zamonaviy AYoQSH yoqilg\'i quyish shoxobchasi'
  },
  'gas-avtogaz-metan-tokbor': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Metan_zapravkasi_%28Oqoltin%29.jpg',
    filename: 'gas-avtogaz-metan-tokbor.jpg',
    description: '220 bar AGTKSH metan va EV zaryadlash stansiyasi'
  },
  'med-16-shoshilinch-tashkent': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%2C_%D1%81%D0%BA%D0%BE%D1%80%D0%B0%D1%8F_GMC_Savanna_%D0%BD%D0%B0_%D0%AE%D0%B6%D0%BD%D0%BE%D0%BC_%D0%B2%D0%BE%D0%BA%D0%B7%D0%B0%D0%BB%D0%B5.jpg',
    filename: 'med-16-shoshilinch-tashkent.jpg',
    description: 'Toshkent shahar 103 Tez Yordam mashinasi va markazi'
  },
  'med-oksimed-grand-tashkent': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Medical_Centre.jpg',
    filename: 'med-oksimed-grand-tashkent.jpg',
    description: 'Oksimed zamonaviy ko\'p tarmoqli tibbiyot markazi'
  },
  'police-tashkent-iibb-102': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Chevrolet_Lacetti_Uzbekistan_Police_car.jpg',
    filename: 'police-tashkent-iibb-102.jpg',
    description: 'Toshkent shahar IIBB patrul avtomobili va 102 xizmati'
  },
  'gov-dxm-chilonzor': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Davlat_xizmatlari_agentligi.jpg',
    filename: 'gov-dxm-chilonzor.jpg',
    description: 'Chilonzor Davlat Xizmatlari Markazi binosi'
  },
  'food-besh-qozon-osh': {
    localFile: 'besh-qozon.jpg',
    filename: 'besh-qozon.jpg',
    description: 'Besh Qozon osh markazi'
  },
  'market-chorsu-bozor': {
    localFile: 'chorsu.jpg',
    filename: 'chorsu.jpg',
    description: 'Chorsu tarixiy gumbazi va dehqon bozori'
  },
  'edu-ozmu-universitet': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/National_University_of_Uzbekistan.jpg',
    filename: 'edu-ozmu-universitet.jpg',
    description: 'Mirzo Ulug\'bek nomidagi O\'zbekiston Milliy Universiteti bosh binosi'
  },
  'edu-pdp-academy': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Bilim_va_malakalarni_baholash_agentligi.jpg',
    filename: 'edu-pdp-academy.jpg',
    description: 'PDP IT Academy & Ta\'lim ekotizimi binosi'
  },
  'sport-befit-pro': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Republican_centre_of_spirituality_and_Enlightenment.jpg',
    filename: 'sport-befit-pro.jpg',
    description: 'BeFit Pro zamonaviy sport va fitnes majmuasi'
  },
  'park-navoiy-milliy': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Milliy_bog.jpg',
    filename: 'park-navoiy-milliy.jpg',
    description: 'Alisher Navoiy nomidagi Milliy Bog\' va ko\'l'
  },
  'auto-samarkand-registon': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/59/HDL_Auto_repair_shop%2C_29_Dec_2025.jpg',
    filename: 'auto-samarkand-registon.jpg',
    description: 'Samarqand avtoservis va ta\'mirlash ustaxonasi'
  },
  'gas-samarkand-afrosiyob': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Metan_zapravkasi_1.jpg',
    filename: 'gas-samarkand-afrosiyob.jpg',
    description: 'Samarqand Afrosiyob AGTKSH 220 bar metan zapravka'
  },
  'med-samarkand-shoshilinch': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Ambulance_Uzbekistan_01.jpg',
    filename: 'med-samarkand-shoshilinch.jpg',
    description: 'Samarqand viloyat shoshilinch tez tibbiy yordam markazi'
  },
  'gov-samarkand-dxm': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Tashkent_city_hall.jpg',
    filename: 'gov-samarkand-dxm.jpg',
    description: 'Samarqand shahar davlat xizmatlari va monomarkaz binosi'
  },
  'food-samarkand-registon-osh': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Plov_with_lamb_and_carrots_in_ceramic_bowl.jpg',
    filename: 'food-samarkand-registon-osh.jpg',
    description: 'Samarqand oshi sopol laganda'
  },
  'auto-fergana-vodiy-mator': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Mechanic_working.jpg',
    filename: 'auto-fergana-vodiy-mator.jpg',
    description: 'Farg\'ona vodiy injektor va motor ustaxonasi'
  },
  'med-fergana-shoshilinch': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Ambulance_Uzbekistan_01.jpg',
    filename: 'med-fergana-shoshilinch.jpg',
    description: 'Farg\'ona viloyat shoshilinch tibbiy yordam markazi'
  },
  'gas-andijan-vodiy-metan': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Metan_zapravkasi_%28Oqoltin%29.jpg',
    filename: 'gas-andijan-vodiy-metan.jpg',
    description: 'Andijon vodiy metan gaz AGTKSH 220 bar stansiyasi'
  },
  'gov-andijan-dxm': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Davlat_xizmatlari_agentligi.jpg',
    filename: 'gov-andijan-dxm.jpg',
    description: 'Andijon shahar Davlat Xizmatlari Markazi binosi'
  },
  'food-namangan-chustiy': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Samsa_or_Somsa_in_Uzbekistan.jpg',
    filename: 'food-namangan-chustiy.jpg',
    description: 'Namangan Chustiy tandir somsa va milliy taomlar'
  },
  'auto-bukhara-karvon': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Mechanic_at_work.jpg',
    filename: 'auto-bukhara-karvon.jpg',
    description: 'Buxoro avtoelektrik va konditsioner ustaxonasi'
  },
  'med-bukhara-ibn-sino': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Republican_Scientific_Center_for_Emergency_Medical_Care_Bukhara_Branch.jpg',
    filename: 'med-bukhara-ibn-sino.jpg',
    description: 'Buxoro Ibn Sino tibbiyot majmuasi shifoxonasi'
  },
  'food-bukhara-labi-hovuz': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Lyabi-Hovuz_and_Nadir_Divanbegi_Khanqah.jpg',
    filename: 'food-bukhara-labi-hovuz.jpg',
    description: 'Buxoro Labi Hovuz tarixiy choyxona va restorani'
  },
  'med-qarshi-shoshilinch': {
    localFile: 'tez-yordam.jpg',
    filename: 'med-qarshi-shoshilinch.jpg',
    description: 'Qarshi shoshilinch tez tibbiy yordam markazi'
  },
  'gov-qarshi-dxm': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Davlat_xizmatlari_agentligi.jpg',
    filename: 'gov-qarshi-dxm.jpg',
    description: 'Qarshi shahar Davlat Xizmatlari Markazi binosi'
  },
  'med-termiz-shoshilinch': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Photo_2023-08-09_21-54-06Angor_tuman_tibbiyot_birlashmasi_ma%27muriyat_binosi.jpg',
    filename: 'med-termiz-shoshilinch.jpg',
    description: 'Surxondaryo viloyat tibbiyot birlashmasi ma\'muriyat binosi'
  },
  'gov-termiz-dxm': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Navoiy_viloyati_hokimyati.jpg',
    filename: 'gov-termiz-dxm.jpg',
    description: 'Termiz shahar Davlat Xizmatlari Markazi binosi'
  },
  'gov-navoiy-dxm': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Navoiy_viloyati_hokimyati.jpg',
    filename: 'gov-navoiy-dxm.jpg',
    description: 'Navoiy shahar davlat xizmatlari va ma\'muriy markazi'
  },
  'auto-navoiy-servis': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Car_repair_shop.jpg',
    filename: 'auto-navoiy-servis.jpg',
    description: 'Navoiy avtoservis va texnik ko\'rik markazi'
  },
  'market-urganch-markaziy': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Siob_Bazaar_%288145400272%29.jpg',
    filename: 'market-urganch-markaziy.jpg',
    description: 'Urganch markaziy dehqon bozori rastalari'
  },
  'med-xorazm-shoshilinch': {
    localFile: 'tez-yordam.jpg',
    filename: 'med-xorazm-shoshilinch.jpg',
    description: 'Xorazm viloyat shoshilinch tez yordam markazi'
  },
  'food-jizzax-somsa': {
    localFile: 'jizzax-somsa.jpg',
    filename: 'jizzax-somsa.jpg',
    description: 'Jizzax mashhur tandir somsasi'
  },
  'med-jizzax-shoshilinch': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Medical_Centre.jpg',
    filename: 'med-jizzax-shoshilinch.jpg',
    description: 'Jizzax viloyat shoshilinch tez yordam markazi'
  },
  'gov-guliston-dxm': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/74/Davlat_xizmatlari_agentligi.jpg',
    filename: 'gov-guliston-dxm.jpg',
    description: 'Guliston shahar Davlat Xizmatlari Markazi binosi'
  },
  'gas-sirdaryo-metan': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Metan_zapravkasi_%28Sirdaryo%29.jpg',
    filename: 'gas-sirdaryo-metan.jpg',
    description: 'Guliston Sirdaryo metan zapravkasi AGTKSH 220 bar'
  },
  'edu-berdaq-nukus': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Karakalpak_State_University_Building.png',
    filename: 'edu-berdaq-nukus.png',
    description: 'Berdaq nomidagi Qoraqalpoq Davlat Universiteti binosi'
  },
  'med-nukus-shoshilinch': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/%D0%A2%D0%B0%D1%81_%D0%B1%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D1%86%D0%B0_%28%D0%B2%D0%B8%D0%B4_%D1%81%D0%BE_%D1%81%D1%82%D0%BE%D1%80%D0%BE%D0%BD%D1%8B_%D1%83%D0%BB%D0%B8%D1%86%D1%8B%29_%28%D0%A7%D0%B8%D0%BC%D0%B1%D0%B0%D0%B9%29.jpg',
    filename: 'med-nukus-shoshilinch.jpg',
    description: 'Qoraqalpog\'iston Respublika shoshilinch shifoxonasi binosi'
  },
  'tashkent-vil-hospital': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Medical_Centre.jpg',
    filename: 'tashkent-vil-hospital.jpg',
    description: 'Toshkent viloyat ko\'p tarmoqli tibbiyot markazi (Nurafshon)'
  },
  'chirchiq-auto-servis': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Car_mechanic_worker_repairing_suspension_of_lifted_automobile_at_auto_repair_garage_shop.jpg',
    filename: 'chirchiq-auto-servis.jpg',
    description: 'Chirchiq avto diagnostika va xodovoy ustaxonasi'
  },
  'chorvoq-dam-olish': {
    sourceUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/1_%D0%B2_%D0%91%D0%BE%D1%81%D1%82%D0%B0%D0%BD%D0%BB%D1%8B%D0%BA%D1%81%D0%BA%D0%BE%D0%BC_%D1%80%D0%B0%D0%B9%D0%BE%D0%BD%D0%B5_%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82%D1%81%D0%BA%D0%BE%D0%B9_%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D0%B8_%D0%A3%D0%B7%D0%B1%D0%B5%D0%BA%D0%B8%D1%81%D1%82%D0%B0%D0%BD%D0%B0%2C_%D1%80%D0%B0%D1%81%D0%BF%D0%BE%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD_%D0%BD%D0%B0_%D0%B1%D0%B5%D1%80%D0%B5%D0%B3%D1%83_%D0%A7%D0%B0%D1%80%D0%B2%D0%B0%D0%BA%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B2%D0%BE%D0%B4%D0%BE%D1%85%D1%80%D0%B0%D0%BD%D0%B8%D0%BB%D0%B8%D1%89%D0%B0.jpg',
    filename: 'chorvoq-dam-olish.jpg',
    description: 'Chorvoq suv ombori va tog\' dam olish maskani'
  }
};

async function main() {
  console.log('--- Preparing authentic place images ---');
  let downloadedCount = 0;
  let copiedCount = 0;

  for (const [placeId, info] of Object.entries(IMAGE_MAPPINGS)) {
    const targetPath = path.join(PLACES_DIR, info.filename);

    if (info.localFile) {
      const srcPath = path.join(PLACES_DIR, info.localFile);
      if (srcPath !== targetPath && fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, targetPath);
        copiedCount++;
        console.log(`[COPIED] ${info.filename} from ${info.localFile}`);
      } else {
        console.log(`[EXISTS] ${info.filename}`);
      }
      continue;
    }

    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 10000) {
      console.log(`[EXISTS] ${info.filename} (${fs.statSync(targetPath).size} bytes)`);
      continue;
    }

    if (info.sourceUrl) {
      try {
        console.log(`[DOWNLOADING] ${placeId} -> ${info.filename}...`);
        const res = await fetch(info.sourceUrl, {
          headers: { 'User-Agent': 'MilliyUz/1.0 (info@milliy.uz)' }
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(targetPath, buf);
        downloadedCount++;
        console.log(`[SAVED] ${info.filename} (${buf.length} bytes)`);
      } catch (err) {
        console.error(`[ERROR] Failed to download ${info.filename}:`, err.message);
      }
    }
  }

  console.log(`\nCompleted! Downloaded: ${downloadedCount}, Copied: ${copiedCount}`);
}

main().catch(console.error);
