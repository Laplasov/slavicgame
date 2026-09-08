export const itemData = {
  defaultOutfit: {
    Kettle: "defaultKettle",
    Top: "defaultTop",
    Bottom: "defaultBottom",
    Tights: "defaultTights"
  },
  items: [
    
    // ==========================================
    // 1. STARTING OUTFIT (Always Owned by Default)
    // ==========================================
    {
      id: "1.1",
      name: "Ошейник",
      iconKey: "kettleIcon",
      layerKey: "defaultKettle",
      cost: 100,
      type: "Kettle",
      isPurchased: true,
      description: "",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "1.2",
      name: "Черный топ",
      iconKey: "topIcon",
      layerKey: "defaultTop",
      cost: 100,
      type: "Top",
      isPurchased: true,
      description: "",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "1.3",
      name: "Красная юбка",
      iconKey: "bottomIcon",
      layerKey: "defaultBottom",
      cost: 100,
      type: "Bottom",
      isPurchased: true,
      description: "",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "1.4",
      name: "Рваные колготки",
      iconKey: "tightsIcon",
      layerKey: "defaultTights",
      cost: 100,
      type: "Tights",
      isPurchased: true,
      description: "",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 0 }
    },

    // ==========================================
    // 2. "ГОЛЫЙ" BUFF ITEMS
    // ==========================================
    {
      id: "2.1",
      name: "Голый",
      iconKey: "nakedIcon",
      layerKey: null,
      cost: 100,
      type: "Kettle",
      isPurchased: false,
      description: "+ 5% шанса крита.",
      bonuses: { click: 0, crit: 0.05, passive: 0, mood: 0 }
    },
    {
      id: "2.2",
      name: "Голый",
      iconKey: "nakedIcon",
      layerKey: null,
      cost: 100,
      type: "Top",
      isPurchased: false,
      description: "+ 1 за клик.",
      bonuses: { click: 1, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "2.3",
      name: "Голый",
      iconKey: "nakedIcon",
      layerKey: null,
      cost: 100,
      type: "Bottom",
      isPurchased: false,
      description: "+ 2 сердеца в секунду.",
      bonuses: { click: 0, crit: 0, passive: 3, mood: 0 }
    },
    {
      id: "2.4",
      name: "Голый",
      iconKey: "nakedIcon",
      layerKey: null,
      cost: 100,
      type: "Tights",
      isPurchased: false,
      description: "+ 1 к лимиту настроения.",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 1.0 }
    },
    // ==========================================
    // 3. HIPSTER OUTFIT (Configurable Collection)
    // ==========================================
    {
      id: "3.1",
      name: "Хиптерская шапочка",
      iconKey: "hipsterKettleIcon",
      layerKey: "hipsterKettle",
      cost: 200,
      type: "Kettle",
      isPurchased: false,
      description: "+ 5% шанса крита.",
      bonuses: { click: 0, crit: 0.05, passive: 0, mood: 0 }
    },
    {
      id: "3.2",
      name: "Хиптерская куртка",
      iconKey: "hipsterTopIcon",
      layerKey: "hipsterTop",
      cost: 200,
      type: "Top",
      isPurchased: false,
      description: "+ 1 за клик.",
      bonuses: { click: 1, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "3.3",
      name: "Шортики",
      iconKey: "hipsterBottomIcon",
      layerKey: "hipsterBottom",
      cost: 200,
      type: "Bottom",
      isPurchased: false,
      description: "+ 2 сердеца в секунду.",
      bonuses: { click: 0, crit: 0, passive: 2, mood: 0 }
    },
    {
      id: "3.4",
      name: "Хиптерские колготки",
      iconKey: "hipsterTightsIcon",
      layerKey: "hipsterTights",
      cost: 200,
      type: "Tights",
      isPurchased: false,
      description: "+ 1 к лимиту настроения.",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 1.0 }
    },

     // ==========================================
    // 4. DakakimuraOutfit OUTFIT (Configurable Collection)
    // ==========================================
    {
      id: "4.1",
      name: "Чокер",
      iconKey: "homeKettleIcon",
      layerKey: "homeKettle",
      cost: 400,
      type: "Kettle",
      isPurchased: false,
      description: "+ 5% шанса крита.",
      bonuses: { click: 0, crit: 0.05, passive: 0, mood: 0 }
    },
    {
      id: "4.2",
      name: "Хиптерская куртка",
      iconKey: "homeTopIcon",
      layerKey: "homeTop",
      cost: 400,
      type: "Top",
      isPurchased: false,
      description: "+ 1 за клик.",
      bonuses: { click: 1, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "4.3",
      name: "Шортики",
      iconKey: "homeBottomIcon",
      layerKey: "homeBottom",
      cost: 400,
      type: "Bottom",
      isPurchased: false,
      description: "+ 2 сердеца в секунду.",
      bonuses: { click: 0, crit: 0, passive: 2, mood: 0 }
    },
    {
      id: "4.4",
      name: "Хиптерские колготки",
      iconKey: "homeTightsIcon",
      layerKey: "homeTights",
      cost: 400,
      type: "Tights",
      isPurchased: false,
      description: "+ 1 к лимиту настроения.",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 1.0 }
    },

     // ==========================================
    // 5. Maig OUTFIT (Configurable Collection)
    // ==========================================
    {
      id: "5.1",
      name: "Кроличьи уши",
      iconKey: "maidKettleIcon",
      layerKey: "maidKettle",
      cost: 800,
      type: "Kettle",
      isPurchased: false,
      description: "+ 5% шанса крита.",
      bonuses: { click: 0, crit: 0.05, passive: 0, mood: 0 }
    },
    {
      id: "5.2",
      name: "Майд костюм",
      iconKey: "maidTopIcon",
      layerKey: "maidTop",
      cost: 800,
      type: "Top",
      isPurchased: false,
      description: "+ 1 за клик.",
      bonuses: { click: 1, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "5.3",
      name: "Майд юбка",
      iconKey: "maidBottomIcon",
      layerKey: "maidBottom",
      cost: 800,
      type: "Bottom",
      isPurchased: false,
      description: "+ 2 сердеца в секунду.",
      bonuses: { click: 0, crit: 0, passive: 2, mood: 0 }
    },
    {
      id: "5.4",
      name: "Майд колготки",
      iconKey: "maidTightsIcon",
      layerKey: "maidTights",
      cost: 800,
      type: "Tights",
      isPurchased: false,
      description: "+ 1 к лимиту настроения.",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 1.0 }
    },

    // ==========================================
    // 6. Alt OUTFIT (Configurable Collection)
    // ==========================================
    {
      id: "6.1",
      name: "Шапочка альтушки",
      iconKey: "altKettleIcon",
      layerKey: "altKettle",
      cost: 1200,
      type: "Kettle",
      isPurchased: false,
      description: "+ 5% шанса крита.",
      bonuses: { click: 0, crit: 0.05, passive: 0, mood: 0 }
    },
    {
      id: "6.2",
      name: "Кофтачка альтушки",
      iconKey: "altTopIcon",
      layerKey: "altTop",
      cost: 1200,
      type: "Top",
      isPurchased: false,
      description: "+ 1 за клик.",
      bonuses: { click: 1, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "6.3",
      name: "Юбочка алтушки",
      iconKey: "altBottomIcon",
      layerKey: "altBottom",
      cost: 1200,
      type: "Bottom",
      isPurchased: false,
      description: "+ 2 сердеца в секунду.",
      bonuses: { click: 0, crit: 0, passive: 2, mood: 0 }
    },
    {
      id: "6.4",
      name: "Колготочки альтушки",
      iconKey: "altTightsIcon",
      layerKey: "altTights",
      cost: 1200,
      type: "Tights",
      isPurchased: false,
      description: "+ 1 к лимиту настроения.",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 1.0 }
    },
    // ==========================================
    // 7. Office OUTFIT (Configurable Collection)
    // ==========================================
    {
      id: "7.1",
      name: "Белая рубашка",
      iconKey: "officeTopIcon",
      layerKey: "officeTop",
      cost: 1500,
      type: "Top",
      isPurchased: false,
      description: "",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "7.2",
      name: "Офисная юбка",
      iconKey: "officeBottomIcon",
      layerKey: "officeBottom",
      cost: 1500,
      type: "Bottom",
      isPurchased: false,
      description: "",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 0 }
    },
    {
      id: "7.3",
      name: "Колготочки строгие",
      iconKey: "officeTightsIcon",
      layerKey: "officeTights",
      cost: 1500,
      type: "Tights",
      isPurchased: false,
      description: "",
      bonuses: { click: 0, crit: 0, passive: 0, mood: 0 }
    },
  ]
};