import { prisma } from './config/prisma.js';
import bcrypt from 'bcryptjs';

const CLUBS = [
  { name: 'Music', code: 'CLUB_MUSIC', description: 'Vocalists, bands, and instrumental duels' },
  { name: 'MAD', code: 'CLUB_MAD', description: 'Music and Dance fusion society' },
  { name: 'Gaming', code: 'CLUB_GAMING', description: 'Esports, LAN cups, and game development' },
  { name: 'Astrophilia', code: 'CLUB_ASTROPHILIA', description: 'Astronomy, stargazing, and space science' },
  { name: 'Women Empowerment', code: 'CLUB_WOMEN_EMPOWERMENT', description: 'Leadership, advocacy, and social empowerment' },
  { name: 'Rotaract', code: 'CLUB_ROTARACT', description: 'Community service and youth fellowship' },
  { name: 'Literary', code: 'CLUB_LITERARY', description: 'Debates, poetry slams, and creative writing' },
  { name: 'Festival', code: 'CLUB_FESTIVAL', description: 'Major cultural fest management and curation' },
  { name: 'Social', code: 'CLUB_SOCIAL', description: 'Social initiatives, outreach, and awareness' },
  { name: 'Jatt Squad', code: 'CLUB_JATT_SQUAD', description: 'Bhangra, folk performance, and cultural dance' },
  { name: 'Team Energix', code: 'CLUB_TEAM_ENERGIX', description: 'Cheerleading, stunts, and energetic choreography' },
  { name: 'Sign4Dance', code: 'CLUB_SIGN4DANCE', description: 'Inclusive sign-language integrated dance performances' },
  { name: 'Advaya', code: 'CLUB_ADVAYA', description: 'Classical music and traditional Indian performing arts' },
  { name: 'Crew616', code: 'CLUB_CREW616', description: 'Urban hip-hop crew and street battle squad' },
  { name: 'Self Defence', code: 'CLUB_SELF_DEFENCE', description: 'Martial arts, personal safety workshops, and fitness' },
  { name: 'Fashion', code: 'CLUB_FASHION', description: 'Couture design, runway choreography, and styling' },
  { name: 'Creative Arts', code: 'CLUB_CREATIVE_ARTS', description: 'Painting, sculpting, fine arts, and digital illustrations' },
  { name: 'Dance', code: 'CLUB_DANCE', description: 'Western, fusion, and contemporary dance groups' },
  { name: 'Movies and Dramatics', code: 'CLUB_MOVIES_DRAMATICS', description: 'Theatre, stage plays, street plays (nukkad), and filmmaking' },
  { name: 'Quiz', code: 'CLUB_QUIZ', description: 'General knowledge, trivia, and inter-college quiz duels' },
];

const CORE_DOMAINS = [
  { name: 'Treasurer', code: 'DOMAIN_TREASURER', description: 'Financial planning, expense approvals, and budget allocation' },
  { name: 'Social Media', code: 'DOMAIN_SOCIAL_MEDIA', description: 'Digital campaigns, Instagram/X content, and engagement' },
  { name: 'Transportation & Accommodation', code: 'DOMAIN_TRANSPORT_ACCOMMODATION', description: 'Fleet management, guest rooms, and travel logistics' },
  { name: 'Public Relations', code: 'DOMAIN_PR', description: 'Press releases, guest reception, and institutional relations' },
  { name: 'Media', code: 'DOMAIN_MEDIA', description: 'Official event photography, videography, and asset archives' },
  { name: 'Publicity & Content', code: 'DOMAIN_PUBLICITY_CONTENT', description: 'Posters, slogans, banners, and copywriting' },
  { name: 'Emcee', code: 'DOMAIN_EMCEE', description: 'Stage hosts, announcements, and program anchoring' },
  { name: 'Tech & Graphic Design', code: 'DOMAIN_TECH_GRAPHICS', description: 'Portal maintenance, UI graphics, and stage visuals' },
  { name: 'Operations & Resource Management', code: 'DOMAIN_OPERATIONS_RESOURCES', description: 'Stage setup, audio/visual gear, and venue allocation' },
  { name: 'Certificate & Prize Distribution', code: 'DOMAIN_CERTIFICATES_PRIZES', description: 'Winner trophies, verification, and PDF certificate issuance' },
  { name: 'Sponsorship', code: 'DOMAIN_SPONSORSHIP', description: 'Corporate leads, pitch decks, and brand partnership deals' },
  { name: 'Discipline', code: 'DOMAIN_DISCIPLINE', description: 'Crowd management, gate security pass verification, and safety' },
  { name: 'Hospitality', code: 'DOMAIN_HOSPITALITY', description: 'Judge catering, VIP refreshments, and green room management' },
];

