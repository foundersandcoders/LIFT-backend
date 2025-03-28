import { DatabaseSync } from "node:sqlite";
import { NewUser } from "types/authTypes.ts";

const db = new DatabaseSync("user.db");

const dbOps = {
	createTable: db.prepare(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT,
		email TEXT
		)
	`),
	insertUser: db.prepare(`
		INSERT INTO users (name, email) VALUES (?, ?);
	`),
	selectUsers: db.prepare(`
		SELECT id, name, email FROM users
	`),
	deleteUsers: db.prepare(`
		DELETE FROM users
	`),
};

function insertUsers(users: NewUser[]) {
	console.group("|============ Inserting Users ============|");
	for (const user of users) {
		dbOps.insertUser.run(user.name, user.email);
		console.log(`| Created ${user.name}`);
	}
	console.groupEnd();
}

function checkDb(title: string) {
	console.group(`|============ ${title} ============|`);
	const rows = dbOps.selectUsers.all();
	console.log(`| Found ${rows.length} users`);
	for (const row of rows) console.log(row);
	console.groupEnd();
}

console.clear();

dbOps.createTable.run();

checkDb("Initial State");

insertUsers([
	{ name: "Jason Warren", email: "jason@foundersandcoders.com" },
	{ name: "Alex Rodriguez", email: "alex@foundersandcoders.com" },
	{ name: "Dan Sofer", email: "dan@foundersandcoders.com" },
]);

checkDb("After Insert");

dbOps.deleteUsers.run();

checkDb("After Delete");

db.close();