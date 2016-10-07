'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');

module.exports = yeoman.Base.extend({
  prompting: function () {

		// Get existing models for relationship prompt
		var files = fs.readdirSync('src/models').map(function(file) {
			var matches = /(.*)\.js$/.exec(file);
			if(matches) {
				return matches[1];
			}
		}).filter(function(model) {
			return model ? true : false;
		});

		var loadTableName = function(model) {
			var tablename = null;
			var filename = 'src/models/' + model + '.js';
			if(fs.statSync(filename)) {
				// Assuming models are small. This could get ugly with large files (should a model get large???)
				var buf = fs.readFileSync(filename, 'utf8');
				if(buf) {
					var match = buf.match(/tableName: '([_-a-zA-Z0-9]+)'/);
					if(match) {
						tablename = match[1];
					}
				}
			} 
			if(!tablename){
				tablename = model.replace(/([A-Z])/g, function(c) { return '_' + c.toLowerCase(); });
			}
			return tablename;
		};


		var relationships = [];
		var askRelationship = function(self) {
			var showQuestion = function(answers) { return answers.add};
			var foreignKeyText = function(answers) { return ['belongsTo', 'belongsToMany'].indexOf(answers.relationship) >= 0 ? 'Foreign key (in this model)' : 'Foreign key (in target model)'; };
			var foreignKeyDefault= function(answers) { return ['belongsTo', 'belongsToMany'].indexOf(answers.relationship) >= 0 ? loadTableName(answers.model) + '_id' : self.props.tableName + '_id'; };

			var questions = [
				{
					type: 'confirm',
					name: 'add',
					message: 'Add a relationship?',
					default: false
				},
				{
					when: showQuestion,
					type: 'rawlist',
					name: 'model',
					message: 'Target model',
					choices: files
				},
				{
					when: showQuestion,
					type: 'list',
					name: 'relationship',
					message: 'Relationship type',
					choices: ['belongsTo', 'hasOne', 'belongsToMany', 'hasMany']
				},
				{
					when: showQuestion,
					type: 'input',
					name: 'foreignKey',
					message: foreignKeyText,
					default: foreignKeyDefault
				},
				{
					when: function(answers) { return showQuestion(answers) && answers.relationship === 'belongsToMany'; },
					type: 'input',
					name: 'joiningTable',
					message: 'Joining table',
					default: function(answers) {
						return answers.model.charAt(0).toLowerCase() < self.props.tableName.charAt(0).toLowerCase()
							? loadTableName(answers.model) + '_' + self.props.tableName
							: self.props.tableName + '_' + loadTableName(answers.model);
					}
				},
				{
					when: function(answers) { return showQuestion(answers) && answers.relationship === 'belongsToMany'; },
					type: 'input',
					name: 'otherKey',
					message: 'Foreign key in target model',
					default: self.props.tableName + '_id'
				}
			];

			return self.prompt(questions).then(function(props) {
				if(props.add) {
					relationships.push(props);
					return askRelationship(self);
				} else {
					self.props.relationships = relationships;
					return;
				}
			});
		}

    var prompts = [
			{
				type: 'input',
				name: 'tableName',
				message: 'Table Name'
			},
			{
				type: 'input',
				name: 'idAttribute',
				message: 'idAttribute',
				default: 'id'
			}
		];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
			return askRelationship(this);
    }.bind(this));
  },

  writing: function () {
		var tableName = this.props.tableName.replace(/ /g, '');
		var className = tableName.replace(/_+(.)/g, function(full, char) { return char.toUpperCase(); });

		this.fs.copyTpl(
			this.templatePath('model.js.ejs'),
			this.destinationPath('src/models/' + className + '.js'),
			{
				className: className,
				tableName: tableName,
				idAttribute: this.props.idAttribute,
				relationships: this.props.relationships
			}
		);
	}
});
