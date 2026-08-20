import 'server-only';
import { prisma } from './prisma';

/**
 * Analitika so'rovlari — xom SQL.
 *
 * Nega xom SQL: `count(*) FILTER (WHERE ...)`, `NULLIF`, `date_trunc` kabi
 * narsalarni Prisma API bilan yozib bo'lmaydi, agregatsiya esa Postgres
 * tomonida bir marta bajarilishi kerak.
 *
 * `::int` cast'lar MUHIM — Postgres `count()` bigint qaytaradi, u JSON'ga
 * serializatsiya bo'lmaydi.
 *
 * Bu so'rovlar faqat admin panelda ishlaydi (kuniga bir necha o'n so'rov),
 * shuning uchun cho'qqi trafikka ta'siri yo'q.
 */

export type Overview = {
  sessions: number;
  conversions: number;
  crPct: number;
  events: number;
  avgDwellSec: number;
};

export async function overview(hours = 24): Promise<Overview> {
  const [row] = await prisma.$queryRaw<
    { sessions: number; conversions: number; cr_pct: number }[]
  >`
    SELECT
      count(*)::int                                        AS sessions,
      count(*) FILTER (WHERE converted)::int               AS conversions,
      COALESCE(round(100.0 * count(*) FILTER (WHERE converted)
            / NULLIF(count(*), 0), 2), 0)::float8          AS cr_pct
    FROM "Session"
    WHERE "createdAt" >= now() - (${hours}::int * interval '1 hour')
  `;

  /**
   * O'RTACHA VAQT — sessiya bo'yicha, event bo'yicha EMAS.
   *
   * `exit` eventi sahifa yopilganda emas, tab YASHIRILGANDA yuboriladi va
   * odam qaytib kelsa yana takrorlanadi (`lib/track.ts`). Prod ma'lumotida
   * bu sessiyaga o'rtacha 3.5 ta `exit` beradi. To'g'ridan-to'g'ri
   * `avg("dwellMs")` olinsa, tab bilan ko'p o'ynagan bitta odam o'rtachani
   * o'ziga tortib ketardi — va har bir `exit` da `dwellMs` kattalashib
   * borgani uchun natija tasodifiy chiqardi.
   *
   * Shuning uchun avval HAR SESSIYA uchun eng katta `dwellMs` olinadi (ya'ni
   * u sahifada jami qancha turgani), keyin o'shalar o'rtachasi hisoblanadi.
   */
  const [ev] = await prisma.$queryRaw<{ events: number; dwell: number }[]>`
    WITH per_session AS (
      SELECT "sessionId", max("dwellMs") AS ms
      FROM "Event"
      WHERE type = 'exit' AND ts >= now() - (${hours}::int * interval '1 hour')
      GROUP BY "sessionId"
    )
    SELECT
      (SELECT count(*)::int FROM "Event"
        WHERE ts >= now() - (${hours}::int * interval '1 hour'))          AS events,
      COALESCE(round(avg(ms) / 1000.0), 0)::float8                        AS dwell
    FROM per_session
  `;

  return {
    sessions: row?.sessions ?? 0,
    conversions: row?.conversions ?? 0,
    crPct: row?.cr_pct ?? 0,
    events: ev?.events ?? 0,
    avgDwellSec: ev?.dwell ?? 0,
  };
}

/** Hozir onlayn: oxirgi 5 daqiqada eventi bo'lgan sessiyalar */
export async function onlineNow(): Promise<number> {
  const [row] = await prisma.$queryRaw<{ n: number }[]>`
    SELECT count(DISTINCT "sessionId")::int AS n
    FROM "Event" WHERE ts >= now() - interval '5 minutes'
  `;
  return row?.n ?? 0;
}

