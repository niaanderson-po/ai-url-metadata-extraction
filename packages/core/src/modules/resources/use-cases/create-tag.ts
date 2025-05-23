import { db } from '@oyster/db';

import { type CreateTagInput } from '@/modules/resources/resources.types';

export async function createTag(input: CreateTagInput) {
  const result = await db.transaction().execute(async (trx) => {
    const tag = await trx
      .insertInto('resourceTags')
      .values({
        color: input.color,
        createdAt: new Date(),
        id: input.id,
        name: input.name,
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();

    return tag;
  });

  return result;
}
