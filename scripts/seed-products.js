require(require('path').join(__dirname, '..', 'Server', 'node_modules', 'dotenv')).config({ path: require('path').join(__dirname, '..', 'Server', '.env') });
const mongoose = require(require('path').join(__dirname, '..', 'Server', 'node_modules', 'mongoose'));

const PRODUCTS_SELLER1 = [
  {
    name: '오버핏 코튼 셔츠',
    description: '부드러운 코튼 소재의 오버핏 셔츠입니다. 캐주얼하면서도 깔끔한 실루엣으로 다양한 스타일링이 가능합니다.',
    price: 39900, category: 'TOP', styleTags: ['캐주얼', '오버핏'],
    images: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'M', color: 'WHITE', stockQty: 50, sku: 'NB-SH01-M-WH' },
      { size: 'L', color: 'WHITE', stockQty: 40, sku: 'NB-SH01-L-WH' },
      { size: 'M', color: 'BLACK', stockQty: 45, sku: 'NB-SH01-M-BK' },
      { size: 'L', color: 'BLACK', stockQty: 35, sku: 'NB-SH01-L-BK' },
    ],
  },
  {
    name: '슬림핏 스트레이트 데님',
    description: '깔끔한 실루엣의 슬림핏 스트레이트 데님 팬츠입니다. 데일리로 입기 좋은 기본 아이템입니다.',
    price: 49900, category: 'BOTTOM', styleTags: ['미니멀', '데일리'],
    images: [{ url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: '28', color: 'BLUE', stockQty: 30, sku: 'NB-DN01-28-BL' },
      { size: '30', color: 'BLUE', stockQty: 50, sku: 'NB-DN01-30-BL' },
      { size: '32', color: 'BLUE', stockQty: 40, sku: 'NB-DN01-32-BL' },
      { size: '30', color: 'BLACK', stockQty: 35, sku: 'NB-DN01-30-BK' },
    ],
  },
  {
    name: '울 블렌드 오버코트',
    description: '고급 울 블렌드 소재의 클래식 오버코트입니다. 겨울 시즌 필수 아우터로 포멀한 자리에도 잘 어울립니다.',
    price: 189000, category: 'OUTER', styleTags: ['포멀', '클래식'],
    images: [{ url: 'https://images.unsplash.com/photo-1544923246-77307dd270b5?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'M', color: 'BEIGE', stockQty: 15, sku: 'NB-CT01-M-BE' },
      { size: 'L', color: 'BEIGE', stockQty: 20, sku: 'NB-CT01-L-BE' },
      { size: 'M', color: 'BLACK', stockQty: 25, sku: 'NB-CT01-M-BK' },
    ],
  },
  {
    name: '플라워 패턴 미디 원피스',
    description: '로맨틱한 플라워 패턴의 미디 길이 원피스입니다. 봄 시즌에 어울리는 여성스러운 디자인입니다.',
    price: 59900, category: 'DRESS', styleTags: ['로맨틱', '플라워'],
    images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'S', color: 'PINK', stockQty: 20, sku: 'NB-DR01-S-PK' },
      { size: 'M', color: 'PINK', stockQty: 30, sku: 'NB-DR01-M-PK' },
      { size: 'L', color: 'PINK', stockQty: 25, sku: 'NB-DR01-L-PK' },
    ],
  },
  {
    name: '레트로 캔버스 스니커즈',
    description: '빈티지 감성의 캔버스 스니커즈입니다. 편안한 착화감과 레트로한 디자인이 특징입니다.',
    price: 69900, category: 'SHOES', styleTags: ['빈티지', '레트로'],
    images: [{ url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: '250', color: 'WHITE', stockQty: 20, sku: 'NB-SN01-250-WH' },
      { size: '260', color: 'WHITE', stockQty: 30, sku: 'NB-SN01-260-WH' },
      { size: '270', color: 'WHITE', stockQty: 25, sku: 'NB-SN01-270-WH' },
    ],
  },
  {
    name: '미니멀 레더 토트백',
    description: '심플한 디자인의 레더 토트백입니다. 넉넉한 수납공간과 고급스러운 소재감이 매력적입니다.',
    price: 89000, category: 'BAG', styleTags: ['미니멀', '럭셔리'],
    images: [{ url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'FREE', color: 'BLACK', stockQty: 40, sku: 'NB-BG01-F-BK' },
      { size: 'FREE', color: 'BROWN', stockQty: 30, sku: 'NB-BG01-F-BR' },
    ],
  },
  {
    name: '실버 체인 목걸이',
    description: '심플한 실버 체인 목걸이입니다. 데일리로 착용하기 좋은 기본 악세서리입니다.',
    price: 29900, category: 'ACCESSORY', styleTags: ['미니멀', '데일리'],
    images: [{ url: 'https://images.unsplash.com/photo-1515562141589-67f0d1d4db09?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'FREE', color: 'SILVER', stockQty: 100, sku: 'NB-AC01-F-SV' },
    ],
  },
  {
    name: '울 비니 모자',
    description: '부드러운 울 소재의 비니 모자입니다. 겨울 시즌 필수 아이템으로 다양한 컬러를 제공합니다.',
    price: 19900, category: 'HAT', styleTags: ['캐주얼', '스트릿'],
    images: [{ url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'FREE', color: 'BLACK', stockQty: 60, sku: 'NB-HT01-F-BK' },
      { size: 'FREE', color: 'GRAY', stockQty: 50, sku: 'NB-HT01-F-GR' },
      { size: 'FREE', color: 'NAVY', stockQty: 40, sku: 'NB-HT01-F-NV' },
    ],
  },
  {
    name: '스트라이프 니트 탑',
    description: '세련된 스트라이프 패턴의 니트 탑입니다. 봄가을 시즌에 레이어링하기 좋은 아이템입니다.',
    price: 45900, category: 'TOP', styleTags: ['캐주얼', '레이어링'],
    images: [{ url: 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a20?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'S', color: 'NAVY', stockQty: 25, sku: 'NB-NT01-S-NV' },
      { size: 'M', color: 'NAVY', stockQty: 40, sku: 'NB-NT01-M-NV' },
      { size: 'L', color: 'NAVY', stockQty: 30, sku: 'NB-NT01-L-NV' },
    ],
  },
  {
    name: '와이드 카고 팬츠',
    description: '트렌디한 와이드 실루엣의 카고 팬츠입니다. 스트릿 무드의 스타일링에 제격입니다.',
    price: 55900, category: 'BOTTOM', styleTags: ['스트릿', '와이드'],
    images: [{ url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'M', color: 'KHAKI', stockQty: 30, sku: 'NB-CG01-M-KH' },
      { size: 'L', color: 'KHAKI', stockQty: 25, sku: 'NB-CG01-L-KH' },
      { size: 'M', color: 'BLACK', stockQty: 35, sku: 'NB-CG01-M-BK' },
    ],
  },
];

