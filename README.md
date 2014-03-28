# Gonzo - Puppet change impact console

**NOTE: Not ready for use/testing yet - in active development**

Gonzo lets you assess the impact of your Puppet change before rolling it out across your server estate.  It takes over after continuous integration tools have run their tests and deployed the release to the Puppet Masters, but before clients have been updated.

Gonzo's goal is to increase confidence in Puppet changes by making it easier to verify that all changes are intentional and understood.

![Release List](https://github.com/croomes/gonzo/raw/master/screenshots/main.jpg)
![Release Summary](https://github.com/croomes/gonzo/raw/master/screenshots/release.jpg)
![Release Changes](https://github.com/croomes/gonzo/raw/master/screenshots/changes.jpg)
![Release Reports](https://github.com/croomes/gonzo/raw/master/screenshots/reports.jpg)
![Node inventory](https://github.com/croomes/gonzo/raw/master/screenshots/nodes.jpg)

## Technical Overview

Changes are implemented using standard Puppet catalogs.  Each release becomes a new environment, using [dynamic environments](http://puppetlabs.com/blog/git-workflow-and-puppet-environments) on the Puppet Masters.

The web console is used to review releases, initiate "noop" runs, review the results and assess the impact.  The console is written in [AngularJS](http://angularjs.org/) with a Ruby on Rails backend.  MCollective is used to run pre-flight "noop" Puppet runs and it stores prospective changes in CouchDB, a JSON document store.  Portions of the CouchDB database are replicated in real-time to the browser using PouchDB, allowing instant updates to the web console.  Replication is bi-directional: risk assessments are remembered across multiple runs.

## System Dependencies

All development is done on a Macbook Pro running:
* [RVM](https://rvm.io/)/[Ruby 2.1.0 tested](https://www.ruby-lang.org)/[Rails 4+ tested](http://rubyonrails.org/)
* [CouchDB](http://couchdb.apache.org/) - Assumes local install.
* [Vagrant](http://www.vagrantup.com/) - Nodes to test on.
* [Oscar](https://github.com/adrienthebo/oscar).  Puppet Enterprise used for development, but shouldn't be required.
* [MCollective CouchDB Registration agent](https://github.com/croomes/marionette-collective/blob/master/plugins/mcollective/agent/registration.rb) (recommended, but optional)

The web console requires a modern browser that supports IndexedDB (Chrome, Firefox, IE 10+).  Development is against Chrome.

## Installation

See [SETUP.md](https://github.com/croomes/gonzo/blob/master/SETUP.md).  You will probably want to use [puppet-gonzo-demo](https://github.com/croomes/puppet-gonzo-demo) to setup a standalone demo.

## Security

There is currently no authentication or access control model in place.  Database replication and API calls are currently in clear text and use default/guessable passwords.  It is not suitable for public-facing deployments.

## Contributing

Please help!  Documentation is especially poor at this stage, and ideally packages created for easier installation.  I'd also like to remove Rails and switch to Sinatra as the server-side API very minimal.  See [TODO.md](https://github.com/croomes/gonzo/blob/master/TODO.md) for a list of ideas.

## Contact

Simon Croome / simon@croome.org