export async function main() {
  console.log('🌱 Seeding DSA Operations & Student Organization Management Ecosystem...');

  // 1. Create Core Organizations (20 Clubs + 13 Core Domains)
  for (const c of CLUBS) {
    await prisma.organization.upsert({
      where: { code: c.code },
      update: {},
      create: {
        name: c.name,
        code: c.code,
        type: 'CLUB',
        description: c.description,
      },
    });
  }

  for (const d of CORE_DOMAINS) {
    await prisma.organization.upsert({
      where: { code: d.code },
      update: {},
      create: {
        name: d.name,
        code: d.code,
        type: 'CORE_DOMAIN',
        description: d.description,
      },
    });
  }

  console.log('✅ Created 20 Clubs & 13 Core Domains.');

  // 2. Create Initial Core Users
  const passwordHash = await bcrypt.hash('alohomora2026', 10);

  const director = await prisma.user.upsert({
    where: { email: 'director.dsa@srmist.edu.in' },
    update: {},
    create: {
      email: 'director.dsa@srmist.edu.in',
      passwordHash,
      fullName: 'Dr. T. Rajan (Director DSA)',
      studentId: 'EMP-DSA-001',
      college: 'SRMIST Administration',
    },
  });

  const culturalSec = await prisma.user.upsert({
    where: { email: 'cultural_sec@srmist.edu.in' },
    update: {},
    create: {
      email: 'cultural_sec@srmist.edu.in',
      passwordHash,
      fullName: 'Vikramaditya S (Cultural Secretary)',
      studentId: 'RA2211003010999',
      college: 'SRMIST Kattankulathur',
    },
  });

  const musicConvenor = await prisma.user.upsert({
    where: { email: 'aravind_k@srmist.edu.in' },
    update: {},
    create: {
      email: 'aravind_k@srmist.edu.in',
      passwordHash,
      fullName: 'Aravind K',
      studentId: 'RA2211003010482',
      college: 'SRMIST Kattankulathur',
    },
  });

  // Fetch Orgs for Membership Linking
  const musicClub = await prisma.organization.findUnique({ where: { code: 'CLUB_MUSIC' } });
  const socialMediaDomain = await prisma.organization.findUnique({ where: { code: 'DOMAIN_SOCIAL_MEDIA' } });
  const opsDomain = await prisma.organization.findUnique({ where: { code: 'DOMAIN_OPERATIONS_RESOURCES' } });

  // 3. Create Multi-Role Memberships
  if (musicClub) {
    // Admin / Global Director Membership
    await prisma.organizationMembership.upsert({
      where: { userId_organizationId: { userId: director.id, organizationId: musicClub.id } },
      update: {},
      create: { userId: director.id, organizationId: musicClub.id, role: 'DIRECTOR', title: 'Director of Student Affairs' },
    });

    // Cultural Secretary Global Membership
    await prisma.organizationMembership.upsert({
      where: { userId_organizationId: { userId: culturalSec.id, organizationId: musicClub.id } },
      update: {},
      create: { userId: culturalSec.id, organizationId: musicClub.id, role: 'CULTURAL_SECRETARY', title: 'Overall Cultural Secretary' },
    });

    // Aravind K: Music Club Convenor
    await prisma.organizationMembership.upsert({
      where: { userId_organizationId: { userId: musicConvenor.id, organizationId: musicClub.id } },
      update: {},
      create: { userId: musicConvenor.id, organizationId: musicClub.id, role: 'CLUB_CONVENOR', title: 'Music Club Convenor' },
    });
  }

  if (socialMediaDomain) {
    // Aravind K: ALSO Committee Member in Social Media Core Domain!
    await prisma.organizationMembership.upsert({
      where: { userId_organizationId: { userId: musicConvenor.id, organizationId: socialMediaDomain.id } },
      update: {},
      create: { userId: musicConvenor.id, organizationId: socialMediaDomain.id, role: 'COMMITTEE_MEMBER', title: 'Social Media Campaign Lead' },
    });
  }

  console.log('✅ Created Core Users and Multi-Organizational Memberships.');

  // 4. Create Initial Demonstration Event Project & Tasks
  if (musicClub && opsDomain) {
    const event = await prisma.event.upsert({
      where: { slug: 'triwizard-yule-ball-2026' },
      update: {},
      create: {
        title: "MILAN '26 - Triwizard Yule Ball & Battle of Bands",
        slug: 'triwizard-yule-ball-2026',
        description: "Grand inaugural night featuring celebrity orchestra, sound stage, and 20 inter-college band duels.",
        leadOrganizationId: musicClub.id,
        collaboratorOrgIds: JSON.stringify([opsDomain.id, socialMediaDomain?.id].filter(Boolean)),
        venue: 'TP Ganesan Main Auditorium',
        startDate: new Date('2026-02-19T09:00:00Z'),
        endDate: new Date('2026-02-19T22:00:00Z'),
        status: 'PREPARATION',
        expectedParticipants: 6000,
      },
    });

    // Tasks for Event
    await prisma.task.createMany({
      data: [
        {
          title: 'Finalize Sound Systems & Stage Amplifiers',
          description: 'Coordinate with Operations Domain for 12,000W line-array speaker rig.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          creatorId: culturalSec.id,
          assigneeId: musicConvenor.id,
          organizationId: musicClub.id,
          eventId: event.id,
        },
        {
          title: 'Publish Social Media Teaser Reel',
          description: 'Create 30s Instagram teaser video featuring previous band winners.',
          status: 'TODO',
          priority: 'MEDIUM',
          creatorId: musicConvenor.id,
          assigneeId: musicConvenor.id,
          organizationId: socialMediaDomain?.id || musicClub.id,
          eventId: event.id,
        },
      ],
    });

    // Initial Inventory Resource
    await prisma.resource.upsert({
      where: { id: 'res-tp-ganesan-auditorium' },
      update: {},
      create: {
        id: 'res-tp-ganesan-auditorium',
        name: 'TP Ganesan Main Auditorium Hall A',
        category: 'Venue',
        totalQuantity: 1,
        organizationId: opsDomain.id,
      },
    });
  }

  console.log('✨ DSA Ecosystem Seeding Complete!');
}

if (process.argv[1].endsWith('seed.ts')) {
  main()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
