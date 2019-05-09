const Database = require('better-sqlite3');

/**
   A wrapper class for a **SINGLE** better-sqlite3 table.
   If you need multiple tables inside your database, you're better off
   manipulating better-sqlite3 directly (this is because of the more
   complicated JOIN statements you can use).
  */
class BetterSqliteTable {
    /**
       Opens a database at the specified location, and makes one if it doesn't
       exist. Makes just one table inside the database.

       @param {string} dbPath - the specified location
       @param {Array<string>} attrs - the column attributes for the table
      */
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

    /**
       Insert many rows at once into the table. Assumes you know the relative
       order of the columns during insertion.

       @param {Array<Array>} rows
      */
    insert(rows) {
        // if you need rows to be an array of objects, where their
        // property names are the columns of the database, let me know
        if (Array.isArray(rows) && rows.length > 0) {
            var insert_stmt = this.db.prepare(
                'INSERT INTO t VALUES ('
                    + rows[0].map(x => '?').join(', ') + ')'
            );

            // executes all of the insert statements at once
            this.db.transaction((rows) => {
                for (var row of rows) {
                    insert_stmt.run(row);
                }
            })(rows);
        }
    }


    /**
       Updates the table at the specified columns with the specified values, for
       the specified conditions (longClause).

       Not tested heavily yet, but it seems to work.

       This method, while fast, cannot be hyperoptimized further. Further
       hyperoptimizations require understanding better-sqlite3 more.

       The parameter ``assignments`` takes the form of [
           {assignments: {col1: val1, col2: val2}, longClause: "WHERE col = ..."},
           ...
       ]
      */
    update(assignments) {
        if (Array.isArray(assignments) && assignments.length > 0) {
            this.db.transaction((assignments) => {
                for (var assignment of assignments) {
                    // have default value for longClause
                    var longClause =
                        assignment.longClause
                        ? assignment.longClause
                        : '';

                    // assignment is an object, convert its properties to a nested array
                    var entries = Object.entries(assignment.assignments);
                    // I can't use the object keys in the 
                    var setClause = 'SET ' + entries.map(
                        x => x[0].toString() + ' = ?'
                    ).join(', ');
                    var update_stmt = this.db.prepare(
                        'UPDATE t ' + setClause + ' ' + longClause
                    );
                    // flatten the entry array
                    update_stmt.run(entries.map(x => x[1]));
                }
            })(assignments);
        }
    }
/*
    update(cols, assignments, longClause='') {
        if (Array.isArray(assignments) && assignments.length > 0) {
            var update_stmt = this.db.prepare(
                'UPDATE t SET '
                    + cols.map(x => x.toString() + ' = ?').join(', ')
                    + longClause
            );

            this.db.transaction((assignments) => {
                for(var vals of assignments) {
                    update_stmt.run(vals);
                }
            })(assignments);
        }
    }
*/

    /**
       Deletes rows that match the specified condition from the table.

       @param {string} whereClause - the specified condition
      */
    delete(whereClause) {
        var delete_stmt = this.db.prepare('DELETE FROM t ' + whereClause);
        delete_stmt.run();
    }

    /**
       Returns columns that match the specified condition(s).

       @param {Array<string>} cols - the specified columns you want.
           Write ['*'] if you want everything.
       @param {string} options.longClause - the specified conditions(s).
           You put stuff like 'ORDER BY', 'WHERE', 'GROUP BY', etc. here.
       @param {boolean} options.isDistinct - specifies whether or not
           you want distinct (unique) rows.
      */
    select(cols, options={isDistinct: false, longClause: ''}) {
        var select_stmt =
            'SELECT ' + (options.isDistinct ? 'DISTINCT ' : '')
            + cols.join(', ') + ' FROM t ' + options.longClause;
        return this.db.prepare(select_stmt).all();
    }

    /**
       Closes this database & table. It's good practice to always do this
       before stopping using the database.
      */
    close() {
        this.db.close();
    }
}

module.exports = {};
module.exports['BetterSqliteTable'] = BetterSqliteTable;
