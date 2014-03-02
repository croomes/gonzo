# Setup notes

This sets up a Puppet Enterprise master and a few agents using [Oscar](https://github.com/adrienthebo/oscar),
and then attempts to configure for management with [Gonzo](https://github.com/croomes/gonzo).

## TODO

- The version of CouchDB that gets installed from EPEL is too old (1.0.4).  We need 1.3+ to get CORS suppport.
In the meantime run the Rails app / CouchDB from OS X using Couch's native installer (so much easier...)
- The MColective CouchDB registration agent installation is not yet complete.  Currently running from OS X.
- Add MCollective client key management to make it easier to connect from OS X.  Otherwise copy your public 
key to `/etc/puppetlabs/mcollective/ssl/clients/` on each node.  You need to be able to `mco ping` from OS X
and get replies from all nodes.
- Install Redis for background job queues.

## Installation

Working notes - no guarantees...

```
$ mkdir /Vagrant/projects/gonzo
$ cd /Vagrant/projects/gonzo
$ vagrant oscar init
$ vagrant oscar init-vms \
> --master master=centos-64-x64-vbox4210-nocm \
> --agent agent1=centos-64-x64-vbox4210-nocm \
> --agent agent2=centos-59-x64-vbox4210-nocm \
> --agent agent3=ubuntu-server-10044-x64-vbox4210-nocm
$ git clone https://github.com/croomes/puppet-gonzo-demo.git
$ vagrant up master
$ vagrant ssh master
master$ sudo -s
master# /etc/cron.d/default-add-all-nodes
master# puppet agent -tv
master# /vagrant/puppet-gonzo-demo/modules/classes/x_puppet/bin/bootstrap.sh
```

## Starting

Make sure each of these are running.  Only tested on OS X.

### Redis

Startup script or  `/usr/local/bin/redis-server /usr/local/etc/redis.conf`

### CouchDB

Start with the native console.  Web console available at [http://localhost:5984/_utils/index.html](http://localhost:5984/_utils/index.html)

### Rails App

`bundle install` before first run.  May need to set location of `pg_config` first with `export PATH=$PATH:/Library/PostgreSQL/9.2/bin` if errors compiling `pg`.

`rails server` to run.

### Resque background job processor

`rake resque:workers` or `rake resque:work QUEUE=mcollective_jobs` to watch jobs in the foreground.  Console is available at [http://localhost:3000/resque/overview](http://localhost:3000/resque/overview)
