const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DATA = [
  // North-Central
  {
    zone: 'North-Central',
    state: 'Niger',
    risk: 'CRITICAL',
    primary_threats:
      'Threat of renewed banditry in Shiroro, Rafi, Mariga and Borgu. Political thuggery in Minna, Kontagora',
    hotspots_lga:
      'Shiroro, Rafi, Mariga, Borgu, Agwara, kontagora, Minna',
  },
  {
    zone: 'North-Central',
    state: 'Benue',
    risk: 'HIGH',
    primary_threats:
      'Communal violence, displacements and Political intolerance',
    hotspots_lga: 'Makurdi, Yelewata, Kwande, Guma.',
  },
  {
    zone: 'North-Central',
    state: 'Plateau',
    risk: 'HIGH',
    primary_threats:
      'Ethnic and religious tensions and political intolerance',
    hotspots_lga: 'Jos, Riyom, Barkin Ladi, Wase.',
  },
  {
    zone: 'North-Central',
    state: 'Kwara',
    risk: 'HIGH',
    primary_threats:
      'Banditry spillover; mass abduction in the rural communities, political intolerance',
    hotspots_lga: 'Kaiama, Baruten, Patigi. Ilorin metropolis',
  },
  {
    zone: 'North-Central',
    state: 'Kogi',
    risk: 'ELEVATED',
    primary_threats: 'Political thuggery/ intolerance',
    hotspots_lga: 'Ofu, Ankpa, Lokoja, Anyigba.',
  },
  {
    zone: 'North-Central',
    state: 'Nasarawa',
    risk: 'ELEVATED',
    primary_threats:
      'Communal clashes/political intolerance/thuggery and bandit movement.',
    hotspots_lga: 'Keffi, Doma, Awe, Lafia',
  },
  {
    zone: 'North-Central',
    state: 'FCT Abuja',
    risk: 'ELEVATED',
    primary_threats:
      'Political violence, fake news misinformation and protest risk,',
    hotspots_lga:
      'Abuja metropolis, Kuje, Gwagwalada and some satellite towns.',
  },

  // North-East
  {
    zone: 'North-East',
    state: 'Borno',
    risk: 'CRITICAL',
    primary_threats:
      'Boko Haram/ISWAP resurgence, attacks on worship centers, markets and military installations.',
    hotspots_lga: 'Maiduguri, Monguno, Bama, Lake Chad',
  },
  {
    zone: 'North-East',
    state: 'Adamawa',
    risk: 'HIGH',
    primary_threats:
      'Insurgent spillover, communal clashes and political violence.',
    hotspots_lga: 'Southern Adamawa, Mubi axis and Yola',
  },
  {
    zone: 'North-East',
    state: 'Yobe',
    risk: 'HIGH',
    primary_threats:
      'ISWAP infiltration from Borno, likely highway ambushes, and political violence',
    hotspots_lga: 'Damaturu, Geidam, Gujba.',
  },
  {
    zone: 'North-East',
    state: 'Taraba',
    risk: 'HIGH',
    primary_threats: 'Communal violence, banditry, thuggery',
    hotspots_lga: 'Southern Taraba, Wukari, Donga.',
  },
  {
    zone: 'North-East',
    state: 'Bauchi',
    risk: 'ELEVATED',
    primary_threats: 'Banditry spillover and political thuggery.',
    hotspots_lga: 'Azare, Bauchi, Misau.',
  },
  {
    zone: 'North-East',
    state: 'Gombe',
    risk: 'ELEVATED',
    primary_threats: 'Political thuggery and political violence.',
    hotspots_lga: 'Balanga, Gombe, Kaltungo.',
  },

  // North-West
  {
    zone: 'North-West',
    state: 'Zamfara',
    risk: 'CRITICAL',
    primary_threats:
      'Banditry, mass kidnapping and attacks on security personnel. Political thuggery',
    hotspots_lga: 'Gusau, Shinkafi, Zurmi, Anka, Gumi, Tsafe',
  },
  {
    zone: 'North-West',
    state: 'Katsina',
    risk: 'CRITICAL',
    primary_threats:
      'Banditry, political thuggery as APC convoys reportedly attacked on October 28 and 31 in Malumfashi and Yankara, with vehiclesdestroyed.',
    hotspots_lga: 'Malumfashi, Yankara, Faskari, Kankia.',
  },
  {
    zone: 'North-West',
    state: 'Sokoto',
    risk: 'HIGH',
    primary_threats: 'Banditry/political thuggery and intolerance.',
    hotspots_lga: 'Sokoto metropolis, Illela, Gummi, Isa, Gwadabawa, ',
  },
  {
    zone: 'North-West',
    state: 'Kaduna',
    risk: 'HIGH',
    primary_threats:
      'Banditry and kidnapping in rural areas; political thuggery',
    hotspots_lga: 'Southern Kaduna, Birnin Gwari, Giwa, Zaria',
  },
  {
    zone: 'North-West',
    state: 'Kebbi',
    risk: 'HIGH',
    primary_threats: 'Banditry/ political thuggery/intolerance',
    hotspots_lga: 'Birnin Kebbi, Zuru, Argungu. Shanga, Yauri',
  },
  {
    zone: 'North-West',
    state: 'Jigawa',
    risk: 'ELEVATED',
    primary_threats:
      'Bandit movement from Katsina and Zamfara; political violence.',
    hotspots_lga: 'Hadejia, Gumel, Dutse',
  },
  {
    zone: 'North-West',
    state: 'Kano',
    risk: 'ELEVATED',
    primary_threats:
      'Political thuggery, bandit influx into border communities (Shanono, Faruruwa).',
    hotspots_lga: 'Kano metropolis, Shanono, Gwarzo.',
  },

  // South-East
  {
    zone: 'South-East',
    state: 'Anambra',
    risk: 'HIGH',
    primary_threats:
      'IPOB/ESN-linked militancy, sit-at-home threats, historical attacks on INEC facilities.',
    hotspots_lga: 'Onitsha, Ihiala, Orumba.',
  },
  {
    zone: 'South-East',
    state: 'Imo',
    risk: 'HIGH',
    primary_threats:
      'Militancy, political thuggery, historical attacks on INEC facilities.',
    hotspots_lga: 'Orlu, Okigwe, Owerri.',
  },
  {
    zone: 'South-East',
    state: 'Enugu',
    risk: 'HIGH',
    primary_threats: 'Political thuggery/ESN/IPOB activities.',
    hotspots_lga: 'Enugu metropolis, Nsukka.',
  },
  {
    zone: 'South-East',
    state: 'Ebonyi',
    risk: 'ELEVATED',
    primary_threats: 'Political thuggery/intolerance',
    hotspots_lga: 'Abakaliki, Afikpo.',
  },
  {
    zone: 'South-East',
    state: 'Abia',
    risk: 'ELEVATED',
    primary_threats: 'Political violence/thuggery',
    hotspots_lga: 'Aba, Umuahia, Isiala Ngwa.',
  },

  // South-South
  {
    zone: 'South-South',
    state: 'Rivers',
    risk: 'ELEVATED',
    primary_threats: 'Political thuggery and cult-related violence.',
    hotspots_lga: 'Port Harcourt, Ahoada, Ogoni.',
  },
  {
    zone: 'South-South',
    state: 'Delta',
    risk: 'ELEVATED',
    primary_threats: 'Political clashes and militancy.',
    hotspots_lga: 'Warri, Ughelli, Sapele.',
  },
  {
    zone: 'South-South',
    state: 'Bayelsa',
    risk: 'MODERATE',
    primary_threats: 'Militancy and riverine access challenges.',
    hotspots_lga: 'Yenagoa, Southern Ijaw, Brass.',
  },
  {
    zone: 'South-South',
    state: 'Edo',
    risk: 'ELEVATED',
    primary_threats: 'History of political violence and thuggery.',
    hotspots_lga: 'Benin City, Auchi, Etsako.',
  },
  {
    zone: 'South-South',
    state: 'Cross River',
    risk: 'MODERATE',
    primary_threats: 'Political intolerance',
    hotspots_lga: 'Calabar, Ogoja, Bakassi.',
  },
  {
    zone: 'South-South',
    state: 'Akwa Ibom',
    risk: 'MODERATE',
    primary_threats: 'Political thuggery and militancy in creeks.',
    hotspots_lga: 'Uyo, Ikot Ekpene, Oron.',
  },

  // South-West
  {
    zone: 'South-West',
    state: 'Lagos',
    risk: 'MODERATE',
    primary_threats:
      'Political thuggery, traffic and logistics challenges, and misinformation. Strong security presence required.',
    hotspots_lga: 'Lagos metropolis, Alaba, Ikeja.',
  },
  {
    zone: 'South-West',
    state: 'Oyo',
    risk: 'MODERATE',
    primary_threats: 'Political violence and thuggery.',
    hotspots_lga: 'Ibadan, Ogbomosho, Saki.',
  },
  {
    zone: 'South-West',
    state: 'Ogun',
    risk: 'MODERATE',
    primary_threats: 'Political thuggery.',
    hotspots_lga: 'Abeokuta, Ijebu Ode, Sagamu.',
  },
  {
    zone: 'South-West',
    state: 'Osun',
    risk: 'LOW-MODERATE',
    primary_threats:
      '2026 off-cycle election rated largely peaceful, but concerns were raised about BVAS and ballot box security.',
    hotspots_lga: 'Osogbo, Ede, Ilesa.',
  },
  {
    zone: 'South-West',
    state: 'Ekiti',
    risk: 'MODERATE',
    primary_threats: 'Political thuggery',
    hotspots_lga: 'Ado-Ekiti, Ikere, Oye.',
  },
  {
    zone: 'South-West',
    state: 'Ondo',
    risk: 'LOW-MODERATE',
    primary_threats: 'Political thuggery and militancy in creek communities.',
    hotspots_lga: 'Akure, Okitipupa, Ilaje.',
  },
];

