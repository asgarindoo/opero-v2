const fs = require('fs');

const models = ['Task', 'Flow', 'Campaign', 'Contact', 'Role', 'Goal', 'Sale', 'Invoice', 'Transaction', 'Product', 'Asset', 'Document', 'Folder', 'Bot', 'Report', 'SocialChannel', 'SocialSchedule', 'SocialActivity', 'ContentPost', 'ContentAsset', 'ChatChannel', 'ChatMessage'];

let out = '';
let orgRelations = '';
let userCreatedRelations = '';
let userUpdatedRelations = '';

for (const m of models) {
  const lower = m.charAt(0).toLowerCase() + m.slice(1);
  const isIES = m.endsWith('y') ? 'ies' : m.endsWith('s') ? 'es' : 's';
  const pluralLower = lower.endsWith('y') ? lower.slice(0, -1) + 'ies' : lower + 's';
  
  orgRelations += `  ${pluralLower.padEnd(20)} ${m}[]\n`;
  userCreatedRelations += `  ${pluralLower}Created ${m}[] @relation("${m}CreatedBy")\n`;
  userUpdatedRelations += `  ${pluralLower}Updated ${m}[] @relation("${m}UpdatedBy")\n`;

  const mapName = lower.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

  out += `
model ${m} {
  id             String   @id @default(cuid())
  organizationId String
  title          String?
  status         String?
  payload        Json?
  createdById    String?
  updatedById    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdBy    User?       @relation("${m}CreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  updatedBy    User?       @relation("${m}UpdatedBy", fields: [updatedById], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@map("${mapName}")
}
`;
}

fs.writeFileSync('new_models.prisma', out);
fs.writeFileSync('org_relations.txt', orgRelations);
fs.writeFileSync('user_relations.txt', userCreatedRelations + '\n' + userUpdatedRelations);
