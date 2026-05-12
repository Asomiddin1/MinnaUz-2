// video-data.ts

export const VIDEOS_DATABASE: Record<string, any> = {
  "1": {
    id: 1,
    category: "Yaponiyada hayot",
    title: "Yaponiyada talaba bo'lish: Oyiga qancha pul kerak? Yotoqxona, ovqat va yo'lkira",
    thumbnail: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=1200",
    description: "Bu videoda Yaponiyaga endi kelgan talabalar uchun oylik xarajatlar haqida batafsil ma'lumot beraman. Ijara, kommunal to'lovlar, oziq-ovqat va transport uchun qancha pul ketishini birgalikda hisoblaymiz.",
    transcript: [
      { id: 0, time: "00:00", text: "Hammaga salom! MinnaUz kanaliga xush kelibsiz." },
      { id: 1, time: "00:05", text: "Bugungi videoda Yaponiyada talaba bo'lish sirlarini ochamiz." },
      { id: 2, time: "00:12", text: "Ko'pchilik mendan 'Oyiga qancha pul kerak?' deb tez-tez so'raydi." }
    ]
  },
  "2": {
    id: 2,
    category: "Anime tili",
    title: "Anime orqali yapon tili: Naruto tildan tushmaydigan iboralar",
    thumbnail: "https://i.pinimg.com/1200x/ef/8f/1b/ef8f1b0850464b31162382955ee93c18.jpg",
    description: "Naruto animasidagi eng mashhur iboralar va kundalik hayotda ishlatiladigan so'zlarni o'rganamiz. Dattebayo nima degani?",
    transcript: [
      { id: 0, time: "00:00", text: "Dattebayo! Bugun Naruto tilini o'rganamiz." },
      { id: 1, time: "00:10", text: "Animelarda ishlatiladigan norasmiy nutq uslubi haqida gaplashamiz." }
    ]
  },
  "3": {
    id: 3,
    category: "Vloglar",
    title: "Yaponlar aslida nima yeydi? Tokyo ko'chalarida street-food sayohati",
    thumbnail: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&q=80&w=600",
    description: "Tokio ko'chalaridagi eng mazali va g'alati taomlar. Ramen, Takoyaki va boshqa street-foodlar narxi bilan tanishamiz.",
    transcript: [
      { id: 0, time: "00:00", text: "Hammaga salom, bugun biz Tokioning Shinjuku tumanidamiz." },
      { id: 1, time: "00:15", text: "Mana bu mashhur Takoyaki — sakkizoyoqli koptokchalar." }
    ]
  },
  "4": {
    id: 4,
    category: "Qiziqarli faktlar",
    title: "Yapon tilini 3 oyda o'rganish siri (Mening shaxsiy tajribam)",
    thumbnail: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=600",
    description: "Noldan boshlab qanday qilib qisqa vaqt ichida yapon tilida gapirishni boshlash mumkin? Mnemonika va tizimli yondashuv.",
    transcript: [
      { id: 0, time: "00:00", text: "Ko'pchilik til o'rganishni murakkab deb o'ylaydi." },
      { id: 1, time: "00:20", text: "Men sizga eng samarali 3 ta metodni ko'rsataman." }
    ]
  },
  "5": {
    id: 5,
    category: "Madaniyat",
    title: "Yaponiyadagi eng g'alati qoidalar: Nima uchun ko'chada axlat qutisi yo'q?",
    thumbnail: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&q=80&w=600",
    description: "Yaponiyaga kelgan sayyohlarni hayron qoldiradigan odob-axloq qoidalari va ijtimoiy normalar.",
    transcript: [
      { id: 0, time: "00:00", text: "Yaponiyada yashash oson emas, agar qoidalarni bilmasangiz." },
      { id: 1, time: "00:15", text: "Nima uchun poezdda telefonlashish mumkin emas?" }
    ]
  },
  "6": {
    id: 6,
    category: "Vloglar",
    title: "Samuraylar yurti: Kyotoga bir kunlik sayohat",
    thumbnail: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600",
    description: "Kyotoning tarixiy ko'chalari, ibodatxonalar va geyshalar tumanidan reportaj.",
    transcript: [
      { id: 0, time: "00:00", text: "Bugun biz Yaponiyaning qadimiy poytaxti Kyotodamiz." },
      { id: 1, time: "00:30", text: "Oltin ibodatxona (Kinkaku-ji) haqiqatdan ham hayratlanarli." }
    ]
  }
};

// Bu ro'yxat VideoPage (asosiy sahifa) uchun ishlatiladi
export const VIDEOS_LIST = Object.values(VIDEOS_DATABASE);