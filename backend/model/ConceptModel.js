import db from "../db/connection.js";

class ConceptModel {

  static async getAll(){
    const result = await db.query(`
      SELECT * 
      FROM master_candidates
      ORDER BY id ASC
    `);
    return result.rows;
  }

}

export default ConceptModel;