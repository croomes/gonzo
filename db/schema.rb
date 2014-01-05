# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140105231620) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "friendly_id_slugs", force: true do |t|
    t.string   "slug",                      null: false
    t.integer  "sluggable_id",              null: false
    t.string   "sluggable_type", limit: 50
    t.string   "scope"
    t.datetime "created_at"
  end

  add_index "friendly_id_slugs", ["slug", "sluggable_type", "scope"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type_and_scope", unique: true, using: :btree
  add_index "friendly_id_slugs", ["slug", "sluggable_type"], name: "index_friendly_id_slugs_on_slug_and_sluggable_type", using: :btree
  add_index "friendly_id_slugs", ["sluggable_id"], name: "index_friendly_id_slugs_on_sluggable_id", using: :btree
  add_index "friendly_id_slugs", ["sluggable_type"], name: "index_friendly_id_slugs_on_sluggable_type", using: :btree

  create_table "host_releases", id: false, force: true do |t|
    t.integer  "host_id",      null: false
    t.integer  "release_id",   null: false
    t.string   "status"
    t.string   "targetstatus"
    t.text     "report"
    t.string   "slug"
    t.datetime "statusdate"
    t.datetime "reportdate"
    t.datetime "targetdate"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "host_releases", ["host_id"], name: "index_host_releases_on_host_id", using: :btree
  add_index "host_releases", ["release_id"], name: "index_host_releases_on_release_id", using: :btree

  create_table "hosts", force: true do |t|
    t.string   "name"
    t.string   "status"
    t.string   "slug"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "hosts", ["slug"], name: "index_hosts_on_slug", unique: true, using: :btree

  create_table "products", force: true do |t|
    t.string   "name"
    t.string   "description"
    t.boolean  "semver"
    t.string   "slug"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "products", ["slug"], name: "index_products_on_slug", unique: true, using: :btree

  create_table "releases", force: true do |t|
    t.string   "version"
    t.integer  "product_id"
    t.string   "status"
    t.string   "slug"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "releases", ["slug"], name: "index_releases_on_slug", unique: true, using: :btree

end