function parseHotspots(str) {
  if (!str) return [];
  return str
    .replace(/\.+$/, '')
    .split(/[,;.]|\band\s+some\s+|\band\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.toLowerCase().startsWith('and'))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}

async function main() {
  console.log('Seeding Threat/Vulnerability Assessment data...');
  const currentYear = 2026;

  let stateCount = 0;
  let lgaCount = 0;

  for (const item of DATA) {
    const existing = await prisma.threat_Vulnerability_Assessment.findFirst({
      where: {
        state: { equals: item.state, mode: 'insensitive' },
      },
    });

    if (existing) {
      await prisma.threat_Vulnerability_Assessment.update({
        where: { id: existing.id },
        data: {
          zone: item.zone,
          risk: item.risk,
          primary_threats: item.primary_threats,
          hotspots_lga: item.hotspots_lga,
          year: currentYear,
        },
      });
    } else {
      await prisma.threat_Vulnerability_Assessment.create({
        data: {
          zone: item.zone,
          state: item.state,
          risk: item.risk,
          primary_threats: item.primary_threats,
          hotspots_lga: item.hotspots_lga,
          year: currentYear,
        },
      });
    }
    stateCount++;

    const parsedLgas = parseHotspots(item.hotspots_lga);
    for (const lga of parsedLgas) {
      const existingLga = await prisma.threat_Vulnerability_LGA.findFirst({
        where: {
          state: { equals: item.state, mode: 'insensitive' },
          lga: { equals: lga, mode: 'insensitive' },
        },
      });

      if (existingLga) {
        await prisma.threat_Vulnerability_LGA.update({
          where: { id: existingLga.id },
          data: {
            zone: item.zone,
            risk: item.risk,
            primary_threats: item.primary_threats,
            year: currentYear,
          },
        });
      } else {
        await prisma.threat_Vulnerability_LGA.create({
          data: {
            zone: item.zone,
            state: item.state,
            lga,
            risk: item.risk,
            primary_threats: item.primary_threats,
            year: currentYear,
          },
        });
      }
      lgaCount++;
    }
  }

  console.log(`Successfully seeded ${stateCount} states and ${lgaCount} LGA hotspots!`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

