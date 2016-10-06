'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {

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
    }.bind(this));
  },

  writing: function () {
		var tableName = this.props.tableName.replace(/ /g, '');
		var className = tableName.replace(/_+(.)/g, function(char) { return char.toUpperCase(); });

		this.fs.copyTpl(
			this.templatePath('model.js.ejs'),
			this.destinationPath('src/models/' + className + '.js'),
			{
				className: className,
				tableName: tableName,
				idAttribute: this.props.idAttribute
			}
		);
	}
});
