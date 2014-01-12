# Copyright 2013 ajf http://github.com/ajf8
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# A mixin to for some interactions with the MCollective API
require 'mcollective'

include MCollective::RPC

module Gonzo
  module McClient
    
    # get a mco client with our extra options, which doesn't display progress,
    # doesn't exit the app on errors, doesn't use command line options
    def mcm_rpcclient(agent)
      options = MCollective::Util.default_options
      # allow mcollective options to be set in application.yml
      # merged over default options
      if !APP_CONFIG['mcollective'].nil?
        options.merge!(APP_CONFIG['mcollective'])
      end
      mc = MCollective::RPC::rpcclient(agent, :exit_on_failure => false, :options => options)
      mc.progress = false
      mc
    end

    def get_real_ddl(name)
      mc = mcm_rpcclient(name)
      mc.ddl
    end
    
    # do some backwards compatability and only get stuff from the DDL
    # that we need
    def get_ddl(name)
      ddl = get_real_ddl(name)
      # backwards compatibility for older versions of mcollective
      # (or the other way around, I forget)
      transform = { :meta => ddl.meta }
      if ddl.actions
        actions = {}
        for action in ddl.actions
          actions[action] = ddl.action_interface(action)
        end
        transform[:actions] = actions
      else
        transform[:actions] = ddl.entities
      end
      transform
    end

    # given a filter with any number of filter types (eg. facts, classes) 
    # set, merge it over an empty filter and then convert the top level
    # keys eg. 'facts' to :facts and the members of that filter type
    # are a hash convert its keys.
    # eg. [ { 'fact' : 'kernel', 'operator' : '==', 'value' == 'Linux' } ]
    # to [ { :fact => 'kernel', :operator => '==', :value => 'Linux' } ]
    def convert_filter(original)
      filters = MCollective::Util::empty_filter()
      filters.merge!(original)
      filters.each{ |filter_type,filter_array|
        if filter_array.is_a?(Array)
          filter_array.each { |filter_item|
            if filter_item.is_a?(Hash)
              filter_item.symbolize_keys!
            end
          }
        end
      }
      return filters
    end
  end
end