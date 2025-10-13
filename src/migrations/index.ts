import * as migration_20250929_111647 from './20250929_111647'
import * as migration_20251010_051437 from './20251010_051437'
import * as migration_20251013_131333 from './20251013_131333'
import * as migration_20251013_154151 from './20251013_154151'
import * as migration_20251013_jsonld_field from './20251013_jsonld_field'

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20251010_051437.up,
    down: migration_20251010_051437.down,
    name: '20251010_051437',
  },
  {
    up: migration_20251013_131333.up,
    down: migration_20251013_131333.down,
    name: '20251013_131333',
  },
  {
    up: migration_20251013_154151.up,
    down: migration_20251013_154151.down,
    name: '20251013_154151',
  },
  {
    up: migration_20251013_jsonld_field.up,
    down: migration_20251013_jsonld_field.down,
    name: '20251013_jsonld_field',
  },
]