const PRODUCTS_SELLER2 = [
  {
    name: '린넨 블렌드 반팔 셔츠',
    description: '시원한 린넨 블렌드 소재의 반팔 셔츠입니다. 여름 시즌에 시원하게 착용할 수 있습니다.',
    price: 35900, category: 'TOP', styleTags: ['캐주얼', '여름'],
    images: [{ url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'M', color: 'WHITE', stockQty: 40, sku: 'GG-SH01-M-WH' },
      { size: 'L', color: 'WHITE', stockQty: 35, sku: 'GG-SH01-L-WH' },
      { size: 'M', color: 'SKYBLUE', stockQty: 30, sku: 'GG-SH01-M-SB' },
    ],
  },
  {
    name: '스포츠 조거 팬츠',
    description: '편안한 착용감의 스포츠 조거 팬츠입니다. 운동이나 일상에서 활동적으로 입기 좋습니다.',
    price: 34900, category: 'BOTTOM', styleTags: ['스포티', '액티브'],
    images: [{ url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'S', color: 'BLACK', stockQty: 30, sku: 'GG-JG01-S-BK' },
      { size: 'M', color: 'BLACK', stockQty: 50, sku: 'GG-JG01-M-BK' },
      { size: 'L', color: 'BLACK', stockQty: 40, sku: 'GG-JG01-L-BK' },
      { size: 'M', color: 'GRAY', stockQty: 35, sku: 'GG-JG01-M-GR' },
    ],
  },
  {
    name: '패딩 다운 자켓',
    description: '가볍고 따뜻한 패딩 다운 자켓입니다. 경량 소재로 휴대성이 좋고 보온성이 뛰어납니다.',
    price: 129000, category: 'OUTER', styleTags: ['스포티', '겨울'],
    images: [{ url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'M', color: 'NAVY', stockQty: 20, sku: 'GG-PD01-M-NV' },
      { size: 'L', color: 'NAVY', stockQty: 25, sku: 'GG-PD01-L-NV' },
      { size: 'M', color: 'BLACK', stockQty: 30, sku: 'GG-PD01-M-BK' },
    ],
  },
  {
    name: '셔링 미니 원피스',
    description: '러블리한 셔링 디테일의 미니 원피스입니다. 여름 시즌에 산뜻하게 착용할 수 있습니다.',
    price: 42900, category: 'DRESS', styleTags: ['로맨틱', '여름'],
    images: [{ url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'S', color: 'WHITE', stockQty: 20, sku: 'GG-DR01-S-WH' },
      { size: 'M', color: 'WHITE', stockQty: 25, sku: 'GG-DR01-M-WH' },
      { size: 'S', color: 'BLUE', stockQty: 15, sku: 'GG-DR01-S-BL' },
    ],
  },
  {
    name: '러닝 메쉬 스니커즈',
    description: '통기성 좋은 메쉬 소재의 러닝 스니커즈입니다. 가벼운 무게와 쿠션감 있는 인솔이 특징입니다.',
    price: 79900, category: 'SHOES', styleTags: ['스포티', '러닝'],
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: '250', color: 'BLACK', stockQty: 25, sku: 'GG-RN01-250-BK' },
      { size: '260', color: 'BLACK', stockQty: 35, sku: 'GG-RN01-260-BK' },
      { size: '270', color: 'BLACK', stockQty: 30, sku: 'GG-RN01-270-BK' },
      { size: '260', color: 'WHITE', stockQty: 20, sku: 'GG-RN01-260-WH' },
    ],
  },
  {
    name: '캔버스 크로스백',
    description: '가벼운 캔버스 소재의 크로스백입니다. 캐주얼한 외출에 딱 맞는 사이즈와 디자인입니다.',
    price: 32900, category: 'BAG', styleTags: ['캐주얼', '데일리'],
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'FREE', color: 'BEIGE', stockQty: 50, sku: 'GG-BG01-F-BE' },
      { size: 'FREE', color: 'BLACK', stockQty: 40, sku: 'GG-BG01-F-BK' },
    ],
  },
  {
    name: '골드 링 이어링',
    description: '세련된 골드 링 이어링입니다. 심플하면서도 포인트가 되는 악세서리입니다.',
    price: 24900, category: 'ACCESSORY', styleTags: ['미니멀', '포인트'],
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'FREE', color: 'GOLD', stockQty: 80, sku: 'GG-AC01-F-GD' },
    ],
  },
  {
    name: '버킷 햇',
    description: '트렌디한 버킷 햇입니다. 자외선 차단과 스타일링을 동시에 잡을 수 있는 아이템입니다.',
    price: 22900, category: 'HAT', styleTags: ['스트릿', '여름'],
    images: [{ url: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'FREE', color: 'BLACK', stockQty: 45, sku: 'GG-HT01-F-BK' },
      { size: 'FREE', color: 'BEIGE', stockQty: 35, sku: 'GG-HT01-F-BE' },
    ],
  },
  {
    name: '헤비웨이트 맨투맨',
    description: '두꺼운 코튼 소재의 헤비웨이트 맨투맨입니다. 겨울에도 따뜻하게 착용 가능한 고밀도 원단입니다.',
    price: 44900, category: 'TOP', styleTags: ['스트릿', '헤비웨이트'],
    images: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'M', color: 'GRAY', stockQty: 30, sku: 'GG-MT01-M-GR' },
      { size: 'L', color: 'GRAY', stockQty: 35, sku: 'GG-MT01-L-GR' },
      { size: 'M', color: 'BLACK', stockQty: 40, sku: 'GG-MT01-M-BK' },
      { size: 'L', color: 'BLACK', stockQty: 30, sku: 'GG-MT01-L-BK' },
    ],
  },
  {
    name: '플리스 집업 자켓',
    description: '보송보송한 플리스 소재의 집업 자켓입니다. 가을부터 겨울까지 이너로 활용하기 좋습니다.',
    price: 59900, category: 'OUTER', styleTags: ['캐주얼', '플리스'],
    images: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', isMain: true, sortOrder: 0 }],
    variants: [
      { size: 'M', color: 'IVORY', stockQty: 25, sku: 'GG-FL01-M-IV' },
      { size: 'L', color: 'IVORY', stockQty: 20, sku: 'GG-FL01-L-IV' },
      { size: 'M', color: 'BROWN', stockQty: 30, sku: 'GG-FL01-M-BR' },
    ],
  },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  // 기존 상품 삭제 (시드 데이터 초기화)
  await mongoose.connection.db.collection('products').deleteMany({});
  console.log('기존 상품 삭제 완료');

  // 셀러1: test2@styleai.com
  const user1 = await mongoose.connection.db.collection('users').findOne({ email: 'test2@styleai.com' });
  const seller1 = await mongoose.connection.db.collection('sellers').findOne({ user: user1._id });

  // 셀러2: sewkim@daum.net
  const user2 = await mongoose.connection.db.collection('users').findOne({ email: 'sewkim@daum.net' });
  const seller2 = await mongoose.connection.db.collection('sellers').findOne({ user: user2._id });

  const now = new Date();
  let count = 0;

  for (const p of PRODUCTS_SELLER1) {
    await mongoose.connection.db.collection('products').insertOne({
      ...p,
      seller: seller1._id,
      status: 'ACTIVE',
      viewCount: Math.floor(Math.random() * 500),
      avgRating: +(3.5 + Math.random() * 1.5).toFixed(1),
      reviewCount: Math.floor(Math.random() * 30),
      createdAt: new Date(now - (count++) * 86400000),
      updatedAt: new Date(),
    });
  }
  console.log('셀러1 (New Brand / test2@styleai.com): 10개 상품 등록');

  for (const p of PRODUCTS_SELLER2) {
    await mongoose.connection.db.collection('products').insertOne({
      ...p,
      seller: seller2._id,
      status: 'ACTIVE',
      viewCount: Math.floor(Math.random() * 500),
      avgRating: +(3.5 + Math.random() * 1.5).toFixed(1),
      reviewCount: Math.floor(Math.random() * 30),
      createdAt: new Date(now - (count++) * 86400000),
      updatedAt: new Date(),
    });
  }
  console.log('셀러2 (GOGO Fashion / sewkim@daum.net): 10개 상품 등록');

  // 확인
  const total = await mongoose.connection.db.collection('products').countDocuments();
  console.log('총 상품 수:', total);

  process.exit(0);
}

main();
