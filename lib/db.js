const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'photography.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      imageUrl TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      sortOrder INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      date TEXT NOT NULL,
      time TEXT DEFAULT '',
      location TEXT NOT NULL,
      sessionType TEXT NOT NULL,
      message TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
      termsAccepted INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      galleryId TEXT,
      content TEXT NOT NULL,
      approved INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (galleryId) REFERENCES gallery(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS client_albums (
      id TEXT PRIMARY KEY,
      clientName TEXT NOT NULL,
      clientEmail TEXT NOT NULL,
      albumName TEXT NOT NULL,
      accessCode TEXT NOT NULL,
      sessionDate TEXT,
      photoCount INTEGER DEFAULT 0,
      downloadCount INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS album_photos (
      id TEXT PRIMARY KEY,
      albumId TEXT NOT NULL,
      filename TEXT NOT NULL,
      originalName TEXT DEFAULT '',
      fileSize INTEGER DEFAULT 0,
      sortOrder INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (albumId) REFERENCES client_albums(id) ON DELETE CASCADE
    );
  `);

  const settingsExist = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsExist.count === 0) {
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');

    const defaultSettings = [
      ['siteName', 'Jaex Photography'],
      ['siteDescription', 'Professional Photography Services - Capturing Life\'s Precious Moments'],
      ['contactEmail', 'contact@example.com'],
      ['contactPhone', '+1 (555) 123-4567'],
      ['contactAddress', '123 Photography Lane, Creative City, CC 12345'],
      ['bankName', 'Bank Name'],
      ['bankAccountNumber', '1234567890'],
      ['bankBranch', 'Branch Name'],
      ['bankAccountHolder', 'Account Holder Name'],
      ['bankSortCode', '12-34-56'],
      ['bookingDeposit', '50'],
      ['bookingCancellation', 'Cancellations must be made at least 48 hours before the scheduled session. Deposits are non-refundable.'],
      ['termsAndConditions', 'By booking a photography session, you agree to the following terms:\n\n1. BOOKING & PAYMENT\n- A deposit is required to confirm your booking.\n- Full payment is due on or before the day of the session.\n- Prices are subject to change without notice for new bookings.\n\n2. CANCELLATION & RESCHEDULING\n- Cancellations made 48+ hours before the session will receive a full deposit refund.\n- Cancellations within 48 hours forfeit the deposit.\n- Rescheduling is allowed once with 24+ hours notice.\n\n3. COPYRIGHT & USAGE\n- The photographer retains copyright of all images.\n- Clients receive a license for personal use of delivered images.\n- Commercial use requires written agreement.\n- The photographer may use images for portfolio/marketing unless otherwise agreed.\n\n4. LIABILITY & INJURY\n- The photographer exercises reasonable care during sessions.\n- Clients are responsible for their own safety during outdoor/adventure sessions.\n- The photographer is not liable for injuries sustained during sessions.\n- Travel to remote locations is at the client\'s own risk.\n\n5. TRAVEL\n- Travel costs beyond the included distance may incur additional fees.\n- Parking fees and tolls are billed to the client.\n- Accommodation costs for destination shoots are billed separately.\n\n6. DELIVERY\n- Edited photos will be delivered within 2-4 weeks of the session.\n- Delivery times may vary based on session type and workload.\n- Digital files are delivered via online gallery link.\n\n7. PRIVACY\n- Client contact information will not be shared with third parties.\n- Gallery images may be displayed publicly unless privacy is requested.'],
      ['aboutText', 'Welcome to Jaex Photography. We capture life\'s most precious moments with creativity and passion. Every shot tells a story, every frame preserves a memory.'],
      ['pricingPageTitle', 'Packages & Pricing'],
      ['pricingPageSubtitle', 'Professional photography packages tailored to your needs'],
      ['pricingPackages', JSON.stringify([
        { name: 'Single Session', price: '150', description: 'One professional photoshoot', features: ['1-hour session', '20 edited photos', 'Online gallery', 'Digital download'] },
        { name: 'Double Deal', price: '250', description: 'Buy 2 sessions, get amazing value', features: ['2 x 1-hour sessions', '40 edited photos', 'Online gallery', 'Digital download', 'Priority scheduling'], badge: 'POPULAR' },
        { name: 'Triple Pack', price: '350', description: 'Buy 2 shoots, get 1 FREE!', features: ['3 x 1-hour sessions', '60 edited photos', 'Online gallery', 'Digital download', 'Priority scheduling', 'Free prints pack'], badge: 'BEST VALUE' },
        { name: 'Premium 5+1', price: '550', description: 'Book 5 sessions, get the 6th FREE!', features: ['6 x 1-hour sessions', '120 edited photos', 'Online gallery', 'Digital download', 'VIP scheduling', 'Free prints pack', 'Free album'], badge: 'ULTIMATE' }
      ])],
      ['pricingLoyaltyText', 'Loyalty Rewards: Book and pay for 5 sessions, and your 6th session is completely FREE! Plus, buy any 2 sessions and get the 3rd one on us!'],
      ['socialInstagram', ''],
      ['socialFacebook', ''],
      ['socialTwitter', ''],
    ];

    const insertMany = db.transaction((settings) => {
      for (const [key, value] of settings) {
        insertSetting.run(key, value);
      }
    });

    insertMany(defaultSettings);
  }
}

module.exports = { getDb };
