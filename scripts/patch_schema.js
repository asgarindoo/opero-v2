const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const newModels = fs.readFileSync('new_models.prisma', 'utf8');
const orgRels = fs.readFileSync('org_relations.txt', 'utf8');
const userRels = fs.readFileSync('user_relations.txt', 'utf8');

// Inject into User
schema = schema.replace(
  /tenantRecordsCreated TenantRecord\[\] @relation\("TenantRecordCreatedBy"\)\n\s+tenantRecordsUpdated TenantRecord\[\] @relation\("TenantRecordUpdatedBy"\)/g,
  userRels.trim()
);

// Inject into Organization
schema = schema.replace(
  /tenantRecords\s+TenantRecord\[\]/g,
  orgRels.trim()
);

// Remove TenantRecord model completely
const trStart = schema.indexOf('/// Generic tenant-scoped records');
if (trStart !== -1) {
  const trEnd = schema.indexOf('@@map("tenant_record")\n}', trStart);
  if (trEnd !== -1) {
    schema = schema.substring(0, trStart) + schema.substring(trEnd + '@@map("tenant_record")\n}'.length);
  }
}

// Append new models
schema += '\n// ─────────────────────────────────────────────────────────\n// NEW FEATURE MODELS (TENANT AWARE)\n// ─────────────────────────────────────────────────────────\n' + newModels;

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema patched successfully');