/**
 * SAHIFALAR KESIMI — analitikaning asosiy jadvali.
 *
 * Har bir landing alohida reklama qilinadi, shuning uchun asosiy savol
 * doim bitta: qaysi sahifaga qancha odam kirdi va o'sha sahifadagi tugma
 * necha marta bosildi.
 *
 * Ikki xil «kirdi» ATAYIN alohida sanaladi:
 *
 *   `entries`  — sessiya SHU sahifadan boshlangan (`Session.landedAt`).
 *                Reklamadan qancha odam kelganini aynan shu ko'rsatadi.
 *   `viewers`  — sahifani ochgan noyob sessiyalar (`Event.page`, `view`).
 *                `/6`, `/8`, `/9` da variant almashtirgich bor — bitta odam
 *                bir necha sahifani ko'rishi mumkin, o'shanda `viewers`
 *                `entries` dan katta bo'ladi.
 *
 * CR shu sahifaning O'Z ko'rsatkichlaridan hisoblanadi (bosgan odam /
 * ko'rgan odam), ya'ni sahifalarni bir-biri bilan solishtirsa bo'ladi.
 */
export type LandingRow = {
  page: string;
  entries: number;
  viewers: number;
  clicks: number;
  clickers: number;
  cr: number;
};

export async function landingPages(hours = 168): Promise<LandingRow[]> {
  return prisma.$queryRaw<LandingRow[]>`
    WITH ev AS (
      SELECT page,
             count(DISTINCT "sessionId") FILTER (WHERE type = 'view')::int AS viewers,
             count(*) FILTER (WHERE type = 'cta')::int                     AS clicks,
             count(DISTINCT "sessionId") FILTER (WHERE type = 'cta')::int  AS clickers
      FROM "Event"
      WHERE ts >= now() - (${hours}::int * interval '1 hour') AND page IS NOT NULL
      GROUP BY page
    ),
    se AS (
      SELECT "landedAt" AS page, count(*)::int AS entries
      FROM "Session"
      WHERE "createdAt" >= now() - (${hours}::int * interval '1 hour')
        AND "landedAt" IS NOT NULL
      GROUP BY "landedAt"
    )
    SELECT COALESCE(ev.page, se.page)                                  AS page,
           COALESCE(se.entries, 0)                                     AS entries,
           COALESCE(ev.viewers, 0)                                     AS viewers,
           COALESCE(ev.clicks, 0)                                      AS clicks,
           COALESCE(ev.clickers, 0)                                    AS clickers,
           COALESCE(round(100.0 * ev.clickers
                 / NULLIF(ev.viewers, 0), 2), 0)::float8               AS cr
    FROM ev FULL OUTER JOIN se ON se.page = ev.page
    ORDER BY COALESCE(ev.viewers, 0) DESC, COALESCE(se.entries, 0) DESC
  `;
}

/**
 * Qaysi tugma ko'p bosilgan.
 *
 * `page` bo'yicha ham guruhlanadi: bir xil `elId` bir necha sahifada
 * uchraydi (`support`, `foot_bot`, asosiy sahifadagi `hero_cta`), ularni
 * qo'shib yuborish qaysi sahifa ishlayotganini yashirib qo'yardi.
 */
export type ButtonRow = {
  page: string | null;
  elId: string | null;
  elText: string | null;
  clicks: number;
  users: number;
};

export async function topButtons(hours = 168, limit = 40): Promise<ButtonRow[]> {
  return prisma.$queryRaw<ButtonRow[]>`
    SELECT page, "elId", "elText",
           count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND ts >= now() - (${hours}::int * interval '1 hour')
    GROUP BY page, "elId", "elText"
    ORDER BY clicks DESC
    LIMIT ${limit}::int
  `;
}

/** Instagram kreativlari bo'yicha konversiya */
export type CreativeRow = {
  utmContent: string | null;
  utmCampaign: string | null;
  sessions: number;
  conv: number;
  cr: number;
};

export async function creatives(hours = 168, source = 'instagram'): Promise<CreativeRow[]> {
  return prisma.$queryRaw<CreativeRow[]>`
    SELECT "utmContent", "utmCampaign",
           count(*)::int                                    AS sessions,
           count(*) FILTER (WHERE converted)::int           AS conv,
           COALESCE(round(100.0 * count(*) FILTER (WHERE converted)
                 / NULLIF(count(*), 0), 2), 0)::float8      AS cr
    FROM "Session"
    WHERE "createdAt" >= now() - (${hours}::int * interval '1 hour')
      AND ("utmSource" = ${source} OR browser = 'instagram')
    GROUP BY "utmContent", "utmCampaign"
    HAVING count(*) >= 3
    ORDER BY sessions DESC
    LIMIT 40
  `;
}

