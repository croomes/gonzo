metadata    :name        => "redis",
            :description => "Redis based discovery to compliment the Redis connector and registration",
            :author      => "R.I.Pienaar <rip@devco.net>",
            :license     => "ASL 2.0",
            :version     => "0.1",
            :url         => "http://marionette-collective.org/",
            :timeout     => 0

discovery do
    capabilities [:classes, :facts, :identity, :agents]
end
