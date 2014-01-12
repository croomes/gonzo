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
# A mixin for sending mesages to a redis backed message queue
module Mcomaster
  module RestMQ 
    require 'uuidtools'
    
    QUEUESET = 'QUEUESET' # queue index
    UUID_SUFFIX = ':UUID' # queue unique id
    QUEUE_SUFFIX = ':queue' # suffix to identify each queue's LIST

    def rmq_uuid
      UUIDTools::UUID.random_create.to_s
    end
        
    def rmq_send(txid, msg, expiry=300)
      q1 = txid + QUEUE_SUFFIX
      uuidkey = txid + UUID_SUFFIX
      uuid = $redis.incr uuidkey
      lkey = txid + ':' + uuid.to_s
      
      $redis.set lkey, msg.jsonize
      $redis.lpush q1, lkey
      
      $redis.expire uuidkey, expiry
      $redis.expire q1, expiry
      $redis.expire lkey, expiry 
      lkey
    end
  end
end
