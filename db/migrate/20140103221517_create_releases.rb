class CreateReleases < ActiveRecord::Migration
  def change
    create_table :releases do |t|
      t.string :version
      t.belongs_to :product
      t.string :status
      t.string :slug
      t.timestamps
    end
    add_index :releases, :slug, unique: true
  end
end