/** Scroll voronkasi — qayerda tashlab ketishadi */
export type ScrollRow = { scrollPct: number; users: number };

export async function scrollFunnel(hours = 24): Promise<ScrollRow[]> {
  return prisma.$queryRaw<ScrollRow[]>`
    SELECT "scrollPct", count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'scroll' AND ts >= now() - (${hours}::int * interval '1 hour')
    GROUP BY "scrollPct"
    ORDER BY "scrollPct"
  `;
}

/** Qurilma / brauzer / manba taqsimoti */
export type BreakdownRow = { label: string; n: number };

export async function breakdown(
  field: 'device' | 'browser' | 'os' | 'utmSource',
  hours = 24,
): Promise<BreakdownRow[]> {
  const col =
    field === 'utmSource' ? '"utmSource"' : field === 'device' ? 'device' : field === 'os' ? 'os' : 'browser';

  // Ustun nomi qat'iy ro'yxatdan olinadi — SQL injection imkoni yo'q
  return prisma.$queryRawUnsafe<BreakdownRow[]>(
    `SELECT COALESCE(${col}, '—') AS label, count(*)::int AS n
     FROM "Session"
     WHERE "createdAt" >= now() - ($1::int * interval '1 hour')
     GROUP BY 1 ORDER BY n DESC LIMIT 12`,
    hours,
  );
}

/** Soatlar bo'yicha trafik — grafik uchun */
export type HourRow = { h: string; sessions: number; conv: number };

export async function hourly(hours = 24): Promise<HourRow[]> {
  return prisma.$queryRaw<HourRow[]>`
    SELECT to_char(date_trunc('hour', "createdAt"), 'DD.MM HH24:00') AS h,
           count(*)::int                                             AS sessions,
           count(*) FILTER (WHERE converted)::int                    AS conv
    FROM "Session"
    WHERE "createdAt" >= now() - (${hours}::int * interval '1 hour')
    GROUP BY date_trunc('hour', "createdAt")
    ORDER BY date_trunc('hour', "createdAt")
  `;
}

/** Oxirgi CTA bosishlar — real-time lenta */
export type RecentCta = {
  ts: Date;
  page: string | null;
  elId: string | null;
  elText: string | null;
  sessionId: string;
  utmContent: string | null;
  device: string | null;
};

export async function recentCta(limit = 12): Promise<RecentCta[]> {
  return prisma.$queryRaw<RecentCta[]>`
    SELECT e.ts, e.page, e."elId", e."elText", e."sessionId", s."utmContent", s.device
    FROM "Event" e
    JOIN "Session" s ON s.id = e."sessionId"
    WHERE e.type = 'cta'
    ORDER BY e.ts DESC
    LIMIT ${limit}::int
  `;
}

/** Sessiyalar ro'yxati */
export type SessionRow = {
  id: string;
  createdAt: Date;
  utmSource: string | null;
  utmContent: string | null;
  device: string | null;
  browser: string | null;
  converted: boolean;
  events: number;
  dwellSec: number;
  maxScroll: number;
};

export async function sessionList(hours = 24, limit = 60, onlyConverted = false): Promise<SessionRow[]> {
  return prisma.$queryRaw<SessionRow[]>`
    SELECT s.id, s."createdAt", s."utmSource", s."utmContent", s.device, s.browser, s.converted,
           count(e.id)::int                                                  AS events,
           COALESCE(round(max(e."dwellMs") / 1000.0), 0)::int                AS "dwellSec",
           COALESCE(max(e."scrollPct"), 0)::int                              AS "maxScroll"
    FROM "Session" s
    LEFT JOIN "Event" e ON e."sessionId" = s.id
    WHERE s."createdAt" >= now() - (${hours}::int * interval '1 hour')
      AND (${onlyConverted}::boolean = false OR s.converted)
    GROUP BY s.id
    ORDER BY s."createdAt" DESC
    LIMIT ${limit}::int
  `;
}

