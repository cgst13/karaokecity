import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import crypto from 'crypto';

// Helper to format private key properly (handle newlines)
const formatPrivateKey = (key) => {
  return key.replace(/\\n/g, '\n');
};

class SheetService {
  constructor() {
    this.doc = null;
    this.sheetId = null;
    this.email = null;
    this.key = null;
    this.initPromise = null;
  }

  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.sheetId = process.env.GOOGLE_SHEET_ID;
        this.email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        this.key = process.env.GOOGLE_PRIVATE_KEY;

        if (!this.sheetId || !this.email || !this.key) {
          throw new Error('Missing Google Sheets credentials');
        }

        const serviceAccountAuth = new JWT({
          email: this.email,
          key: formatPrivateKey(this.key),
          scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
          ],
        });

        this.doc = new GoogleSpreadsheet(this.sheetId, serviceAccountAuth);
        await this.doc.loadInfo();
        await this.ensureSheets();
      } catch (error) {
        console.error('SheetService init failed:', error);
        this.initPromise = null; // Reset promise to allow retry
        throw error;
      }
    })();

    return this.initPromise;
  }

  async ensureSheets() {
    // Check/Create Queue Sheet
    let queueSheet = this.doc.sheetsByTitle['Queue'];
    if (!queueSheet) {
      queueSheet = await this.doc.addSheet({ title: 'Queue' });
    }
    await queueSheet.setHeaderRow(['id', 'video_id', 'video_data', 'status', 'created_at', 'playlist_id']);

    // Check/Create Playlists Sheet
    let playlistSheet = this.doc.sheetsByTitle['Playlists'];
    if (!playlistSheet) {
      playlistSheet = await this.doc.addSheet({ title: 'Playlists' });
    }
    await playlistSheet.setHeaderRow(['id', 'created_at', 'active_device_id']);
  }

  async getQueue(playlistId) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Queue'];
    const rows = await sheet.getRows();
    
    return rows
      .filter(row => row.get('playlist_id') === playlistId)
      .map(row => ({
        id: row.get('id'),
        video_id: row.get('video_id'),
        video_data: JSON.parse(row.get('video_data')),
        status: row.get('status'),
        created_at: row.get('created_at'),
        playlist_id: row.get('playlist_id')
      }));
  }

  async addToQueue(item) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Queue'];
    await sheet.addRow({
      id: crypto.randomUUID(),
      video_id: item.video_id,
      video_data: JSON.stringify(item.video_data),
      status: item.status,
      created_at: new Date().toISOString(),
      playlist_id: item.playlist_id
    });
  }

  async updateQueueStatus(id, status) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Queue'];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);
    if (row) {
      row.assign({ status });
      await row.save();
    }
  }

  async swapQueueItems(id1, id2) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Queue'];
    const rows = await sheet.getRows();
    
    const row1 = rows.find(r => r.get('id') === id1);
    const row2 = rows.find(r => r.get('id') === id2);

    if (row1 && row2) {
      const createdAt1 = row1.get('created_at');
      const createdAt2 = row2.get('created_at');

      row1.assign({ created_at: createdAt2 });
      row2.assign({ created_at: createdAt1 });

      await Promise.all([row1.save(), row2.save()]);
    }
  }

  async removeFromQueue(id) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Queue'];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);
    if (row) {
      await row.delete();
    }
  }

  async createPlaylist() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Playlists'];
    const id = crypto.randomUUID();
    await sheet.addRow({
      id,
      created_at: new Date().toISOString(),
      active_device_id: ''
    });
    return { id };
  }

  async getPlaylist(id) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Playlists'];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);
    if (row) {
      return {
        id: row.get('id'),
        created_at: row.get('created_at'),
        active_device_id: row.get('active_device_id')
      };
    }
    return null;
  }

  async updatePlaylistDevice(id, deviceId) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Playlists'];
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);
    if (row) {
      row.assign({ active_device_id: deviceId });
      await row.save();
    }
  }
}

export default new SheetService();
