class CreateHostReleases < ActiveRecord::Migration
  def change
    create_join_table :host, :releases do |t|
      t.index :host_id
      t.index :release_id
      t.string :status
      t.string :targetstatus
      t.text :report
      t.string :slug
      t.datetime :statusdate
      t.datetime :reportdate
      t.datetime :targetdate
      t.timestamps
    end
    add_index :host_releases, [:host_id, :release_id]
  end
end