/** Bitta sessiyaning timeline'i */
export async function sessionTimeline(id: string) {
  const [session, events] = await Promise.all([
    prisma.session.findUnique({ where: { id } }),
    prisma.event.findMany({
      where: { sessionId: id },
      orderBy: { ts: 'asc' },
      take: 300,
      select: { type: true, elId: true, elText: true, scrollPct: true, dwellMs: true, ts: true },
    }),
  ]);
  return { session, events };
}

/* ══ BITTA SAHIFA KESIMI ═══════════════════════════════════════════════════
   `/admin/p/<slug>` uchun. Jadvaldagi qatorga bosilganda o'sha sahifaning
   o'z raqamlari ochiladi: kim keldi, qaysi tugmani bosdi, soat bo'yicha
   qanday taqsimlangan.

   Barcha so'rovlar `page` yoki `landedAt` bo'yicha filtrlanadi — ya'ni
   umumiy jadvaldagi qiymatlar bilan BIR XIL manbadan hisoblanadi va
   ular hech qachon bir-biriga zid chiqmaydi.                             */

/** Soat bo'yicha — faqat shu sahifaga tushgan sessiyalar */
export async function pageHourly(page: string, hours = 24): Promise<HourRow[]> {
  return prisma.$queryRaw<HourRow[]>`
    SELECT to_char(date_trunc('hour', "createdAt"), 'DD.MM HH24:00')  AS h,
           count(*)::int                                              AS sessions,
           count(*) FILTER (WHERE converted)::int                     AS conv
    FROM "Session"
    WHERE "landedAt" = ${page}
      AND "createdAt" >= now() - (${hours}::int * interval '1 hour')
    GROUP BY date_trunc('hour', "createdAt")
    ORDER BY date_trunc('hour', "createdAt")
  `;
}

/** Shu sahifadagi tugmalar — qaysi biri necha marta bosilgan */
export async function pageButtons(page: string, hours = 168): Promise<ButtonRow[]> {
  return prisma.$queryRaw<ButtonRow[]>`
    SELECT page, "elId", "elText",
           count(*)::int                    AS clicks,
           count(DISTINCT "sessionId")::int AS users
    FROM "Event"
    WHERE type = 'cta' AND page = ${page}
      AND ts >= now() - (${hours}::int * interval '1 hour')
    GROUP BY page, "elId", "elText"
    ORDER BY clicks DESC
  `;
}

/** Shu sahifaga tushgan oxirgi sessiyalar — `sessionList` bilan bir xil shakl */
export async function pageSessions(page: string, hours = 168, limit = 40): Promise<SessionRow[]> {
  return prisma.$queryRaw<SessionRow[]>`
    SELECT s.id, s."createdAt", s."utmSource", s."utmContent", s.device, s.browser, s.converted,
           count(e.id)::int                                                  AS events,
           COALESCE(round(max(e."dwellMs") / 1000.0), 0)::int                AS "dwellSec",
           COALESCE(max(e."scrollPct"), 0)::int                              AS "maxScroll"
    FROM "Session" s
    LEFT JOIN "Event" e ON e."sessionId" = s.id
    WHERE s."landedAt" = ${page}
      AND s."createdAt" >= now() - (${hours}::int * interval '1 hour')
    GROUP BY s.id
    ORDER BY s."createdAt" DESC
    LIMIT ${limit}::int
  `;
}

/** Qurilma/manba kesimi — faqat shu sahifa uchun */
export async function pageBreakdown(
  page: string,
  field: 'device' | 'browser' | 'utmSource' | 'country',
  hours = 168,
): Promise<BreakdownRow[]> {
  const col = { device: 'device', browser: 'browser', utmSource: '"utmSource"', country: 'country' }[field];
  return prisma.$queryRawUnsafe<BreakdownRow[]>(
    `SELECT COALESCE(${col}, '—') AS label, count(*)::int AS n
     FROM "Session"
     WHERE "landedAt" = $1 AND "createdAt" >= now() - ($2::int * interval '1 hour')
     GROUP BY 1 ORDER BY n DESC LIMIT 8`,
    page,
    hours,
  );
}
