import mysql from 'mysql2/promise';
import { DbHost, DbUser, DbPassword, DbName } from "../config/env.js";

// MySQLデータベース接続設定
const connection = mysql.createPool({
    host: DbHost,
    user: DbUser,
    password: DbPassword,
    database: DbName,
    namedPlaceholders: true,
});

export default {
    async initializeDatabase() {
        // テーブルが存在するか確認するSQL文
        const tableExists = await connection.query(`
            SELECT COUNT(*)
            FROM information_schema.tables 
            WHERE table_schema = '${DbName}' 
            AND table_name = 'proposals';
        `);
    
        // テーブルが存在しない場合、テーブルを作成する
        if (tableExists[0][0]['COUNT(*)'] === 0) {
            await connection.execute(`
                CREATE TABLE proposals (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    proposalId INT NOT NULL,
                    chain VARCHAR(255) NOT NULL
                );
            `);
            console.log('Table `proposals` created.');
        } else {
            console.log('Table `proposals` already exists.');
        }
    },
    async getExistsProposal(proposalId, chain) {
        const [rows] = await connection.execute(
            'SELECT * FROM proposals WHERE proposalId = ? AND chain = ? LIMIT 1',
            [proposalId, chain]
        );
        return rows[0] || null;
    },
    async createProposal(proposalId, chain) {
        await connection.execute(
            'INSERT INTO proposals (proposalId, chain) VALUES (?, ?)',
            [proposalId, chain]
        );
    },
}
