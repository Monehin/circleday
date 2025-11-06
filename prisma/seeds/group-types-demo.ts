/**
 * Seed script for demonstrating PERSONAL and TEAM group types
 * 
 * Run with: npx tsx prisma/seeds/group-types-demo.ts
 */

import { PrismaClient } from '@prisma/client'
import { addDays } from 'date-fns'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Starting Group Types Demo Seed...\n')

  // Clean up existing demo data
  console.log('🧹 Cleaning up existing demo data...')
  await db.auditLog.deleteMany({
    where: {
      group: {
        name: {
          in: [
            'Tech Team Birthdays',
            'Smith Family Circle',
            'Marketing Department',
            'Johnson Family',
          ],
        },
      },
    },
  })
  
  // Clean up scheduled sends for demo events (preserving sends for e.monehin@live.com)
  await db.scheduledSend.deleteMany({
    where: {
      event: {
        contact: {
          email: {
            in: [
              'john.dev@example.com',
              'emily.designer@example.com',
              'mike.lead@example.com',
              'dad.smith@example.com',
              'mom.smith@example.com',
              'alex.smith@example.com',
              'jamie.smith@example.com',
              'lisa.marketing@example.com',
              'tom.sales@example.com',
              'kate.content@example.com',
              'david.johnson@example.com',
              'susan.johnson@example.com',
              'peter.johnson@example.com',
            ],
          },
        },
      },
    },
  })

  await db.reminderRule.deleteMany({
    where: {
      group: {
        name: {
          in: [
            'Tech Team Birthdays',
            'Smith Family Circle',
            'Marketing Department',
            'Johnson Family',
          ],
        },
      },
    },
  })

  // Clean up demo events (preserving events for e.monehin@live.com)
  await db.event.deleteMany({
    where: {
      contact: {
        email: {
          in: [
            'john.dev@example.com',
            'emily.designer@example.com',
            'mike.lead@example.com',
            'dad.smith@example.com',
            'mom.smith@example.com',
            'alex.smith@example.com',
            'jamie.smith@example.com',
            'lisa.marketing@example.com',
            'tom.sales@example.com',
            'kate.content@example.com',
            'david.johnson@example.com',
            'susan.johnson@example.com',
            'peter.johnson@example.com',
          ],
        },
      },
    },
  })

  // Clean up demo memberships (preserving e.monehin@live.com's memberships)
  await db.membership.deleteMany({
    where: {
      contact: {
        email: {
          in: [
            'john.dev@example.com',
            'emily.designer@example.com',
            'mike.lead@example.com',
            'dad.smith@example.com',
            'mom.smith@example.com',
            'alex.smith@example.com',
            'jamie.smith@example.com',
            'lisa.marketing@example.com',
            'tom.sales@example.com',
            'kate.content@example.com',
            'david.johnson@example.com',
            'susan.johnson@example.com',
            'peter.johnson@example.com',
          ],
        },
      },
    },
  })

  // Note: Not deleting contacts associated with e.monehin@live.com
  await db.contact.deleteMany({
    where: {
      email: {
        in: [
          'john.dev@example.com',
          'emily.designer@example.com',
          'mike.lead@example.com',
          'dad.smith@example.com',
          'mom.smith@example.com',
          'alex.smith@example.com',
          'jamie.smith@example.com',
          'lisa.marketing@example.com',
          'tom.sales@example.com',
          'kate.content@example.com',
          'david.johnson@example.com',
          'susan.johnson@example.com',
          'peter.johnson@example.com',
        ],
      },
    },
  })

  await db.group.deleteMany({
    where: {
      name: {
        in: [
          'Tech Team Birthdays',
          'Smith Family Circle',
          'Marketing Department',
          'Johnson Family',
        ],
      },
    },
  })

  // Note: Not deleting e.monehin@live.com as it's the primary account owner
  await db.user.deleteMany({
    where: {
      email: {
        in: [
          'john.dev@example.com',
          'emily.designer@example.com',
          'mike.lead@example.com',
          'dad.smith@example.com',
          'mom.smith@example.com',
          'alex.smith@example.com',
          'jamie.smith@example.com',
          'lisa.marketing@example.com',
          'tom.sales@example.com',
          'kate.content@example.com',
          'david.johnson@example.com',
          'susan.johnson@example.com',
          'peter.johnson@example.com',
        ],
      },
    },
  })

  console.log('✅ Cleanup complete\n')

  // ============================================================================
  // SCENARIO 1: PERSONAL Group - Tech Team (Manager tracks team birthdays)
  // ============================================================================
  console.log('📊 Scenario 1: PERSONAL Group - Tech Team Birthdays')
  console.log('   Use case: Manager tracks all team member birthdays')
  console.log('   Behavior: Only you (manager) receive all reminders\n')

  // Create users for tech team
  // Use your email as the primary account owner
  const sarahManager = await db.user.upsert({
    where: { email: 'e.monehin@live.com' },
    update: {},
    create: {
      name: 'Emmanuel Monehin',
      email: 'e.monehin@live.com',
      phone: '+14155551001',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/Los_Angeles',
    },
  })

  const johnDev = await db.user.create({
    data: {
      name: 'John Smith',
      email: 'john.dev@example.com',
      phone: '+14155551002',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/Los_Angeles',
    },
  })

  const emilyDesigner = await db.user.create({
    data: {
      name: 'Emily Rodriguez',
      email: 'emily.designer@example.com',
      phone: '+14155551003',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/Los_Angeles',
    },
  })

  const mikeLead = await db.user.create({
    data: {
      name: 'Mike Johnson',
      email: 'mike.lead@example.com',
      phone: '+14155551004',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/Los_Angeles',
    },
  })

  // Create PERSONAL group
  const techTeamGroup = await db.group.create({
    data: {
      name: 'Tech Team Birthdays',
      type: 'PERSONAL',
      ownerId: sarahManager.id,
      defaultTimezone: 'America/Los_Angeles',
      maxEventsPerMember: 5,
      remindersEnabled: true,
    },
  })

  console.log(`   ✓ Created PERSONAL group: ${techTeamGroup.name}`)

  // Create contacts and memberships
  const sarahContact = await db.contact.upsert({
    where: { id: `user_${sarahManager.id}` },
    update: {},
    create: {
      id: `user_${sarahManager.id}`,
      name: sarahManager.name || sarahManager.email,
      email: sarahManager.email,
      phone: sarahManager.phone || null,
      timezone: 'America/Los_Angeles',
    },
  })

  await db.membership.create({
    data: {
      groupId: techTeamGroup.id,
      userId: sarahManager.id,
      contactId: sarahContact.id,
      role: 'OWNER',
    },
  })

  const johnContact = await db.contact.create({
    data: {
      name: johnDev.name,
      email: johnDev.email,
      phone: johnDev.phone,
      timezone: 'America/Los_Angeles',
    },
  })

  await db.membership.create({
    data: {
      groupId: techTeamGroup.id,
      userId: johnDev.id,
      contactId: johnContact.id,
      role: 'MEMBER',
    },
  })

  // Add John's birthday
  await db.event.create({
    data: {
      contactId: johnContact.id,
      type: 'BIRTHDAY',
      date: new Date(1990, 5, 15), // June 15, 1990
      yearKnown: true,
      repeat: true,
      notes: 'Loves chocolate cake!',
    },
  })

  const emilyContact = await db.contact.create({
    data: {
      name: emilyDesigner.name,
      email: emilyDesigner.email,
      phone: emilyDesigner.phone,
      timezone: 'America/Los_Angeles',
    },
  })

  await db.membership.create({
    data: {
      groupId: techTeamGroup.id,
      userId: emilyDesigner.id,
      contactId: emilyContact.id,
      role: 'MEMBER',
    },
  })

  // Add Emily's work anniversary
  await db.event.create({
    data: {
      contactId: emilyContact.id,
      type: 'ANNIVERSARY',
      title: 'Work Anniversary',
      date: new Date(2020, 2, 1), // March 1, 2020
      yearKnown: true,
      repeat: true,
      notes: '5 years with the company!',
    },
  })

  const mikeContact = await db.contact.create({
    data: {
      name: mikeLead.name,
      email: mikeLead.email,
      phone: mikeLead.phone,
      timezone: 'America/Los_Angeles',
    },
  })

  await db.membership.create({
    data: {
      groupId: techTeamGroup.id,
      userId: mikeLead.id,
      contactId: mikeContact.id,
      role: 'MEMBER',
    },
  })

  // Add Mike's birthday (upcoming in 10 days for demo)
  const mikeBirthday = addDays(new Date(), 10)
  await db.event.create({
    data: {
      contactId: mikeContact.id,
      type: 'BIRTHDAY',
      date: new Date(mikeBirthday.getFullYear(), mikeBirthday.getMonth(), mikeBirthday.getDate()),
      yearKnown: true,
      repeat: true,
      notes: 'Team lead - prefers coffee gift cards',
    },
  })

  // Add reminder rules for tech team
  await db.reminderRule.create({
    data: {
      groupId: techTeamGroup.id,
      offsets: [-7, -1, 0],
      channels: {
        '-7': ['EMAIL'],
        '-1': ['EMAIL', 'SMS'],
        '0': ['EMAIL', 'SMS'],
      },
      sendHour: 9,
    },
  })

  // Add audit log
  await db.auditLog.create({
    data: {
      actorId: sarahManager.id,
      groupId: techTeamGroup.id,
      method: 'CREATE',
      entity: 'Group',
      entityId: techTeamGroup.id,
      diffJson: { 
        new: { 
          name: techTeamGroup.name, 
          type: 'PERSONAL',
          note: 'Manager tracks all team member birthdays and work anniversaries'
        } 
      },
    },
  })

  console.log(`   ✓ Added 4 members (You as owner + 3 team members)`)
  console.log(`   ✓ Added 3 events (2 birthdays, 1 work anniversary)`)
  console.log(`   ✓ Set reminder rules: 7 days, 1 day, day-of`)
  console.log(`   → Result: Only YOU (e.monehin@live.com) receive ALL reminders\n`)

  // ============================================================================
  // SCENARIO 2: TEAM Group - Smith Family (Everyone reminds each other)
  // ============================================================================
  console.log('👨‍👩‍👧‍👦 Scenario 2: TEAM Group - Smith Family Circle')
  console.log('   Use case: Family members remind each other of birthdays')
  console.log('   Behavior: Everyone gets reminders EXCEPT the birthday person\n')

  // Create users for Smith family
  const dadSmith = await db.user.create({
    data: {
      name: 'Robert Smith',
      email: 'dad.smith@example.com',
      phone: '+14155552001',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/New_York',
    },
  })

  const momSmith = await db.user.create({
    data: {
      name: 'Jennifer Smith',
      email: 'mom.smith@example.com',
      phone: '+14155552002',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/New_York',
    },
  })

  const alexSmith = await db.user.create({
    data: {
      name: 'Alex Smith',
      email: 'alex.smith@example.com',
      phone: '+14155552003',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/New_York',
    },
  })

  const jamieSmith = await db.user.create({
    data: {
      name: 'Jamie Smith',
      email: 'jamie.smith@example.com',
      phone: '+14155552004',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/New_York',
    },
  })

  // Create TEAM group
  const smithFamilyGroup = await db.group.create({
    data: {
      name: 'Smith Family Circle',
      type: 'TEAM',
      ownerId: dadSmith.id,
      defaultTimezone: 'America/New_York',
      remindersEnabled: true,
    },
  })

  console.log(`   ✓ Created TEAM group: ${smithFamilyGroup.name}`)

  // Create contacts and memberships for Smith family
  const dadSmithContact = await db.contact.create({
    data: {
      name: dadSmith.name,
      email: dadSmith.email,
      phone: dadSmith.phone,
      timezone: 'America/New_York',
    },
  })

  await db.membership.create({
    data: {
      groupId: smithFamilyGroup.id,
      userId: dadSmith.id,
      contactId: dadSmithContact.id,
      role: 'OWNER',
    },
  })

  // Add Dad's birthday (upcoming in 5 days for demo)
  const dadBirthday = addDays(new Date(), 5)
  await db.event.create({
    data: {
      contactId: dadSmithContact.id,
      type: 'BIRTHDAY',
      date: new Date(dadBirthday.getFullYear(), dadBirthday.getMonth(), dadBirthday.getDate()),
      yearKnown: true,
      repeat: true,
      notes: 'Golf enthusiast',
    },
  })

  const momSmithContact = await db.contact.create({
    data: {
      name: momSmith.name,
      email: momSmith.email,
      phone: momSmith.phone,
      timezone: 'America/New_York',
    },
  })

  await db.membership.create({
    data: {
      groupId: smithFamilyGroup.id,
      userId: momSmith.id,
      contactId: momSmithContact.id,
      role: 'ADMIN',
    },
  })

  // Add Mom's birthday
  await db.event.create({
    data: {
      contactId: momSmithContact.id,
      type: 'BIRTHDAY',
      date: new Date(1975, 8, 20), // September 20, 1975
      yearKnown: true,
      repeat: true,
      notes: 'Loves gardening',
    },
  })

  const alexSmithContact = await db.contact.create({
    data: {
      name: alexSmith.name,
      email: alexSmith.email,
      phone: alexSmith.phone,
      timezone: 'America/New_York',
    },
  })

  await db.membership.create({
    data: {
      groupId: smithFamilyGroup.id,
      userId: alexSmith.id,
      contactId: alexSmithContact.id,
      role: 'MEMBER',
    },
  })

  // Add Alex's birthday
  await db.event.create({
    data: {
      contactId: alexSmithContact.id,
      type: 'BIRTHDAY',
      date: new Date(2005, 3, 10), // April 10, 2005
      yearKnown: true,
      repeat: true,
      notes: 'Teenager, loves video games',
    },
  })

  const jamieSmithContact = await db.contact.create({
    data: {
      name: jamieSmith.name,
      email: jamieSmith.email,
      phone: jamieSmith.phone,
      timezone: 'America/New_York',
    },
  })

  await db.membership.create({
    data: {
      groupId: smithFamilyGroup.id,
      userId: jamieSmith.id,
      contactId: jamieSmithContact.id,
      role: 'MEMBER',
    },
  })

  // Add Jamie's birthday (upcoming in 15 days for demo)
  const jamieBirthday = addDays(new Date(), 15)
  await db.event.create({
    data: {
      contactId: jamieSmithContact.id,
      type: 'BIRTHDAY',
      date: new Date(jamieBirthday.getFullYear(), jamieBirthday.getMonth(), jamieBirthday.getDate()),
      yearKnown: true,
      repeat: true,
      notes: 'Youngest, loves art supplies',
    },
  })

  // Add reminder rules for Smith family
  await db.reminderRule.create({
    data: {
      groupId: smithFamilyGroup.id,
      offsets: [-3, 0],
      channels: {
        '-3': ['EMAIL'],
        '0': ['EMAIL', 'SMS'],
      },
      sendHour: 8,
    },
  })

  // Add audit log
  await db.auditLog.create({
    data: {
      actorId: dadSmith.id,
      groupId: smithFamilyGroup.id,
      method: 'CREATE',
      entity: 'Group',
      entityId: smithFamilyGroup.id,
      diffJson: { 
        new: { 
          name: smithFamilyGroup.name, 
          type: 'TEAM',
          note: 'Family members remind each other of birthdays'
        } 
      },
    },
  })

  console.log(`   ✓ Added 4 members (all family members)`)
  console.log(`   ✓ Added 4 birthdays`)
  console.log(`   ✓ Set reminder rules: 3 days, day-of`)
  console.log(`   → Result: When it's Dad's birthday:`)
  console.log(`             • Mom, Alex, Jamie get reminders`)
  console.log(`             • Dad does NOT get reminded of his own birthday`)
  console.log(`   → Result: When it's Jamie's birthday:`)
  console.log(`             • Dad, Mom, Alex get reminders`)
  console.log(`             • Jamie does NOT get reminded of their own birthday\n`)

  // ============================================================================
  // SCENARIO 3: PERSONAL Group - Marketing Dept (HR tracks department)
  // ============================================================================
  console.log('💼 Scenario 3: PERSONAL Group - Marketing Department')
  console.log('   Use case: HR coordinator tracks department celebrations')
  console.log('   Behavior: Only Lisa (HR) receives all reminders\n')

  const lisaHR = await db.user.create({
    data: {
      name: 'Lisa Anderson',
      email: 'lisa.marketing@example.com',
      phone: '+14155553001',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/Chicago',
    },
  })

  const tomSales = await db.user.create({
    data: {
      name: 'Tom Wilson',
      email: 'tom.sales@example.com',
      phone: '+14155553002',
      emailVerified: true,
      phoneVerified: false,
      defaultTimezone: 'America/Chicago',
    },
  })

  const kateContent = await db.user.create({
    data: {
      name: 'Kate Brown',
      email: 'kate.content@example.com',
      phone: '+14155553003',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'America/Chicago',
    },
  })

  const marketingGroup = await db.group.create({
    data: {
      name: 'Marketing Department',
      type: 'PERSONAL',
      ownerId: lisaHR.id,
      defaultTimezone: 'America/Chicago',
      maxEventsPerMember: 3,
      remindersEnabled: true,
    },
  })

  console.log(`   ✓ Created PERSONAL group: ${marketingGroup.name}`)

  // Create contacts and memberships
  const lisaContact = await db.contact.create({
    data: {
      name: lisaHR.name,
      email: lisaHR.email,
      phone: lisaHR.phone,
      timezone: 'America/Chicago',
    },
  })

  await db.membership.create({
    data: {
      groupId: marketingGroup.id,
      userId: lisaHR.id,
      contactId: lisaContact.id,
      role: 'OWNER',
    },
  })

  const tomContact = await db.contact.create({
    data: {
      name: tomSales.name,
      email: tomSales.email,
      phone: tomSales.phone,
      timezone: 'America/Chicago',
    },
  })

  await db.membership.create({
    data: {
      groupId: marketingGroup.id,
      userId: tomSales.id,
      contactId: tomContact.id,
      role: 'MEMBER',
    },
  })

  // Add Tom's work anniversary (upcoming in 8 days)
  const tomAnniversary = addDays(new Date(), 8)
  await db.event.create({
    data: {
      contactId: tomContact.id,
      type: 'ANNIVERSARY',
      title: 'Work Anniversary',
      date: new Date(tomAnniversary.getFullYear(), tomAnniversary.getMonth(), tomAnniversary.getDate()),
      yearKnown: true,
      repeat: true,
      notes: '3 years - top performer',
    },
  })

  const kateContact = await db.contact.create({
    data: {
      name: kateContent.name,
      email: kateContent.email,
      phone: kateContent.phone,
      timezone: 'America/Chicago',
    },
  })

  await db.membership.create({
    data: {
      groupId: marketingGroup.id,
      userId: kateContent.id,
      contactId: kateContact.id,
      role: 'MEMBER',
    },
  })

  // Add Kate's birthday
  await db.event.create({
    data: {
      contactId: kateContact.id,
      type: 'BIRTHDAY',
      date: new Date(1992, 10, 5), // November 5, 1992
      yearKnown: true,
      repeat: true,
      notes: 'Content writer - loves books',
    },
  })

  await db.reminderRule.create({
    data: {
      groupId: marketingGroup.id,
      offsets: [-5, 0],
      channels: {
        '-5': ['EMAIL'],
        '0': ['EMAIL'],
      },
      sendHour: 9,
    },
  })

  await db.auditLog.create({
    data: {
      actorId: lisaHR.id,
      groupId: marketingGroup.id,
      method: 'CREATE',
      entity: 'Group',
      entityId: marketingGroup.id,
      diffJson: { 
        new: { 
          name: marketingGroup.name, 
          type: 'PERSONAL',
          note: 'HR tracks department celebrations'
        } 
      },
    },
  })

  console.log(`   ✓ Added 3 members (Lisa as coordinator + 2 dept members)`)
  console.log(`   ✓ Added 2 events (1 work anniversary, 1 birthday)`)
  console.log(`   ✓ Set reminder rules: 5 days, day-of`)
  console.log(`   → Result: Only Lisa receives ALL reminders\n`)

  // ============================================================================
  // SCENARIO 4: TEAM Group - Johnson Family (Small family, mutual reminders)
  // ============================================================================
  console.log('👫 Scenario 4: TEAM Group - Johnson Family')
  console.log('   Use case: Small family with mutual celebration tracking')
  console.log('   Behavior: Couple reminds each other of anniversaries\n')

  const davidJohnson = await db.user.create({
    data: {
      name: 'David Johnson',
      email: 'david.johnson@example.com',
      phone: '+14155554001',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'Europe/London',
    },
  })

  const susanJohnson = await db.user.create({
    data: {
      name: 'Susan Johnson',
      email: 'susan.johnson@example.com',
      phone: '+14155554002',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'Europe/London',
    },
  })

  const peterJohnson = await db.user.create({
    data: {
      name: 'Peter Johnson',
      email: 'peter.johnson@example.com',
      phone: '+14155554003',
      emailVerified: true,
      phoneVerified: true,
      defaultTimezone: 'Europe/London',
    },
  })

  const johnsonFamilyGroup = await db.group.create({
    data: {
      name: 'Johnson Family',
      type: 'TEAM',
      ownerId: davidJohnson.id,
      defaultTimezone: 'Europe/London',
      remindersEnabled: true,
    },
  })

  console.log(`   ✓ Created TEAM group: ${johnsonFamilyGroup.name}`)

  const davidContact = await db.contact.create({
    data: {
      name: davidJohnson.name,
      email: davidJohnson.email,
      phone: davidJohnson.phone,
      timezone: 'Europe/London',
    },
  })

  await db.membership.create({
    data: {
      groupId: johnsonFamilyGroup.id,
      userId: davidJohnson.id,
      contactId: davidContact.id,
      role: 'OWNER',
    },
  })

  // Add David's birthday (upcoming in 12 days)
  const davidBirthday = addDays(new Date(), 12)
  await db.event.create({
    data: {
      contactId: davidContact.id,
      type: 'BIRTHDAY',
      date: new Date(davidBirthday.getFullYear(), davidBirthday.getMonth(), davidBirthday.getDate()),
      yearKnown: true,
      repeat: true,
      notes: 'Loves photography',
    },
  })

  const susanContact = await db.contact.create({
    data: {
      name: susanJohnson.name,
      email: susanJohnson.email,
      phone: susanJohnson.phone,
      timezone: 'Europe/London',
    },
  })

  await db.membership.create({
    data: {
      groupId: johnsonFamilyGroup.id,
      userId: susanJohnson.id,
      contactId: susanContact.id,
      role: 'ADMIN',
    },
  })

  // Add Susan's birthday
  await db.event.create({
    data: {
      contactId: susanContact.id,
      type: 'BIRTHDAY',
      date: new Date(1982, 6, 14), // July 14, 1982
      yearKnown: true,
      repeat: true,
      notes: 'Art lover',
    },
  })

  const peterContact = await db.contact.create({
    data: {
      name: peterJohnson.name,
      email: peterJohnson.email,
      phone: peterJohnson.phone,
      timezone: 'Europe/London',
    },
  })

  await db.membership.create({
    data: {
      groupId: johnsonFamilyGroup.id,
      userId: peterJohnson.id,
      contactId: peterContact.id,
      role: 'MEMBER',
    },
  })

  // Add Peter's birthday
  await db.event.create({
    data: {
      contactId: peterContact.id,
      type: 'BIRTHDAY',
      date: new Date(2010, 1, 28), // February 28, 2010
      yearKnown: true,
      repeat: true,
      notes: 'Sports fan',
    },
  })

  // Add wedding anniversary (shared event - both get excluded)
  const weddingAnniversary = addDays(new Date(), 20)
  await db.event.create({
    data: {
      contactId: davidContact.id,
      type: 'ANNIVERSARY',
      title: 'Wedding Anniversary',
      date: new Date(weddingAnniversary.getFullYear(), weddingAnniversary.getMonth(), weddingAnniversary.getDate()),
      yearKnown: true,
      repeat: true,
      notes: '15 years married!',
    },
  })

  await db.reminderRule.create({
    data: {
      groupId: johnsonFamilyGroup.id,
      offsets: [-7, -1],
      channels: {
        '-7': ['EMAIL'],
        '-1': ['EMAIL', 'SMS'],
      },
      sendHour: 8,
    },
  })

  await db.auditLog.create({
    data: {
      actorId: davidJohnson.id,
      groupId: johnsonFamilyGroup.id,
      method: 'CREATE',
      entity: 'Group',
      entityId: johnsonFamilyGroup.id,
      diffJson: { 
        new: { 
          name: johnsonFamilyGroup.name, 
          type: 'TEAM',
          note: 'Family members remind each other of special days'
        } 
      },
    },
  })

  console.log(`   ✓ Added 3 members (parents + child)`)
  console.log(`   ✓ Added 4 events (3 birthdays, 1 wedding anniversary)`)
  console.log(`   ✓ Set reminder rules: 7 days, 1 day`)
  console.log(`   → Result: When it's David's birthday:`)
  console.log(`             • Susan and Peter get reminders`)
  console.log(`             • David does NOT get reminded\n`)

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('=' .repeat(70))
  console.log('✨ Seed Data Summary\n')
  console.log('PRIMARY ACCOUNT:')
  console.log('  📧 e.monehin@live.com (YOUR ACCOUNT)\n')
  console.log('PERSONAL Groups (Owner receives ALL reminders):')
  console.log('  1. Tech Team Birthdays - YOU track 3 team members')
  console.log('  2. Marketing Department - Lisa tracks 2 dept members\n')
  console.log('TEAM Groups (Everyone reminds each other, EXCEPT the celebrated person):')
  console.log('  3. Smith Family Circle - 4 family members')
  console.log('  4. Johnson Family - 3 family members\n')
  console.log('Total Created:')
  console.log(`  • 4 Groups (2 PERSONAL, 2 TEAM)`)
  console.log(`  • 14 Users (including your account)`)
  console.log(`  • 14 Contacts`)
  console.log(`  • 14 Memberships`)
  console.log(`  • 13 Events`)
  console.log(`  • 4 Reminder Rules`)
  console.log('=' .repeat(70))
  console.log('\n🎉 Seed complete! You can now test both group types.')
  console.log('\n🔐 Login with: e.monehin@live.com (use magic link)')
  console.log('\n💡 Tip: Run the reminder scheduler to see how reminders are distributed:')
  console.log(`   npx tsx -e "import('./lib/services/reminder-scheduler').then(m => m.scheduleUpcomingReminders())"\n`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

