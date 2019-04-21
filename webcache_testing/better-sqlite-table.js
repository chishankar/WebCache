const Database = require('better-sqlite3');

/**
   A wrapper class for a **SINGLE** better-sqlite3 table.
   If you need multiple tables inside your database, you're better off
   manipulating better-sqlite3 directly (this is because of the more
   complicated JOIN statements you can use).
  */
class BetterSqliteTable {
    constructor(dbPath, attrs=[]) {
        // attrs = [] for when you want to just open an existing database
        this.db = new Database(dbPath);

        if (Array.isArray(attrs) && attrs.length > 0) {
            var create_stmt = this.db.prepare(
                'CREATE TABLE IF NOT EXISTS t (' + attrs.join(', ') + ')'
            );
            create_stmt.run();
        }
    }

    insert(rows) {
        // assume you already know the order of arguments

        // if you need rows to be an array of objects, where their
        // property names are the columns of the database, let me know
        if (Array.isArray(rows) && rows.length > 0) {
            var insert_stmt = this.db.prepare(
                'INSERT INTO t VALUES ('
                    + rows[0].map(x => '?').join(', ') + ')'
            );

            this.db.transaction((rows) => {
                for (var row of rows) {
                    insert_stmt.run(row);
                }
            })(rows);
        }
    }

    delete(whereClause) {
        var delete_stmt = this.db.prepare('DELETE FROM t ' + whereClause);
        delete_stmt.run();
    }

    select(cols, longClause='') {
        var select_stmt =
            'SELECT ' + cols.join(', ')
            + ' FROM t ' + longClause;
        return this.db.prepare(select_stmt).all();
    }

    close() {
        this.db.close();
    }
}

module.exports = {};
module.exports['BetterSqliteTable'] = BetterSqliteTable;
