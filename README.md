# BookshelfJS Yeoman generator
Shortcuts to setup [BookshelfJS](http://bookshelfjs.org/) models and [KNEX](http://knexjs.org/) database connection.

## Requirements
This generator is intended to inject bookshelf into an existing project. It assumes you already have a package.json and develop in a src directory. As this is a [Yeoman](http://yeoman.io) generator you will need to ensure you have yeoman installed.
```bash
npm install -g yo
```

## Installation
To install from npm run
```bash
npm install -g generator-bookshelf
```

## Usage
To add the initial database configuration to your project run the generator from your root directory.
```bash
yo bookshelf
```
This will prompt you to select type of database you want to use and to enter the database details (you can always use the defaults and there them later). The generator will create the following files
 * src/config/database.js - Your database configuration settings. This also doubles as a knexfile. As it contains your database connection details you should exclude it in .gitignore
 * src/config/templates/database.js - A dummy database configuration file that users can copy when cloning your repository
 * src/models/connection/knex.js - Knex instance
 * scripts/migrations/&lt;timestamp&gt;_setup.js - A migration template. You can use the Knex migration api to define your initial database setup in this file.

Dependencies will also be injected into your package.json along with the following scripts
* migratedb: Run Knex migrations. This can be used to setup or upgrade the database if you have migration files setup
* createmigration: Create a new Knex migration file

You can create models using the following command
```bash
yo bookshelf:model
```
This will prompt for the table name and id field you are creating the model for. It will also prompt to create relationships with any models you have already defined. Models are created in the src/models directory.

## License

Apache-2.0 © [Elvey]()


[npm-image]: https://badge.fury.io/js/generator-bookshelf.svg
[npm-url]: https://npmjs.org/package/generator-bookshelf
