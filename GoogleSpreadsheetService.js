import { GoogleSpreadsheet } from "google-spreadsheet";

export class GoogleSpreadsheetService {
  doc;
  constructor() {
    this.doc = new GoogleSpreadsheet(
      process.env["SHEET_ID"]
    );
  }
  async Auth() {
    const email = process.env["BOT_EMAIL"];
    const key = process.env["BOT_KEY"];

    await this.doc.useServiceAccountAuth({
      client_email: email,
      private_key: key.replace(/\\n/g, "\n"),
    });
  }
  async LoadMeals() {
    await this.doc.loadInfo();
    const sheet = this.doc.sheetsByIndex[0];
    await sheet.loadCells(); // no filter - will load ALL cells in the sheet
    const rows = await sheet.getRows();
    const result = {};
    
    rows.forEach((row) => {
      if (!result[row.meal]) {
        result[row.meal] = [];
      }
      result[row.meal].push({
        dish: row.dish,
        recipe: row.resipes,
        photo: row.photo,
      });
    });

    return result;
  }
}
