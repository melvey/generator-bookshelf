'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var connections = {
	mysql: '2.11.1',
	mysql2: '1.1.1',
	mariasql: '0.2.6',
	pg: '6.1.0',
	sqlite3: '3.1.5',
	oracle: '0.3.9',
	'strong-oracle': '1.9.0',
	mssql: '3.3.0'
};

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the solid ' + chalk.red('generator-bookshelf') + ' generator!'
    ));

    var prompts = [
			{
				type: 'list',
				name: 'connection',
				message: 'Select database connection type',
				choices: Object.getOwnPropertyNames(connections),
				default: 'mysql'
			},
			{
				type: 'input',
				name: 'host',
				message: 'Database host',
				default: 'localhost'
			},
			{
				type: 'input',
				name: 'user',
				message: 'Database user',
				default: '<USER>'
			},
			{
				type: 'password',
				name: 'password',
				message: 'Database password',
				default: '<PASSWORD>'
			},
			{
				type: 'input',
				name: 'dbname',
				message: 'Database name',
				default: '<DBNAME>'
			}
		];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function () {
		// Add knex connection
    this.fs.copy(
      this.templatePath('dbconnection.js'),
      this.destinationPath('src/models/connection/knex.js')
    );

		// Add database configuration and template (the configuration should be ignored in .gitignore)
		this.fs.copyTpl(
			this.templatePath('config.js.ejs'),
			this.destinationPath('src/config/database.js'),
			{
				connection: this.props.connection,
				host: this.props.host,
				user: this.props.user,
				password: this.props.password,
				dbname: this.props.dbname
			}
		);
		this.fs.copyTpl(
			this.templatePath('config.js.ejs'),
			this.destinationPath('src/config/templates/database.js'),
			{
				connection: this.props.connection,
				host: '<HOSTNAME>',
				user: '<USER>',
				password: '<PASSWORD>',
				dbname: '<DBNAME>'
			}
		);

		// Add knex migration file
		const now = Date();
		const nowString = this.getUTCFullYear() 
        + pad(this.getUTCMonth() + 1) 
        + pad(this.getUTCDate()) 
        + pad(this.getUTCHours()) 
        + pad(this.getUTCMinutes()) 
        + pad(this.getUTCSeconds());
    this.fs.copy(
		this.templatePath('migration.js'),
      this.destinationPath('scripts/database/'+nowString+'_setup.js')
    );

		// Add knex scripts and dependencies to package.json
		var packageJSON = {
			scripts: {
				migratedb: "knex --knexfile src/config/database.js migrate:latest",
				createmigration: "knex --knexfile src/config/database migrate:make update"
			}
			dependencies: {
				knex: '0.12.2',
				bookshelf: '0.10.2'
			}
		};
		packageJSON.dependencies[this.props.connection] = connections[this.props.connection];
		this.fs.extendJSON('package.json', packageJSON);
  },

  install: function () {
    this.installDependencies();
  }
});
