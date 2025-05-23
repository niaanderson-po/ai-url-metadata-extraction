import { db } from '@oyster/db';

import { job } from '@/infrastructure/bull';
import { type GetBullJobData } from '@/infrastructure/bull.types';

type StudentCreatedInput = GetBullJobData<'student.created'>;

export async function onMemberCreated(input: StudentCreatedInput) {
  // This is a pretty silly, but we need the `school` to be populated on the
  // student when creating the external database record, so we'll fetch a
  // fresh version of the student.
  const student = await db
    .selectFrom('students')
    .select([
      'email',
      'firstName',
      'gender',
      'graduationYear',
      'id',
      'lastName',
      'otherDemographics',
      'race',
    ])
    .where('id', '=', input.studentId)
    .executeTakeFirstOrThrow();

  job('student.engagement.backfill', {
    email: student.email,
    studentId: student.id,
  });

  job('airtable.record.create.member', {
    studentId: student.id,
  });

  job('mailchimp.add', {
    email: student.email,
    firstName: student.firstName,
    lastName: student.lastName,
  });
}
