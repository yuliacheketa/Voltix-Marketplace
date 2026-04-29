export function demoImg(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=600&q=80`;
}

const SEED_SLUG_TRIPLES: Record<string, readonly [string, string, string]> = {
  "probook-14": [
    "photo-1496181133206-80ce9b88a853",
    "photo-1517336714731-489689fd1ca8",
    "photo-1525547719571-a2d4ac4285e2",
  ],
  "airlite-13": [
    "photo-1517336714731-489689fd1ca8",
    "photo-1541807084-5c2f6c2b3a50",
    "photo-1496181133206-80ce9b88a853",
  ],
  "pixelphone-x": [
    "photo-1511707171634-5f897ff02aa9",
    "photo-1512941937669-90a1b58e7e9c",
    "photo-1592899677976-179c546cfe02",
  ],
  "nova-phone": [
    "photo-1592899677976-179c546cfe02",
    "photo-1565849904463-460afb744898",
    "photo-1511707171634-5f897ff02aa9",
  ],
  "classic-denim-jacket": [
    "photo-1551024506-0bccd828d307",
    "photo-1576871337622-98df48d849ba",
    "photo-1445205170230-053b83016050",
  ],
  "running-tee": [
    "photo-1521572163474-6864f9cf17ab",
    "photo-1583743814966-8936f5b7be1a",
    "photo-1576566588624-d9b85beea0de",
  ],
  "ceramic-vase-set": [
    "photo-1578500494191-2469e54a22a0",
    "photo-1612196802340-061733a5d3b4",
    "photo-1581787925-c462aa22b0a7",
  ],
  "linen-throw": [
    "photo-1586075010923-2dd4570fb338",
    "photo-1616486338812-3fadaedd1c9a",
    "photo-1522771739844-6a9f6d5f26af",
  ],
  "trail-running-shoes": [
    "photo-1542291026-7eec264c27ff",
    "photo-1460353581641-37baddab0fa2",
    "photo-1549298916-b41d501d3772",
  ],
  "yoga-mat-pro": [
    "photo-1601925260368-f2f4107acbde",
    "photo-1544367567-0f2fcb009e0b",
    "photo-1599447291905-3713c2f6f4db",
  ],
};

const DEFAULT_TRIPLE: readonly [string, string, string] = [
  "photo-1556742049-0cfed4f6a45d",
  "photo-1441986300917-64774dacb6c",
  "photo-1472851294608-062f824d29cc",
];

export function getSeedProductTripleUrls(
  slug: string
): readonly [string, string, string] {
  const row = SEED_SLUG_TRIPLES[slug];
  if (row) return [demoImg(row[0]), demoImg(row[1]), demoImg(row[2])];
  return [
    demoImg(DEFAULT_TRIPLE[0]),
    demoImg(DEFAULT_TRIPLE[1]),
    demoImg(DEFAULT_TRIPLE[2]),
  ];
}

const MOCK_PAIRS: ReadonlyArray<{ sub: string; a: string; b: string }> = [
  {
    sub: "earbuds",
    a: "photo-1590658268037-6bf12165a9df",
    b: "photo-1572569511254-d8f925fe2cbb",
  },
  {
    sub: "headphone",
    a: "photo-1505740420928-5e560c06d30e",
    b: "photo-1484704849700-f032a568e944",
  },
  {
    sub: "monitor arm",
    a: "photo-1527443224154-c4ea394f1d82",
    b: "photo-1527864550417-7fd91fc51a46",
  },
  {
    sub: "monitor",
    a: "photo-1527443224154-c4ea394f1d82",
    b: "photo-1496181133206-80ce9b88a853",
  },
  {
    sub: "keyboard",
    a: "photo-1587825140708-dfaf72ae4b04",
    b: "photo-1618384887929-16f96d2d6691",
  },
  {
    sub: "mouse",
    a: "photo-1527814050087-3793815479a8",
    b: "photo-1615663245857-ac93bb7c39bb",
  },
  {
    sub: "usb-c hub",
    a: "photo-1625948515291-69613efd103f",
    b: "photo-1580894894513-1b82c1e661b2",
  },
  {
    sub: "hub 7",
    a: "photo-1625948515291-69613efd103f",
    b: "photo-1580894894513-1b82c1e661b2",
  },
  {
    sub: "ssd",
    a: "photo-1597872200969-2b25d1f61fdf",
    b: "photo-1628556270447-2d1d2b9e26b8",
  },
  {
    sub: "webcam",
    a: "photo-1587826080690-27e0b01cae27",
    b: "photo-1606813907291-d86efa9b94db",
  },
  {
    sub: "ring light",
    a: "photo-1611532736597-de2d4265fba3",
    b: "photo-1492691527719-9d1e07e534b4",
  },
  {
    sub: "smart watch",
    a: "photo-1523275335684-37898b6baf30",
    b: "photo-1434493789840-218edc2698f0",
  },
  {
    sub: "fitness tracker",
    a: "photo-1575311373-3540660fbffc",
    b: "photo-1523275335684-37898b6baf30",
  },
  {
    sub: "bluetooth speaker",
    a: "photo-1608043152269-423db2eaf608",
    b: "photo-1545454675-3571b67450d1",
  },
  {
    sub: "speaker outdoor",
    a: "photo-1608043152269-423db2eaf608",
    b: "photo-1545454675-3571b67450d1",
  },
  {
    sub: "gaming chair",
    a: "photo-1586023492125-27b2c20efd7e",
    b: "photo-1611269154421-3e331d066d50",
  },
  {
    sub: "standing desk",
    a: "photo-1518455027357-98694aea98f2",
    b: "photo-1593062096033-4735c120c958",
  },
  {
    sub: "desk lamp",
    a: "photo-1507473885765-e6ed057f782c",
    b: "photo-1513506003901-1e6ff229e2d1",
  },
  {
    sub: "led desk",
    a: "photo-1507473885765-e6ed057f782c",
    b: "photo-1513506003901-1e6ff229e2d1",
  },
  {
    sub: "socks",
    a: "photo-1586350977773-f3c4e4c43e12",
    b: "photo-1583870872548-13e9d15abd24",
  },
  {
    sub: "sweater",
    a: "photo-1576566588624-d9b85beea0de",
    b: "photo-1434389677669-e08f4c810f35",
  },
  {
    sub: "chinos",
    a: "photo-1473966968600-fa801b869a1a",
    b: "photo-1594938291221-94f18cbb5660",
  },
  {
    sub: "running shorts",
    a: "photo-1598104140761-3ad1583b7dce",
    b: "photo-1434596922112-19c563067271",
  },
  {
    sub: "parka",
    a: "photo-1539533018447-63fcce2678e3",
    b: "photo-1544022613-6b9d0e89e3a0",
  },
  {
    sub: "cookware",
    a: "photo-1556909114-f6e7ad7d3136",
    b: "photo-1556911220-e15b29be8c8b",
  },
  {
    sub: "electric kettle",
    a: "photo-1590794056226-840eb27cb3fb",
    b: "photo-1520986606214-8b456424c813",
  },
  {
    sub: "stainless steel kettle",
    a: "photo-1570225366193-d49ef7bb8c61",
    b: "photo-1590794056226-840eb27cb3fb",
  },
  {
    sub: "cutting board",
    a: "photo-1600093464552-79b181bbbb8c",
    b: "photo-1584990981754-8ea0ed8cad0f",
  },
  {
    sub: "throw pillow",
    a: "photo-1584100936595-c34e301e1dba",
    b: "photo-1616486338812-3fadaedd1c9a",
  },
  {
    sub: "area rug",
    a: "photo-1600210492493-0946911123ea",
    b: "photo-1615529182904-14819c35b37f",
  },
  {
    sub: "yoga block",
    a: "photo-1601925260368-f2f4107acbde",
    b: "photo-1544367567-0f2fcb009e0b",
  },
  {
    sub: "resistance band",
    a: "photo-1518611012118-696072aa579a",
    b: "photo-1571902943202-507ec2618e8f",
  },
  {
    sub: "dumbbell",
    a: "photo-1517836357463-d25dfeac3438",
    b: "photo-1571019613454-1cb2f99b2d8b",
  },
  {
    sub: "camping tent",
    a: "photo-1504280390367-361c6d9f58f8",
    b: "photo-1478131143281-c4f93c1b5e76",
  },
  {
    sub: "hiking backpack",
    a: "photo-1622260614927-4a57b805017e",
    b: "photo-1553062407-98eeb64c6a62",
  },
  {
    sub: "basketball",
    a: "photo-1546519638-68e109498ffc",
    b: "photo-1519869329860-001ca89d0b4d",
  },
  {
    sub: "tennis racket",
    a: "photo-1622279451349-3c1f9328f4c3",
    b: "photo-1595435937349-1592482abf0e",
  },
  {
    sub: "cycling helmet",
    a: "photo-1558618666-fcd25c85cd64",
    b: "photo-1517649763962-0b62199e110c",
  },
  {
    sub: "foam roller",
    a: "photo-1600880292203-757bb62b4baf",
    b: "photo-1544161515-4ab6ce6db874",
  },
  {
    sub: "smart plug",
    a: "photo-1558618047-3c8c76ca7d13",
    b: "photo-1558346490-b88bf88c2dcc",
  },
  {
    sub: "air purifier",
    a: "photo-1585771724683-38269d663d16",
    b: "photo-1584622650111-993a426fbfcd",
  },
  {
    sub: "robot vacuum",
    a: "photo-1558316959-98cd9d131b1a",
    b: "photo-1581578731548-c64695cd695a",
  },
  {
    sub: "french press",
    a: "photo-1510707577719-2e914bb11b8e",
    b: "photo-1495474473297-86ef4ea30f59",
  },
  {
    sub: "insulated bottle",
    a: "photo-1602143407151-7111542de6e8",
    b: "photo-1523362628745-0fef095470a4",
  },
  {
    sub: "travel adapter",
    a: "photo-1625948515291-69613efd103f",
    b: "photo-1580894894513-1b82c1e661b2",
  },
  {
    sub: "laptop stand",
    a: "photo-1527864550417-7fd91fc51a46",
    b: "photo-1526492111323-856194ac0b4e",
  },
  {
    sub: "cable management",
    a: "photo-1580894894513-1b82c1e661b2",
    b: "photo-1550009158-9eb35e7390ff",
  },
  {
    sub: "desk mat",
    a: "photo-1593640408182-31baa5f352e3",
    b: "photo-1526492111323-856194ac0b4e",
  },
];

const DEFAULT_PAIR: readonly [string, string] = [
  "photo-1556742049-0cfed4f6a45d",
  "photo-1441986300917-64774dacb6c",
];

export function getMockProductPairUrls(
  name: string
): readonly [string, string] {
  const n = name.toLowerCase();
  for (const row of MOCK_PAIRS) {
    if (n.includes(row.sub)) {
      return [demoImg(row.a), demoImg(row.b)];
    }
  }
  return [demoImg(DEFAULT_PAIR[0]), demoImg(DEFAULT_PAIR[1])];
}
